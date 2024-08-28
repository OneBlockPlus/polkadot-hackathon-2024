from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy import create_engine
from app.config.config import Config
from app.data.base import Base
from app.models.music_data import MusicData

engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    import app.models.music_data  # 确保导入所有模型
    Base.metadata.create_all(bind=engine)

# 调用 init_db 函数来创建表
init_db()

def save_to_db(task_id, music_info):
    session = Session()
    
    music_data = MusicData(
        task_id=task_id,
        music_id=music_info["id"],
        audio_url=music_info["audio_url"],
        image_url=music_info["image_url"],
        prompt=music_info["prompt"],
        title=music_info["title"],
        style=music_info["style"],
        duration=music_info["duration"],
        create_time=music_info["create_time"]
    )
    
    session.add(music_data)
    session.commit()
    session.close()
