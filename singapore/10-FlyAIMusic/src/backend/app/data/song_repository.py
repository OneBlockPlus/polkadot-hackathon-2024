from sqlalchemy.orm import Session
from models.song import Song

class SongRepository:
    def __init__(self, db_session: Session):
        self.db_session = db_session

    def get_songs(self, page, limit, album_id=None, artist_id=None, genre=None):
        query = self.db_session.query(Song)
        if album_id:
            query = query.filter(Song.album_id == album_id)
        if artist_id:
            query = query.filter(Song.artist_id == artist_id)
        if genre:
            query = query.filter(Song.genre == genre)
        total = query.count()
        songs = query.offset((page - 1) * limit).limit(limit).all()
        return total, songs

    def get_song_by_id(self, song_id):
        return self.db_session.query(Song).filter_by(song_id=song_id).first()

    def create_song(self, song):
        self.db_session.add(song)
        self.db_session.commit()
        return song.song_id

    def update_song(self, song_id, data):
        song = self.db_session.query(Song).filter_by(song_id=song_id).first()
        if not song:
            return False
        song.title = data.get("title", song.title)
        song.price = data.get("price", song.price)
        song.genre = data.get("genre", song.genre)
        song.lyrics = data.get("lyrics", song.lyrics)
        song.updated_at = datetime.datetime.utcnow()
        self.db_session.commit()
        return True