from app import db, models
import requests
from config import OMDB_API_KEY
import json
import omdb

def cache_movie(movie):
    """Caches the movie in the database if it does not exist yet"""
    if not movie:
        return

    movie_title = movie['title'].lower()

    m = models.Movie(
        imdb_id=movie['imdb_id'],
        title=movie_title,
        year=movie['year'],
        movie_data=json.dumps(movie)
        )
    db.session.add(m)
    db.session.commit()

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

def get_movie(title, year=None, imdb_id=None):
    """
    Retrieves movies from the database by title and year, or IMDB id.
    Automatically tries to fetch from the OMDB API if the movie does not
    exist in the database.
    """

    if imdb_id:
        movie = models.Movie.query.filter_by(imdb_id=imdb_id).first()

    else:
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
        # Otherwise fetch from OMDB
        movie = search_omdb(title, year, imdb_id)
        if movie:
            cache_movie(movie)
            return json.dumps(movie)

        return None

def search_omdb(title, year=None, imdb_id=None):
    """
    Retrieves a movie from the OMDB API
    """
    try:
        if imdb_id:
            movie = omdb.imdbid(imdb_id, fullplot=True)
        else:
            movie = omdb.get(title=title, year=year, fullplot=True)

        print(movie)
    except requests.exceptions.HTTPError:
        return None

    return movie

def search_omdb_by_id(imdb_id):
    """
    Retrieves a movie from the OMDB API by IMDB id.
    """
    try:
        movie = omdb.get(imdbid=imdb_id, fullplot=True)
    except requests.exceptions.HTTPError:
        return None

    return movie
