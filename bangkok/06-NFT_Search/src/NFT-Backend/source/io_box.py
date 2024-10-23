from pathlib import Path
import pandas as pd
import json
from tqdm import tqdm
import numpy as np
import csv

def check_dir(dir_path):
    """
    检查文件夹路径是否存在，不存在则创建

    Args:
        dir_path (str): 待检查的文件夹路径
    """
    if not dir_path.exists():
        try:
            dir_path.mkdir(parents=True)
        except Exception as e:
            raise e

def load_json(json_path):
    """
    以只读的方式打开json文件

    Args:
        config_path: json文件路径

    Returns:
        A dictionary

    """
    with open(json_path, 'r', encoding='UTF-8') as f:
        return json.load(f)
    
def save_json(save_path, data):
    """
    Saves the data to a file with the given filename in the given path

    Args:
        :param save_path: The path to the folder where you want to save the file
        :param filename: The name of the file to save
        :param data: The data to be saved

    """
    with open(save_path, 'w', encoding='UTF-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

