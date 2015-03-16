import os
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__, instance_relative_config=True, static_url_path='/static')
app.config.from_object('config')

db = SQLAlchemy(app)

from app import views, models
