from app import db, models
import requests
from config import OMDB_API_KEY
import json
import omdb

def cache_movie(movie):
    """Caches the movie in the database if it does not exist yet"""
    movie_title = movie['title'].lower()

    m = models.Movie(
        imdb_id=movie['imdb_id'],
        title=movie_title,
        year=movie['year'],
        movie_data=json.dumps(movie)
        )
    db.session.add(m)
    db.session.commit()


def get_movie(title, year=None):
    """
    Retrieves movies from the database by title and year.
    Automatically tries to fetch from the OMDB API if the movie does not
    exist in the database.
    """
    title = title.lower()

    if len(year) == 0 or not year:
        movie = models.Movie.query.filter_by(
            title=title).order_by(
            models.Movie.year.desc()).first()
    else:
        movie = models.Movie.query.filter_by(
            title=title).filter_by(
            year=year).first()

    if movie:
        # Fetch from the database
        return movie.movie_data
    else:
        # Otherwise fetch forom OMDB
        try:
            movie = get_movie_from_omdb(title, year)
        except requests.exceptions.HTTPError:
            return None
        cache_movie(movie)
        return json.dumps(movie)

def get_movie_from_omdb(title, year):
    """
    Retrieves a movie from the OMDB API
    """
    return omdb.get(title=title, year=year, fullplot=True)

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
    if r.status_code == 404 or r.status_code == 500 or r.status_code == 403:
        return None
    else:
        return uri
