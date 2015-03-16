from flask import render_template, send_from_directory
from flask import url_for, redirect, request
from app import app
from app import api

# Templates
@app.route('/', methods=['GET'])
def render_index_page():
    return render_template('index.html')

@app.route('/api/cache_movie', methods=['POST'])
def api_cache_movie():
    return api.cache_movie(request.form.get('movie_data',''))

@app.route('/api/get_movie', methods=['GET'])
def api_get_movie():
    result = api.get_movie(
        request.args.get('movie_title',''),
        request.args.get('movie_year','')
        )
    if result:
        return result
    else:
        return ''

@app.route('/api/get_movie_by_id', methods=['GET'])
def api_get_movie_by_id():
    result = api.get_movie_by_id(
        request.args.get('imdb_id','')
        )
    if result:
        return result
    else:
        return ''

@app.route('/movie/<imdb_id>', methods=['GET'])
def render_movie_page(imdb_id):
    return render_template('index.html', imdb_id=imdb_id)
