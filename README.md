# Movie Info
Find info on movies. **[Click here](http://ga-movie-info.herokuapp.com/) for the demo**. Built on Flask, Angular.js, Bootstrap, and jQuery. [Here is a diagram](https://docs.google.com/drawings/d/146xaqXPqNgaNZRwv9V2uxdQjtM3Uo4iHrLg7-DirJMU) of the software architecture.

## Features
- Uses a Python backend to cache results from OMDb so that we don't need to keep fetching data from a third party API. Not only does this improve performance, but the backend also has routes so that the user can hotlink directly to a result once they have seen it. For example, navigating to [http://ga-movie-info.herokuapp.com**/movie/tt0110912/**](http://ga-movie-info.herokuapp.com/movie/tt0110912) takes you directly to a cached results page that doesn't reply on external API calls.
- Connects to S3 to cache movie poster images once they're downloaded. This avoids exposing the OMDb API key to the client.
- Fully responsive on mobile, tablet, and desktop.
- Social sharing of each result page to Facebook, Twitter, and Google+
- Tested to work on Chrome, Firefox, and IE.
- Handles multiple error cases and zero data cases gracefully.

## Installation Instructions

Python Version 3.4.0

Flask Version 0.10.1

### Step 1

	$ git clone git@github.com:Kortaggio/movie-info.git
	$ cd movie-info

### Step 2

Install `virtualenv` and the python3 interpreter:

	$ pip install virtualenv
	$ virtualenv -p python3 venv

### Step 3

This app needs [Amazon S3](https://aws.amazon.com/s3/) to store the images of the movie posters. If you don't have an S3 account and *only* want to run the app locally, set the config flag `USE_S3 = False` in `config.py`, and skip the rest of Step 3.

If you have an S3 account and want to use it in conjunction with deploying on Heroku, run:

	$ heroku config:set S3_ACCESS_KEY=YOUR-ACCESS-KEY-HERE
	$ heroku config:set S3_SECRET_KEY=YOUR-SECRET-KEY-HERE
	$ heroku config:set S3_BUCKET_NAME=YOUR-BUCKET-NAME-HERE

If you have an S3 account but want to run the app locally (e.g. when testing), you still need to set the following environment variables on your local machine:

	$ echo 'export S3_ACCESS_KEY=YOUR-ACCESS-KEY-HERE' >> venv/bin/activate
	$ echo 'export S3_SECRET_KEY=YOUR-SECRET-KEY-HERE' >> venv/bin/activate
	$ echo 'export S3_BUCKET_NAME=YOUR-BUCKET-NAME-HERE' >> venv/bin/activate

This will make sure the environment variables for your S3 bucket are configured correctly every time you run the virtualenv wrapper. When setting up your S3 account, make sure to set the following policy on your bucket so that the files have permission to be viewed publicly (you need to do this regardless of whether you are running the app locally or on a remote host like Heroku):

	{
		"Version": "2012-10-17",
		"Id": "Policy1431347864012",
		"Statement": [
			{
				"Sid": "Stmt1431347858318",
				"Effect": "Allow",
				"Principal": "*",
				"Action": "s3:GetObject",
				"Resource": "arn:aws:s3:::YOUR-BUCKET-NAME-HERE/static/*"
			}
		]
	}

### Step 4

Activate `virtualenv` and install the app requirements

	$ source venv/bin/activate
	$ pip install -r requirements.txt

### Step 5

Generate a Flask secret key and save it as `/secret.txt` in the root folder. If running on Heroku instead of localhost, set the environment variable:

	$ heroku config:set FLASK_SECRET_KEY=YOUR-SECRET-KEY-HERE

You also need to [get an OMDB Poster API key](http://beforethecode.com/projects/omdb/apikey.aspx) and save it as `/omdb_api_key.txt`. Again, you also need to set the environment varaible if you are running on Heroku:

	$ heroku config:set OMDB_API_KEY=YOUR-API-KEY-HERE

### Step 5.1 (Optional)

If at any point you want to wipe the database and create a new one from scratch, delete the `app.db` file and the `db_repository` folder. You can then create and migrate the database using:

	$ python db_create.py
	$ python db_migrate.py

If you `git clone`'d the repo then you shouldn't need to do this as the database uploaded here is already empty.

### Step 6

Run with

	$ python run.py

# License

MIT License
