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

    if reg_no == "admin" and password == "admin":
        access_token = create_access_token(identity="admin", expires_delta=datetime.timedelta(days=1))
        return jsonify({"role": "ADMIN", "token": access_token})

    user = User.query.filter_by(reg_no=reg_no, password=password).first()

    if user:
        access_token = create_access_token(identity=user.id)
        return jsonify({"role": "INTERN", "token": access_token})

    return jsonify({"msg": "Invalid credentials"}), 401