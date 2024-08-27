from flask import Blueprint, request, jsonify
from app.models.AI import generate_music, save_music_info
from app.config.config import Config
import requests
from app.data.database import db_session
from app.models.music_data import MusicData

# 创建一个 Blueprint
bp = Blueprint('AI', __name__, url_prefix='/AI')


task_data = {}

# 生成音乐的API接口
@bp.route('/generate', methods=['POST'])
def generate_music_route():
    try:
        data = request.json
        callback_url = data.get('callBackUrl')
        title = data.get('title')
        lyrics = data.get('prompt')
        style = data.get('style')
        
        
        print(f"生成音乐的参数: {title}, {lyrics}, {style}, {callback_url}")
        response = generate_music(title, lyrics, style, callback_url)
        task_id = response.get('data', {}).get('task_id')

        task_data[task_id] = {
            "music_data": [],
            "callback_url": callback_url
        }

        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# AI音乐生成回调处理接口
@bp.route('/callback', methods=['POST'])
def callback_route():
    print("进入回调函数")                                                           
    try:
        data = request.json
        task_id = data.get('data', {}).get('task_id')
        callback_type = data.get('data', {}).get('callbackType')
        music_data = data.get('data', {}).get('data')

        if task_id not in task_data:
            return jsonify({'error': '任务ID不存在'}), 404

        if music_data:
            for music_item in music_data:
                task_data[task_id]["music_data"].extend(music_item)

        if callback_type == 'complete':
            longest_music = max(task_data[task_id]["music_data"], key=lambda x: x['duration'])

            result = {
                "id": longest_music["id"],
                "audio_url": longest_music["audio_url"],
                "image_url": longest_music["image_url"],
                "prompt": longest_music["prompt"],
                "title": longest_music["title"],
                "style": longest_music["tags"],  
                "duration": longest_music["duration"],
                "create_time": longest_music["createTime"]
            }

            
            callback_url = task_data[task_id].get("callback_url")
            if callback_url:
                 response = requests.post(callback_url, json=result)
                 if response.status_code != 200:
                     return jsonify({'error': 'Failed to notify music generate result'}), 500

            save_music_info(result)

            return jsonify({'message': '音乐生成完成，参数已接收并保存'}), 200

        return jsonify({'message': '回调请求已接收'}), 200  
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/get/<task_id>', methods=['GET'])
def get_music_info(task_id):
    try:
        music_data = db_session.query(MusicData).filter(MusicData.task_id == task_id).all()
        if not music_data:
            return jsonify({'error': '任务ID不存在'}), 404

        music_info_list = [{
            "task_id": music.task_id,
            "music_id": music.music_id,
            "audio_url": music.audio_url,
            "image_url": music.image_url,
            "prompt": music.prompt,
            "title": music.title,
            "style": music.style,
            "duration": music.duration,
            "create_time": music.create_time
        } for music in music_data]

        return jsonify({'task_id': task_id, 'music_data': music_info_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
