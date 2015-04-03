import os

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
DEBUG = False

# From https://gist.github.com/ndarville/3452907
try:
    SECRET_KEY
except NameError:
    SECRET_FILE = os.path.join(PROJECT_DIR, 'secret.txt')
    try:
        SECRET_KEY = open(SECRET_FILE).read().strip()
    except IOError:
        SECRET_KEY = os.environ.get('FLASK_SECRET_KEY')

try:
    OMDB_API_KEY
except NameError:
    OMDB_SECRET_FILE = os.path.join(PROJECT_DIR, 'omdb_api_key.txt')
    try:
        OMDB_API_KEY = open(OMDB_SECRET_FILE).read().strip()
    except IOError:
        OMDB_API_KEY = os.environ.get('OMDB_API_KEY')

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(PROJECT_DIR, 'app.db')
SQLALCHEMY_MIGRATE_REPO = os.path.join(PROJECT_DIR, 'db_repository')
