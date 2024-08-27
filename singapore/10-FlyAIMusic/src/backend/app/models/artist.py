

from app.config.database import Base
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
import datetime

class Artist(Base):
    __tablename__ = 'artists'

    artist_id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    bio = Column(String)
    profile_image = Column(String)
    follower_count = Column(Integer, default=0)
    album_count = Column(Integer, default=0)
    total_sales = Column(Float, default=0.0)
    genres = Column(ARRAY(String))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    albums = relationship("Album", back_populates="artist")

class Album(Base):
    __tablename__ = 'albums'

    album_id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    release_date = Column(DateTime)
    cover_image = Column(String)
    artist_id = Column(String, ForeignKey('artists.artist_id'))

    artist = relationship("Artist", back_populates="albums")
