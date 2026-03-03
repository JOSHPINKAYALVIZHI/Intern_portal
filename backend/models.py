from extensions import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    reg_no = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(10))  # ADMIN / INTERN
    department = db.Column(db.String(100))
    domain = db.Column(db.String(50), default="Web Development")
    total_points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DailyProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    day_number = db.Column(db.Integer)
    mcq_score = db.Column(db.Integer, default=0)
    leet_pdf_url = db.Column(db.Text)
    leet_approved = db.Column(db.Boolean, default=False)
    leet_points = db.Column(db.Integer, default=0)
    date = db.Column(db.Date)

class Blog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    blog_date = db.Column(db.Date)
    medium_link = db.Column(db.Text)
    points = db.Column(db.Integer, default=2)

class FinalProject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    github_link = db.Column(db.Text)
    demo_video = db.Column(db.Text)
    deployed_link = db.Column(db.Text)
    blog_link = db.Column(db.Text)
    submitted = db.Column(db.Boolean, default=False)
    approved = db.Column(db.Boolean, default=False)
    points = db.Column(db.Integer, default=50)

class MCQ(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    day_number = db.Column(db.Integer)
    domain = db.Column(db.String(50))
    question = db.Column(db.Text)
    option_a = db.Column(db.Text)
    option_b = db.Column(db.Text)
    option_c = db.Column(db.Text)
    option_d = db.Column(db.Text)
    correct_answer = db.Column(db.String(1))  # A/B/C/D