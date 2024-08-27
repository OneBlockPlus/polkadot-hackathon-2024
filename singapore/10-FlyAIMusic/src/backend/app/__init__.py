from flask import Flask

def create_app():
    app = Flask(__name__)
    
    from .routes import AI
    app.register_blueprint(AI.bp)

    # from .routes import artist,user,song
    # app.register_blueprint(artist.bp)
    # app.register_blueprint(user.bp)
    # app.register_blueprint(song_bp)
    
    return app