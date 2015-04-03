from app import db, models
import requests
from config import OMDB_API_KEY
import json

def cache_movie(movie):
    """Caches the movie in the database if it does not exist yet"""

    movie = json.loads(movie)
    movie_title = movie['Title'].lower()

    if not get_movie(movie_title, movie['Year']):
        m = models.Movie(
            imdb_id=movie['imdbID'],
            title=movie_title,
            year=movie['Year'],
            movie_data=json.dumps(movie)
            )
        db.session.add(m)
        db.session.commit()

    return 'successfully cached'


def get_movie(title, year=None):
    """
    Retrieves movies from the database by title and year.
    Returns None if the movie does not exist in the database.
    """
    title = title.lower()

    if len(year) == 0 or not year:
        m = models.Movie.query.filter_by(
            title=title).order_by(
            models.Movie.year.desc()).first()
    else:
        m = models.Movie.query.filter_by(
            title=title).filter_by(
            year=year).first()

    if m:
        return m.movie_data
    else:
        return None

def get_movie_by_id(imdb_id):
    """
    Retrieves movies from the database by IMDB id.
    Returns None if the movie does not exist in the database.
    """

    m = models.Movie.query.filter_by(imdb_id=imdb_id).first()
    if m:
        return m.movie_data
    else:
        return None

def get_poster(imdb_id):
    """
    Builds the URI of a movie poster by imdb_id
    from the OMDB Poster API
    """
    uri = 'http://img.omdbapi.com/?i=' + imdb_id + '&apikey=' + OMDB_API_KEY
    r = requests.get(uri)
    if r.status_code == 404 or r.status_code == 500:
        return None
    else:
        return uri
