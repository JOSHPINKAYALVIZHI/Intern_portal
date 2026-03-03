from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Blog, FinalProject, User, DailyProgress
from extensions import db
from datetime import date

admin_bp = Blueprint("admin", __name__)
@admin_bp.route("/admin/pending-leetcode", methods=["GET"])
@jwt_required()
def get_pending_leetcode():

    identity = get_jwt_identity()

    if identity != "admin":
        return jsonify({"msg": "Only admin allowed"}), 403

    pending = DailyProgress.query.filter(
        DailyProgress.leet_pdf_url.isnot(None),
        DailyProgress.leet_approved == False
    ).all()

    return jsonify([
        {
            "user_id": p.user_id,
            "day": p.day_number,
            "pdf": p.leet_pdf_url
        }
        for p in pending
    ])
@admin_bp.route("/admin/approve-leetcode/<int:user_id>/<int:day>", methods=["POST"])
@jwt_required()
def approve_leetcode(user_id, day):

    identity = get_jwt_identity()

    if identity != "admin":
        return jsonify({"msg": "Only admin allowed"}), 403

    progress = DailyProgress.query.filter_by(
        user_id=user_id,
        day_number=day
    ).first()

    if not progress or not progress.leet_pdf_url:
        return jsonify({"msg": "Invalid request"}), 400

    if progress.leet_approved:
        return jsonify({"msg": "Already approved"}), 400

    user = User.query.get(user_id)

    progress.leet_approved = True
    progress.leet_points = 5
    progress.date = date.today()

    user.total_points += 5

    db.session.commit()

    return jsonify({
        "msg": "LeetCode Approved 💜",
        "new_total_points": user.total_points
    })
@admin_bp.route("/admin/approve-final/<int:user_id>", methods=["POST"])
@jwt_required()
def approve_final(user_id):

    identity = get_jwt_identity()

    if identity != "admin":
        return jsonify({"msg": "Only admin allowed"}), 403

    final = FinalProject.query.filter_by(user_id=user_id).first()

    if not final or final.approved:
        return jsonify({"msg": "Invalid request"}), 400

    user = User.query.get(user_id)

    final.approved = True
    user.total_points += 50

    db.session.commit()

    return jsonify({"msg": "Final project approved 💜"})
@admin_bp.route("/admin/intern/<int:user_id>", methods=["GET"])
@jwt_required()
def get_intern_details(user_id):

    identity = get_jwt_identity()

    if identity != "admin":
        return jsonify({"msg": "Only admin allowed"}), 403

    user = User.query.get(user_id)
    progress = DailyProgress.query.filter_by(user_id=user_id).all()
    blogs = Blog.query.filter_by(user_id=user_id).all()
    final = FinalProject.query.filter_by(user_id=user_id).first()

    return jsonify({
        "profile": {
            "name": user.name,
            "reg_no": user.reg_no,
            "domain": user.domain,
            "total_points": user.total_points
        },
        "progress": [
            {
                "day": p.day_number,
                "mcq": p.mcq_score,
                "leet": p.leet_approved
            } for p in progress
        ],
        "blogs": len(blogs),
        "final_project": final.submitted if final else False
    })
@admin_bp.route("/admin/leaderboard", methods=["GET"])
@jwt_required()
def leaderboard():

    identity = get_jwt_identity()

    if identity != "admin":
        return jsonify({"msg": "Only admin allowed"}), 403

    users = User.query.filter_by(role="INTERN").order_by(User.total_points.desc()).all()

    return jsonify([
        {
            "name": u.name,
            "reg_no": u.reg_no,
            "points": u.total_points
        } for u in users
    ])