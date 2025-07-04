from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Folder(db.Model):
    __tablename__ = 'folder'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    created_at = db.Column(db.String)
    updated_at = db.Column(db.String)
    slides = db.relationship('Slide', back_populates='folder')

class Slide(db.Model):
    __tablename__ = 'slide'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String)
    created_at = db.Column(db.String)
    folder_id = db.Column(db.Integer, db.ForeignKey('folder.id'))
    folder = db.relationship('Folder', back_populates='slides')

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    slide_id = db.Column(db.Integer, db.ForeignKey("slide.id"))
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text)
    created_at = db.Column(db.String)
    updated_at = db.Column(db.String)
