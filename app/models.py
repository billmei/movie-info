from app import db

class Movie(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
