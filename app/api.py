from app import db, models
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

    return "successfully cached"


def get_movie(title, year=None):
    """
    Retrieves movies from the database by IMDB id.
    Returns None if the movie does not exist in the database
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
