from app.data.base import Base
from sqlalchemy import Column, String, Integer, Float, DateTime
import datetime

class MusicData(Base):
    __tablename__ = 'music_data'

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(String, nullable=False)
    music_id = Column(String, nullable=False)
    audio_url = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    prompt = Column(String, nullable=False)
    title = Column(String, nullable=False)
    style = Column(String, nullable=False)
    duration = Column(Float, nullable=False)
    create_time = Column(DateTime, default=datetime.datetime.utcnow)