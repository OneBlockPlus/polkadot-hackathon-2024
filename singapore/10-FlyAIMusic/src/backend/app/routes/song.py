from flask import Blueprint, request, jsonify
from app.data.song_repository import SongRepository
from models.song import Song
from app.config.database import db_session
import uuid
import datetime

bp = Blueprint('song', __name__, url_prefix='/songs')
song_repo = SongRepository(db_session)

@bp.route('/', methods=['GET'])
def get_songs():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    album_id = request.args.get('album_id')
    artist_id = request.args.get('artist_id')
    genre = request.args.get('genre')

    total, songs = song_repo.get_songs(page, limit, album_id, artist_id, genre)
    return jsonify({
        "total": total,
        "songs": [song.to_dict() for song in songs]
    })

@bp.route('/<string:song_id>', methods=['GET'])
def get_song(song_id):
    song = song_repo.get_song_by_id(song_id)
    if not song:
        return jsonify({"error": "Song not found"}), 404

    return jsonify(song.to_dict())

@bp.route('/', methods=['POST'])
def create_song():
    data = request.form
    audio_file = request.files.get('audio_file')
    audio_url = save_audio_file(audio_file)

    new_song = Song(
        song_id=str(uuid.uuid4()),
        title=data["title"],
        artist_id=data["artist_id"],
        album_id=data["album_id"],
        duration=int(data["duration"]),
        price=float(data["price"]),
        genre=data["genre"],
        lyrics=data.get("lyrics", ""),
        audio_url=audio_url
    )
    song_id = song_repo.create_song(new_song)
    return jsonify({
        "song_id": song_id,
        "title": new_song.title,
        "artist_id": new_song.artist_id,
        "album_id": new_song.album_id,
        "duration": new_song.duration,
        "price": new_song.price
    }), 201

@bp.route('/<string:song_id>', methods=['PUT'])
def update_song(song_id):
    data = request.json
    success = song_repo.update_song(song_id, data)
    if not success:
        return jsonify({"error": "Song not found or update failed"}), 404

    return jsonify({
        "song_id": song_id,
        "title": data.get("title"),
        "updated_at": datetime.datetime.utcnow().isoformat()
    })