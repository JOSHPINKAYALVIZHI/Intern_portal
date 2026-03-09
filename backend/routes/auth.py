from flask import Blueprint, request, jsonify
from models import User
from extensions import db 
from flask_jwt_extended import create_access_token
import datetime

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    reg_no = data.get("reg_no")
    password = data.get("password")

    # Admin login
    if reg_no == "admin" and password == "admin":
        access_token = create_access_token(identity="admin", expires_delta=datetime.timedelta(days=1))
        return jsonify({"role": "ADMIN", "token": access_token})

    # Find user only by reg_no
    user = User.query.filter_by(reg_no=reg_no).first()

    if user:
        print("User found:", user.reg_no)
        print("Password in DB:", user.password)

        if user.password == password:
            access_token = create_access_token(identity=str(user.id))  # ✅ FIXED
            return jsonify({"role": "INTERN", "token": access_token})

    return jsonify({"msg": "Invalid credentials"}), 401