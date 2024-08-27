import os

class Config:
    # MySQL 配置
    MYSQL_HOST = '127.0.0.1'
    MYSQL_USER = 'flymusic'
    MYSQL_PASSWORD = 'S6jBRBaKCSCDZyJr'
    MYSQL_DB = 'flymusic'
    
    # API 密钥配置
    SUNO_API_KEY ='sk-h6fpt7sq2xnrwlnkpde2zfhcx2ldc3y8'

    # 回调URL
    CALLBACK_URL = 'http://47.106.245.127:9988/AI/callback'


    SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
