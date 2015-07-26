import os

APP_NAME = 'movie-info'
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
DEBUG = False
USE_S3 = True

SECRET_KEY = os.environ.get('FLASK_SECRET_KEY')
OMDB_API_KEY = os.environ.get('OMDB_API_KEY')
S3_ACCESS_KEY = os.environ.get('S3_ACCESS_KEY')
S3_SECRET_KEY = os.environ.get('S3_SECRET_KEY')
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(PROJECT_DIR, 'app.db')
SQLALCHEMY_MIGRATE_REPO = os.path.join(PROJECT_DIR, 'db_repository')

APP_FOLDER = '/app'
POSTERS_FOLDER = '/static/posters/'
MAX_CONTENT_LENGTH = 16 * 1024 * 1024
