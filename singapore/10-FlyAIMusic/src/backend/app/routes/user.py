from flask import Blueprint, request, jsonify
from data.user_repository import UserRepository
from app.config.database import db_session

bp = Blueprint('user', __name__, url_prefix='/users')
user_repo = UserRepository(db_session)

# POST /users/login
@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    wallet_address = data.get('wallet_address')
    signature = data.get('signature')
    
    # 验证钱包所有权的逻辑（略）
    
    user, token = user_repo.create_or_update_user(wallet_address, signature)
    
    return jsonify({
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at,
        "token": token
    })

# GET /users/<wallet_address>
@bp.route('/<wallet_address>', methods=['GET'])
def get_user(wallet_address):
    user = user_repo.get_user(wallet_address)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at,
        "balance": user.balance,
        "nft_count": user.nft_count,
        "profile_image": user.profile_image
    })

# PUT /users/<wallet_address>
@bp.route('/<wallet_address>', methods=['PUT'])
def update_user(wallet_address):
    user = user_repo.get_user(wallet_address)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    updated_user = user_repo.update_user(wallet_address, data)
    
    return jsonify({
        "user_id": updated_user.user_id,
        "username": updated_user.username,
        "email": updated_user.email,
        "profile_image": updated_user.profile_image,
        "updated_at": updated_user.updated_at
    })