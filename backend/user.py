from app import app
from models import User

with app.app_context():
    user = User.query.filter_by(reg_no="22CS101").first()
    print("Reg No:", user.reg_no)
    print("Password in DB:", user.password)
    print("Length:", len(user.password))