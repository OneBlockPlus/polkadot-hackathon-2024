import requests
from app.config.config import Config
from app.data.database import save_to_db
import logging

def generate_music(title, lyrics, style, callback_url):
    api_url = "https://api.lumaapi.org/api/suno/generate"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {Config.SUNO_API_KEY}'
    }

    payload = {
        "callBackUrl": callback_url,
        "instrumental": False,
        "customMode": True,
        "style": style,
        "prompt": lyrics,
        "title": title
    }

    try:
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()  # 如果响应状态码不是200，抛出HTTPError
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        logging.error(f'HTTP error occurred: {http_err}')  # 记录HTTP错误
        raise
    except Exception as err:
        logging.error(f'Other error occurred: {err}')  # 记录其他错误
        raise

def save_music_info(task_id, music_info):
    save_to_db(task_id, music_info)
