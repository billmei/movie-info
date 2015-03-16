from app import db

class Movie(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    imdb_id = db.Column(db.String, unique=True)
    title = db.Column(db.String)
    year = db.Column(db.String)
    movie_data = db.Column(db.String)

    def __repr__(self):
        return '<Movie (id="%d", title="%s")>' % (self.id, self.title)
