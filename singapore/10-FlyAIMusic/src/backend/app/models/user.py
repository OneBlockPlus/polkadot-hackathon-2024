from app.config.database import Base
from sqlalchemy import Column, String, DateTime, Float, Integer
import datetime

class User(Base):
    __tablename__ = 'users'

    user_id = Column(String, primary_key=True)
    wallet_address = Column(String, unique=True, nullable=False)
    username = Column(String, nullable=False)
    email = Column(String)
    profile_image = Column(String)
    balance = Column(Float, default=0.0)
    nft_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)