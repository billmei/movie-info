import os
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__, instance_relative_config=True, static_url_path='/static')
app.config.from_object('config')
try:
    # Configuration from instance folder
    app.config.from_pyfile('config.py')
except EnvironmentError:
    pass

db = SQLAlchemy(app)

from app import views, models
