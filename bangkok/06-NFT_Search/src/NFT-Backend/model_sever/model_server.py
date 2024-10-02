import numpy as np
import torch
import csv
import json
from pathlib import Path
from PIL import Image
import open_clip
import faiss
import pandas as pd
import os
import time
from flask import Flask, request, jsonify

app = Flask(__name__)

os.environ["CUDA_VISIBLE_DEVICES"] = "0,1"

class Base_Model_and_Function():
    """
    基础模型和功能类。
    
    """
    def __init__(self, model_path, GPU_ID = 0, tokenizer_type = "ViT-L-14"):
        self.GPU_ID = GPU_ID
        self.device = torch.device(f"cuda:{self.GPU_ID}" if torch.cuda.is_available() else "cpu")
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(tokenizer_type, pretrained=model_path, device=self.device)
        self.tokenizer = open_clip.get_tokenizer(tokenizer_type)
        self.model.to(self.device)

    def extract_txt_features(self, input_text):
        """
        提取文本特征。

        """
        text = self.tokenizer(input_text).cuda(device=self.device)
        with torch.no_grad(), torch.cuda.amp.autocast():
            text_features = self.model.encode_text(text)
            text_features /= text_features.norm(dim=-1, keepdim=True)
            return text_features

    def extract_img_features(self, input_image):
        """
        提取图片特征。
        """
        img = self.preprocess(input_image).unsqueeze(0).cuda(device=self.device)
        with torch.no_grad(), torch.cuda.amp.autocast():
            image_features = self.model.encode_image(img)
            image_features /= image_features.norm(dim=-1, keepdim=True)
            return image_features

class Union_Feature_and_Index():
    def __init__(self,top100_img_features_path, top100_caption_features_path, top100_index_database_path, GPU_ID=1):
        self.GPU_ID = GPU_ID
        self.top100_img_feature_index = load_faiss_index_to_GPU(top100_img_features_path, GPU_ID=self.GPU_ID)
        self.top100_caption_feature_index = load_faiss_index_to_GPU(top100_caption_features_path, GPU_ID=self.GPU_ID)
        self.NFT_INDEX_DATABASE = pd.read_csv(top100_index_database_path)

class Process_Input_Caption():
    def __init__(self, feature_base_path, union_feature_and_index, GPU_ID=0):
        self.feature_base_path = Path(feature_base_path)
        self.top100_img_feature_index = union_feature_and_index.top100_img_feature_index
        self.top100_caption_feature_index = union_feature_and_index.top100_caption_feature_index
        self.NFT_INDEX_DATABASE = union_feature_and_index.NFT_INDEX_DATABASE
        self.GPU_ID = GPU_ID

    # 定义在全局索引中检索的函数,也就是第一阶段搜索
    def stage1_search(self, input_caption_features, mode, k=2048):
        search_results = txt_search(input_caption_features, mode, img_feature_index = self.top100_img_feature_index, caption_feature_index = self.top100_caption_feature_index, k = k)
        NFT_name_list = self.NFT_INDEX_DATABASE["NFT_name"]
        # 概率聚合
        aggregated_prob = aggregate_probability(search_results, NFT_name_list)
        return aggregated_prob

    def stage2_search(self, aggregated_prob, input_caption_features, mode, k=30):
        show_data = []
        # 第二阶段搜索
        for item in aggregated_prob[:10]:
            show_data_item = []
            NFT_name = item[0]
            result_data = text_search_within_a_collection(input_caption_features, self.feature_base_path, NFT_name, mode, k, GPU_ID=self.GPU_ID)
            # 将NFT内部搜索的结果加入到展示数据中
            show_data.append(result_data)
        # 如果show_data长度少于10，补充空数据
        while len(show_data) < 10:
            show_data.append([])
        return show_data

class Process_Input_IMG():
    def __init__(self, feature_base_path, union_feature_and_index, GPU_ID=0):
        self.feature_base_path = Path(feature_base_path)
        self.top100_img_feature_index = union_feature_and_index.top100_img_feature_index
        self.top100_caption_feature_index = union_feature_and_index.top100_caption_feature_index
        self.NFT_INDEX_DATABASE = union_feature_and_index.NFT_INDEX_DATABASE
        self.GPU_ID = GPU_ID
    
    # 定义在全局索引中检索的函数,也就是第一阶段搜索
    def stage1_search(self, input_img_features, mode, k=2048):
        search_results = img_search(input_img_features, mode, img_feature_index = self.top100_img_feature_index, caption_feature_index = self.top100_caption_feature_index, k = k)
        NFT_name_list = self.NFT_INDEX_DATABASE["NFT_name"]
        # 概率聚合
        aggregated_prob = aggregate_probability(search_results, NFT_name_list)
        return aggregated_prob

    def stage2_search(self, aggregated_prob, input_img_features, mode, k=30):
        show_data = []
        # 第二阶段搜索
        for item in aggregated_prob[:10]:
            show_data_item = []
            NFT_name = item[0]
            result_data = img_search_within_a_collection(input_img_features, self.feature_base_path, NFT_name, mode, k, GPU_ID=self.GPU_ID)
            # 将NFT内部搜索的结果加入到展示数据中
            show_data.append(result_data)
        # 如果show_data长度少于10，补充空数据
        while len(show_data) < 10:
            show_data.append([])
        return show_data


def txt_search(input_features, mode, img_feature_index = None, caption_feature_index = None, k=30):
    """
    文本-图片搜索。
    将输入的文本作为查询进行搜索，返回搜索结果。

    Args:
        input_features (torch.Tensor): 输入的文本特征
        mode (str): 搜索模式
        img_feature_index (faiss.Index): 图片特征索引
        caption_feature_index (faiss.Index): 文本特征索引
        k (int): 返回结果数量

    Return:
        list: 搜索结果列表，其中每一项为一个（索引，概率）样式的元组
    
    """
    if mode == "txt-img":
        P_img, I_img = img_feature_index.search(input_features.cpu().numpy().astype('float32'), k)
        search_results = list(zip(I_img[0], P_img[0]))

    elif mode == "txt-txt":
        P_caption, I_caption = caption_feature_index.search(input_features.cpu().numpy().astype('float32'), k)
        search_results = list(zip(I_caption[0], P_caption[0]))

    elif mode == "max-prob":
        P_img, I_img = img_feature_index.search(input_features.cpu().numpy().astype('float32'), k)
        P_caption, I_caption = caption_feature_index.search(input_features.cpu().numpy().astype('float32'), k)
        
        # 以索引为key，概率为value，构建字典
        txt_img_search_result = {k: v for k, v in zip(I_img[0], P_img[0])}
        txt_caption_search_result = {k: v for k, v in zip(I_caption[0], P_caption[0])}
        
        # 取出图文搜索与文文搜索的交集
        intersection = set(txt_img_search_result.keys()) & set(txt_caption_search_result.keys())
        
        # 取出交集中的索引，计算两个搜索结果的概率最大值为最终结果
        result = {}
        for idx in intersection:
            result[idx] = max(txt_img_search_result[idx], txt_caption_search_result[idx])

        # 从txt_img_search_result与txt_caption_search_result中取出交集以外的索引
        img_search_result = {k: v for k, v in txt_img_search_result.items() if k not in intersection}
        caption_search_result = {k: v for k, v in txt_caption_search_result.items() if k not in intersection}

        # 汇总结果列表，其中每一项为一个（索引，概率）样式的元组
        search_results = list(result.items()) + list(img_search_result.items()) + list(caption_search_result.items())

        # 按概率降序排列
        search_results.sort(key=lambda x: x[1], reverse=True)
    else:
        raise ValueError("Invalid mode")
    
    return search_results[:k]

def img_search(input_features, mode, img_feature_index = None, caption_feature_index = None, k=30):
    """
    图像-图片搜索。
    将输入的图片作为查询进行搜索，返回搜索结果。

    Args:
        input_features (torch.Tensor): 输入的图片特征
        mode (str): 搜索模式
        img_feature_index (faiss.Index): 图片特征索引
        caption_feature_index (faiss.Index): 文本特征索引
        k (int): 返回结果数量

    Return:
        list: 搜索结果列表，其中每一项为一个（索引，概率）样式的元组
    
    """

    if mode == "txt-img":
        P_caption, I_caption = caption_feature_index.search(input_features.cpu().numpy().astype('float32'), k)
        search_results = list(zip(I_caption[0], P_caption[0]))


    elif mode == "img-img":
        P_img, I_img = img_feature_index.search(input_features.cpu().numpy().astype('float32'), k)
        search_results = list(zip(I_img[0], P_img[0]))

    elif mode == "max-prob":
        P_img, I_img = img_feature_index.search(input_features.cpu().numpy().astype('float32'), k)
        P_caption, I_caption = caption_feature_index.search(input_features.cpu().numpy().astype('float32'), k)
        
        # 以索引为key，概率为value，构建字典
        txt_img_search_result = {k: v for k, v in zip(I_img[0], P_img[0])}
        txt_caption_search_result = {k: v for k, v in zip(I_caption[0], P_caption[0])}
        
        # 取出图文搜索与文文搜索的交集
        intersection = set(txt_img_search_result.keys()) & set(txt_caption_search_result.keys())
        
        # 取出交集中的索引，计算两个搜索结果的概率最大值为最终结果
        result = {}
        for idx in intersection:
            result[idx] = max(txt_img_search_result[idx], txt_caption_search_result[idx])

        # 从txt_img_search_result与txt_caption_search_result中取出交集以外的索引
        img_search_result = {k: v for k, v in txt_img_search_result.items() if k not in intersection}
        caption_search_result = {k: v for k, v in txt_caption_search_result.items() if k not in intersection}

        # 汇总结果列表，其中每一项为一个（索引，概率）样式的元组
        search_results = list(result.items()) + list(img_search_result.items()) + list(caption_search_result.items())

        # 按概率降序排列
        search_results.sort(key=lambda x: x[1], reverse=True)
    else:
        raise ValueError("Invalid mode")
    
    return search_results[:k]

def text_search_within_a_collection(input_caption_features, feature_base_path, nft_name, mode, k=30, GPU_ID=0):
    """
    在指定的NFT内部进行文本搜索。

    """
    feature_base_path = Path(feature_base_path)
    result_data = []
    # 加载对应的图片和caption索引
    img_feature_index_path = feature_base_path.joinpath(nft_name, "image_features.index").as_posix()
    img_feature_index = load_faiss_index_to_GPU(img_feature_index_path, GPU_ID=GPU_ID)
    caption_feature_index_path = feature_base_path.joinpath(nft_name, "caption_features.index").as_posix()
    caption_feature_index = load_faiss_index_to_GPU(caption_feature_index_path, GPU_ID=GPU_ID)
    search_results = txt_search(input_caption_features, mode, img_feature_index, caption_feature_index, k)   
    # 加载索引数据库
    csv_path = feature_base_path.joinpath(nft_name, nft_name + "_OSS_index.csv").as_posix()
    database_item = pd.read_csv(csv_path)

    # 按照索引取出图片路径，caption, NFT名称 和 token_ID
    for item in search_results:
        index = item[0]
        token_ID = database_item.iloc[index]['token_ID']
        prob = item[1]
        img_path = database_item.iloc[index]['filepath']
        caption = database_item.iloc[index]['caption']
        chain_ID = database_item.iloc[index]['chain_ID']
        contract_address = database_item.iloc[index]['contract_address']
        # result_data.append((img_path, f"Token_ID: {nft_name}#{token_ID} | Probability: {prob} | Caption: {caption}"))
        result_data.append({"filepath":img_path,
                            "caption" : caption,
                            "nft_name" : nft_name,
                            "token_ID" : str(token_ID),
                            "chain_ID" : str(chain_ID),
                            "contract_address" : contract_address,
                            "probability" : str(prob),
                            })
    return result_data

def img_search_within_a_collection(input_img_features, feature_base_path, nft_name, mode, k=30, GPU_ID=0):
    """
    在指定的NFT内部进行图片搜索。
    
    """
    feature_base_path = Path(feature_base_path)
    result_data = []
    # 加载对应的图片和caption索引
    img_feature_index_path = feature_base_path.joinpath(nft_name, "image_features.index").as_posix()
    img_feature_index = load_faiss_index_to_GPU(img_feature_index_path, GPU_ID=GPU_ID)
    caption_feature_index_path = feature_base_path.joinpath(nft_name, "caption_features.index").as_posix()
    caption_feature_index = load_faiss_index_to_GPU(caption_feature_index_path, GPU_ID=GPU_ID)
    search_results = img_search(input_img_features, mode, img_feature_index, caption_feature_index, k)   
    # 加载索引数据库
    csv_path = feature_base_path.joinpath(nft_name, nft_name + "_OSS_index.csv").as_posix()
    database_item = pd.read_csv(csv_path)

    # 按照索引取出图片路径，caption, NFT名称 和 token_ID
    for item in search_results:
        index = item[0]
        token_ID = database_item.iloc[index]['token_ID']
        prob = item[1]
        img_path = database_item.iloc[index]['filepath']
        caption = database_item.iloc[index]['caption']
        chain_ID = database_item.iloc[index]['chain_ID']
        contract_address = database_item.iloc[index]['contract_address']
        # result_data.append((img_path, f"Token_ID: {nft_name}#{token_ID} | Probability: {prob} | Caption: {caption}"))
        result_data.append({"filepath":img_path,
                            "caption" : caption,
                            "nft_name" : nft_name,
                            "token_ID" : str(token_ID),
                            "chain_ID" : str(chain_ID),
                            "contract_address" : contract_address,
                            "probability" : str(prob),
                            })
    return result_data



@app.route('/caption_global_search', methods=['POST'])
def caption_global_search():
    # 解析出用户输入的文本和搜索模式
    data = request.json
    input_caption = data.get('input_caption')
    mode = data.get('mode')
    # 处理用户输入的文本词汇
    input_caption_features = base_model_and_function.extract_txt_features(input_caption)
    # 第一阶段搜索
    aggregated_prob = process_input_caption.stage1_search(input_caption_features, mode)
    # 第二阶段搜索
    show_data = process_input_caption.stage2_search(aggregated_prob, input_caption_features, mode)
    # return show_data
    return jsonify(show_data)

@app.route('/caption_directed_search', methods=['POST'])
def caption_directed_search():
    # 解析出用户输入的文本和搜索模式
    data = request.json
    input_caption = data.get('input_caption')
    mode = data.get('mode')
    nft_name = data.get('nft_name')
    # 处理用户输入的文本词汇
    input_caption_features = base_model_and_function.extract_txt_features(input_caption)
    # 第二阶段搜索
    show_data = text_search_within_a_collection(input_caption_features, feature_base_path, nft_name, mode, k=60)
    show_data = [show_data] + [[] for _ in range(9)]
    return jsonify(show_data)

@app.route('/img_global_search', methods=['POST'])
def img_global_search():
    # 检查是否有文件被上传
    if 'input_img' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['input_img']
    # 如果用户没有选择文件，浏览器可能会提交一个没有文件名的空部分
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    if file:
        # 将接收到的图片文件转换为 Pillow 图像对象
        image = Image.open(file.stream)
        # 将图像对象转换为所需的格式（例如numpy数组）
        input_img_features = base_model_and_function.extract_img_features(image)
        mode = request.form['mode']
        # 第一阶段搜索
        aggregated_prob = process_input_img.stage1_search(input_img_features, mode)
        # 第二阶段搜索
        show_data = process_input_img.stage2_search(aggregated_prob, input_img_features, mode)
        return jsonify(show_data)

@app.route('/img_directed_search', methods=['POST'])
def img_directed_search():
    # 检查是否有文件被上传
    if 'input_img' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['input_img']
    # 如果用户没有选择文件，浏览器可能会提交一个没有文件名的空部分
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    if file:
        # 将接收到的图片文件转换为 Pillow 图像对象
        image = Image.open(file.stream)
        # 将图像对象转换为所需的格式（例如numpy数组）
        input_img_features = base_model_and_function.extract_img_features(image)
        mode = request.form['mode']
        nft_name = request.form['nft_name']
        # 第二阶段搜索
        show_data = img_search_within_a_collection(input_img_features, feature_base_path, nft_name, mode, k=60)
        show_data = [show_data] + [[] for _ in range(9)]
        return jsonify(show_data)
    

@app.route('/upload_img', methods=['POST'])
def upload_img():
    """
    @brief 用户上传图片到服务器的 /root/TokenSoBackend/temp/ 文件夹下，文件名用原始文件名命名，然后函数返回该图片在服务器中的路径
    @return JSON 返回图片在服务器中的路径
    """
    # 定义保存路径
    save_folder = Path('/root/TokenSoBackend/temp/')
    
    # 检查保存路径是否存在，不存在则创建
    if not save_folder.exists():
        save_folder.mkdir(parents=True)
    
    # 获取上传的文件
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400
    
    if file:
        # 使用原始文件名保存文件
        file_path = save_folder.joinpath(file.filename)
        file.save(file_path.as_posix())
        public_url = f"http://region-42.seetacloud.com:58749/uploads/{file.filename}"
        return jsonify({"file_path": public_url}), 200
    else:
        return jsonify({"error": "Failed to upload file"}), 400



feature_base_path = "/root/autodl-tmp/NFT1000_features/"
model_path = "/root/autodl-tmp/models/epoch_latest.pt"

base_model_and_function = Base_Model_and_Function(model_path=model_path, GPU_ID=0)

top100_img_features_path = "/root/autodl-tmp/NFT1000_features/img_gathered_features.index"
top100_caption_features_path = "/root/autodl-tmp/NFT1000_features/caption_gathered_features.index"
top100_index_database_path = "/root/autodl-tmp/NFT1000_features/Top100_extraction_projects_OSS_index.csv"

union_feature_and_index = Union_Feature_and_Index(top100_img_features_path, top100_caption_features_path, top100_index_database_path, GPU_ID=1)

process_input_caption = Process_Input_Caption(feature_base_path, union_feature_and_index, GPU_ID=0)
process_input_img = Process_Input_IMG(feature_base_path, union_feature_and_index, GPU_ID=0)

if __name__ == "__main__":

    app.run(host='0.0.0.0', port=6006)