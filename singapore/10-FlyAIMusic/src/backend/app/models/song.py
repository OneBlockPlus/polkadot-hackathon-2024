from app.config.database import Base
from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime

class Song(Base):
    __tablename__ = 'songs'

    song_id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    artist_id = Column(String, ForeignKey('artists.artist_id'), nullable=False)
    album_id = Column(String, ForeignKey('albums.album_id'), nullable=False)
    duration = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    genre = Column(String, nullable=False)
    lyrics = Column(Text)
    audio_url = Column(String)
    nft_status = Column(String, default="not_minted")
    token_id = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    artist = relationship("Artist", back_populates="songs")
    album = relationship("Album", back_populates="songs")