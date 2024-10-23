from flask import Blueprint, request, jsonify
from data.analytics_repository import AnalyticsRepository
from app.config.database import db_session

bp = Blueprint('analytics', __name__, url_prefix='/analytics')
analytics_repo = AnalyticsRepository(db_session)

# GET /analytics/top-songs
@bp.route('/top-songs', methods=['GET'])
def get_top_songs():
    period = request.args.get('period', 'week')
    limit = int(request.args.get('limit', 10))
    
    top_songs = analytics_repo.get_top_songs(period, limit)
    
    return jsonify({
        "period": period,
        "top_songs": [
            {
                "song_id": song.song_id,
                "title": song.title,
                "artist_name": song.artist_name,
                "play_count": song.play_count,
                "nft_sales": song.nft_sales
            } for song in top_songs
        ]
    })

# GET /analytics/top-artists
@bp.route('/top-artists', methods=['GET'])
def get_top_artists():
    period = request.args.get('period', 'week')
    limit = int(request.args.get('limit', 10))
    
    top_artists = analytics_repo.get_top_artists(period, limit)
    
    return jsonify({
        "period": period,
        "top_artists": [
            {
                "artist_id": artist.artist_id,
                "name": artist.name,
                "total_plays": artist.total_plays,
                "nft_sales": artist.nft_sales,
                "follower_count": artist.follower_count
            } for artist in top_artists
        ]
    })

# GET /analytics/user-activity
@bp.route('/user-activity', methods=['GET'])
def get_user_activity():
    user_id = request.args.get('user_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    user_activity = analytics_repo.get_user_activity(user_id, start_date, end_date)
    
    return jsonify({
        "user_id": user_id,
        "period": {
            "start": start_date,
            "end": end_date
        },
        "total_listen_time": user_activity.total_listen_time,
        "songs_played": user_activity.songs_played,
        "nfts_purchased": user_activity.nfts_purchased,
        "playlists_created": user_activity.playlists_created,
        "most_played_genre":user_activity.most_played_genre
    })