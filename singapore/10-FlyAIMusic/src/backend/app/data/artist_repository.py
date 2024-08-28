from sqlalchemy.orm import Session
from models.artist import Artist


class ArtistRepository:
    def __init__(self, db_session: Session):
        self.db_session = db_session

    def get_artists(self, page, limit, genre=None, sort_by=None):
        query = self.db_session.query(Artist)
        if genre:
            query = query.filter(Artist.genres.contains([genre]))
        if sort_by:
            if sort_by == "popularity":
                query = query.order_by(Artist.follower_count.desc())
            elif sort_by == "name":
                query = query.order_by(Artist.name.asc())
        total = query.count()
        artists = query.offset((page - 1) * limit).limit(limit).all()
        return total, artists

    def get_artist_by_id(self, artist_id):
        return self.db_session.query(Artist).filter_by(artist_id=artist_id).first()

    def create_artist(self, artist):
        self.db_session.add(artist)
        self.db_session.commit()
        return artist.artist_id

    def update_artist(self, artist_id, data):
        artist = self.db_session.query(Artist).filter_by(artist_id=artist_id).first()
        if not artist:
            return False
        artist.name = data.get("name", artist.name)
        artist.bio = data.get("bio", artist.bio)
        artist.profile_image = data.get("profile_image", artist.profile_image)
        artist.genres = data.get("genres", artist.genres)
        artist.updated_at = datetime.datetime.utcnow()
        self.db_session.commit()
        return True