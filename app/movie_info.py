from app import db, models
from config import APP_NAME, PROJECT_DIR, APP_FOLDER, POSTERS_FOLDER
from config import OMDB_API_KEY, USE_S3
from werkzeug import secure_filename
from s3file import s3open
import requests
import json
import omdb

def get_movie(title, year=None, imdb_id=None):
    """
    Retrieves movies from the database by title and year, or IMDB id.
    Automatically tries to fetch from the OMDB API if the movie does not
    exist in the database.
    """
    # First try fetching from our database
    if imdb_id:
        movie = models.Movie.query.filter_by(imdb_id=imdb_id).first()

    else:
        title = title.lower()

        if len(year) == 0 or not year:
            movie = models.Movie.query.filter(
                models.Movie.title.startswith(title)).order_by(
                models.Movie.year.desc()).first()
        else:
            movie = models.Movie.query.filter(
                models.Movie.title.startswith(title)).filter_by(
                year=year).first()

    if movie:
        # Movie exists in our the database
        return movie.movie_data
    else:
        # Otherwise fetch from OMDB
        movie = search_omdb(title, year, imdb_id)

        if movie:
            movie.poster = get_poster(movie.imdb_id)
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
    except requests.exceptions.HTTPError:
        return None

    return movie

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
    Builds a local filename for a movie poster by imdb_id
    from the OMDB Poster API
    """
    uri = 'http://img.omdbapi.com/?i=' + imdb_id + '&apikey=' + OMDB_API_KEY
    r = requests.get(uri, stream=True)
    if r.status_code == 404 or r.status_code == 500 or r.status_code == 403:
        # No poster found, return the default image
        return None
    else:
        if USE_S3:
            remote_file = APP_NAME + \
                          POSTERS_FOLDER + secure_filename(imdb_id) + '.jpg'
            s3_path = 'https://bucket.s3.amazonaws.com/'
            with s3open(s3_path + remote_file) as poster_file:
                write_to_file(poster_file, r)

            return s3_path + remote_file

        else:
            local_file = PROJECT_DIR + APP_FOLDER + \
                         POSTERS_FOLDER + secure_filename(imdb_id) + '.jpg'
            with open(local_file, 'wb') as poster_file:
                write_to_file(poster_file, r)

            return POSTERS_FOLDER + secure_filename(imdb_id) + '.jpg'

def write_to_file(filename, req):
    """Writes arbitrary binary data retrieved from a request to a file"""
    for chunk in req.iter_content(chunk_size=1024):
        if chunk:
            filename.write(chunk)
            filename.flush()
