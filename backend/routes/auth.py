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

    # ------------------------------------------------
    # Hardcoded Admin Login
    # ------------------------------------------------
    if reg_no == "admin" and password == "admin":

        token = create_access_token(
            identity="admin",
            expires_delta=datetime.timedelta(days=1)
        )

        return jsonify({
            "role": "ADMIN",
            "token": token
        })


    # ------------------------------------------------
    # Normal User Login
    # ------------------------------------------------
    user = User.query.filter_by(reg_no=reg_no).first()

    if not user or user.password != password:
        return jsonify({"msg": "Invalid credentials"}), 401


    # ------------------------------------------------
    # Admin From Database
    # ------------------------------------------------
    if user.role == "ADMIN":

        token = create_access_token(
            identity="admin",
            expires_delta=datetime.timedelta(days=1)
        )

        return jsonify({
            "role": "ADMIN",
            "token": token
        })


    # ------------------------------------------------
    # Intern Login
    # ------------------------------------------------
    token = create_access_token(
        identity=str(user.id),
        expires_delta=datetime.timedelta(days=1)
    )

    return jsonify({
        "role": "INTERN",
        "token": token
    })