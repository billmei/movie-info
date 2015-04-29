from flask import render_template, request, Response, abort
from app import app
from app import movie_info

# Templates
@app.route('/', methods=['GET'])
def render_index_page():
    """Display the landing page"""
    return render_template('index.html')

@app.route('/movie/<imdb_id>', methods=['GET'])
def render_movie_page(imdb_id):
    """Render the movie's data page"""
    return render_template('index.html', imdb_id=imdb_id)

@app.route('/api/get_movie', methods=['GET'])
def api_get_movie():
    """Get movie by title and year"""
    result = movie_info.get_movie(
        request.args.get('movie_title', None),
        request.args.get('movie_year', None),
        request.args.get('imdb_id', None)
        )
    if result:
        return Response(result, mimetype='application/json')
    else:
        abort(404)
