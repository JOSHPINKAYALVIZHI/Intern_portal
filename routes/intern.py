# from flask import Blueprint, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from models import User, DailyProgress, Blog, FinalProject

# intern_bp = Blueprint("intern", __name__)

# @intern_bp.route("/intern/dashboard", methods=["GET"])
# @jwt_required()
# def get_dashboard():

#     user_id = user_id = int(get_jwt_identity())

#     # If admin token tries to access
#     if user_id == "admin":
#         return jsonify({"msg": "Admins cannot access intern dashboard"}), 403

#     user = User.query.get(user_id)

#     if not user:
#         return jsonify({"msg": "User not found"}), 404

#     progress = DailyProgress.query.filter_by(user_id=user_id).all()
#     blogs = Blog.query.filter_by(user_id=user_id).all()
#     final_project = FinalProject.query.filter_by(user_id=user_id).first()

#     return jsonify({
#         "profile": {
#             "name": user.name,
#             "reg_no": user.reg_no,
#             "department": user.department,
#             "domain": user.domain,
#             "total_points": user.total_points
#         },
#         "daily_progress": [
#             {
#                 "day": p.day_number,
#                 "mcq_score": p.mcq_score,
#                 "leet_approved": p.leet_approved,
#                 "leet_points": p.leet_points
#             }
#             for p in progress
#         ],
#         "blog_count": len(blogs),
#         "final_project_submitted": final_project.submitted if final_project else False
#     })
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from models import User, DailyProgress, Blog, FinalProject
from extensions import db

intern_bp = Blueprint("intern", __name__)
@intern_bp.route("/intern/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard():

    identity = get_jwt_identity()

    # Prevent admin access
    if identity == "admin":
        return jsonify({"msg": "Admins cannot access intern dashboard"}), 403

    user_id = int(identity)
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    # Fetch related data
    progress = DailyProgress.query.filter_by(user_id=user_id).order_by(DailyProgress.day_number).all()
    blogs = Blog.query.filter_by(user_id=user_id).all()
    final_project = FinalProject.query.filter_by(user_id=user_id).first()

    # Build activity grid data
    activity_grid = []

    for p in progress:
        if p.mcq_score == 0 and not p.leet_approved:
            status = "inactive"
        elif p.mcq_score > 0 and not p.leet_approved:
            status = "mcq_done"
        elif p.mcq_score > 0 and p.leet_approved:
            status = "full_complete"
        else:
            status = "inactive"

        activity_grid.append({
            "day": p.day_number,
            "status": status
        })

    return jsonify({
        "profile": {
            "name": user.name,
            "reg_no": user.reg_no,
            "department": user.department,
            "domain": user.domain,
            "total_points": user.total_points
        },
        "progress": [
            {
                "day": p.day_number,
                "mcq_score": p.mcq_score,
                "leet_approved": p.leet_approved,
                "leet_points": p.leet_points
            }
            for p in progress
        ],
        "blog_count": len(blogs),
        "final_project": {
            "submitted": final_project.submitted if final_project else False,
            "approved": final_project.approved if final_project else False
        },
        "activity_grid": activity_grid
    })