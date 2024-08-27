from sqlalchemy.orm import Session
from models.user import User
import jwt
import datetime

class UserRepository:
    def __init__(self, db_session: Session):
        self.db_session = db_session

    def create_or_update_user(self, wallet_address, signature):
        user = self.db_session.query(User).filter_by(wallet_address=wallet_address).first()
        if not user:
            user_id = str(len(self.db_session.query(User).all()) + 1)
            user = User(
                user_id=user_id,
                wallet_address=wallet_address,
                username=f"user_{user_id}",
                email="",
                created_at=datetime.datetime.utcnow()
            )
            self.db_session.add(user)
        token = jwt.encode({"user_id": user.user_id}, 'secret', algorithm='HS256')
        self.db_session.commit()
        return user, token

    def get_user(self, wallet_address):
        return self.db_session.query(User).filter_by(wallet_address=wallet_address).first()

    def update_user(self, wallet_address, data):
        user = self.db_session.query(User).filter_by(wallet_address=wallet_address).first()
        if not user:
            return None
        user.username = data.get("username", user.username)
        user.email = data.get("email", user.email)
        user.profile_image = data.get("profile_image", user.profile_image)
        user.updated_at = datetime.datetime.utcnow()
        self.db_session.commit()
        return user