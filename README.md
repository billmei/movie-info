# Movie Info
Find info on movies. [Click here](http://ga-movie-info.herokuapp.com/) for the demo.

Created for a General Assembly coding challenge.

## Features


- I could have used Jinja templates in Flask but I chose to fill in the data with jQuery instead since you guys wanted to see a sample of my JavaScript knowledge.

## Installation Instructions

Python Version 3.3.1

Flask Version 0.10.1

### Step 1

	$ git clone git@github.com:Kortaggio/movie-info.git
	$ cd movie-info

### Step 2

Install `virtualenv` and app requirements (use the `--no-site-packages` flag for Ubuntu versions):

	$ pip install virtualenv
	$ virtualenv -p python3 venv --no-site-packages
	$ source venv/bin/activate
	$ pip install -r requirements.txt

### Step 3

Generate a Flask secret key and save it as `/secret.txt`. If running on Heroku instead of localhost, set the environment variable:

	$ heroku config:set FLASK_SECRET_KEY=your-secret-key-here

### Step 4

Create and migrate the database

	$ python db_create.py
	$ python db_migrate.py

### Step 5

Run with

	$ python run.py

# License

MIT License
