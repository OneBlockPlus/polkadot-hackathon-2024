from flask import Blueprint, request, jsonify
from app.data.artist_repository import ArtistRepository
from models.artist import Artist

bp = Blueprint('artist', __name__, url_prefix='/artists')

artist_repo = ArtistRepository()

@bp.route('/', methods=['GET'])
def get_artists():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    genre = request.args.get('genre')
    sort_by = request.args.get('sort_by')

    artists = artist_repo.get_artists(page, limit, genre, sort_by)
    return jsonify({
        "total": len(artists),
        "artists": [artist.to_dict() for artist in artists]
    })

@bp.route('/<string:artist_id>', methods=['GET'])
def get_artist(artist_id):
    artist = artist_repo.get_artist_by_id(artist_id)
    if not artist:
        return jsonify({"error": "Artist not found"}), 404

    artist_data = artist.to_dict()
    artist_data["albums"] = [album.to_dict() for album in artist_repo.get_artist_albums(artist_id)]
    return jsonify(artist_data)

@bp.route('/', methods=['POST'])
def create_artist():
    data = request.json
    new_artist = Artist.from_dict(data)
    artist_id = artist_repo.create_artist(new_artist)
    return jsonify({
        "artist_id": artist_id,
        "name": new_artist.name,
        "bio": new_artist.bio,
        "wallet_address": new_artist.wallet_address
    }), 201

@bp.route('/<string:artist_id>', methods=['PUT'])
def update_artist(artist_id):
    data = request.json
    success = artist_repo.update_artist(artist_id, data)
    if not success:
        return jsonify({"error": "Artist not found or update failed"}), 404

    return jsonify({
        "artist_id": artist_id,
        "name": data.get("name"),
        "updated_at": datetime.now().isoformat()
    })
