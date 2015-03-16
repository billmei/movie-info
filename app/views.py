from flask import render_template, send_from_directory
from flask import url_for, redirect, request
from app import app

# Templates
@app.route('/', methods=['GET'])
def render_index_page():
    return render_template('index.html')

# TODO: Hash the url to create a permalink, then cache this in a database.
@app.route('/result/<url_hash>', methods=['GET','POST'])
def render_result_page(url_hash):
    return render_template('result.html', url_hash=url_hash)
