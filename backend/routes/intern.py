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
from models import User, DailyProgress, Blog, FinalProject, MCQ
from extensions import db
from werkzeug.utils import secure_filename
import os
from flask import current_app
intern_bp = Blueprint("intern", __name__)
# @intern_bp.route("/intern/dashboard", methods=["GET"])
# @jwt_required()
# def get_dashboard():

#     identity = get_jwt_identity()

#     # Prevent admin access
#     if identity == "admin":
#         return jsonify({"msg": "Admins cannot access intern dashboard"}), 403

#     user_id = int(identity)
#     user = User.query.get(user_id)

#     if not user:
#         return jsonify({"msg": "User not found"}), 404

#     # Fetch related data
#     progress = DailyProgress.query.filter_by(user_id=user_id).order_by(DailyProgress.day_number).all()
#     blogs = Blog.query.filter_by(user_id=user_id).all()
#     final_project = FinalProject.query.filter_by(user_id=user_id).first()

#     # Build activity grid data
#     activity_grid = []

#     for p in progress:
#         if p.mcq_score == 0 and not p.leet_approved:
#             status = "inactive"
#         elif p.mcq_score > 0 and not p.leet_approved:
#             status = "mcq_done"
#         elif p.mcq_score > 0 and p.leet_approved:
#             status = "full_complete"
#         else:
#             status = "inactive"

#         activity_grid.append({
#             "day": p.day_number,
#             "status": status
#         })

#     return jsonify({
#         "profile": {
#             "name": user.name,
#             "reg_no": user.reg_no,
#             "department": user.department,
#             "domain": user.domain,
#             "total_points": user.total_points
#         },
#         "progress": [
#             {
#                 "day": p.day_number,
#                 "mcq_score": p.mcq_score,
#                 "leet_approved": p.leet_approved,
#                 "leet_points": p.leet_points
#             }
#             for p in progress
#         ],
#         "blog_count": len(blogs),
#         "final_project": {
#             "submitted": final_project.submitted if final_project else False,
#             "approved": final_project.approved if final_project else False
#         },
#         "activity_grid": activity_grid
#     })
@intern_bp.route("/intern/submit-mcq/<int:day>", methods=["POST"])
@jwt_required()
def submit_mcq(day):

    identity = get_jwt_identity()

    if identity == "admin":
        return jsonify({"msg": "Admins cannot submit MCQs"}), 403

    user_id = int(identity)
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    progress = DailyProgress.query.filter_by(
        user_id=user_id,
        day_number=day
    ).first()

    if not progress:
        return jsonify({"msg": "Invalid day"}), 400

    if progress.mcq_score > 0:
        return jsonify({"msg": "MCQ already submitted for this day"}), 400

    data = request.get_json()

    if not data or "answers" not in data:
        return jsonify({"msg": "Answers missing"}), 400

    answers = data["answers"]

    if not isinstance(answers, dict):
        return jsonify({"msg": "Invalid answers format"}), 400

    mcqs = MCQ.query.filter_by(
        day_number=day,
        domain=user.domain
    ).all()

    if not mcqs:
        return jsonify({"msg": "No MCQs found"}), 404

    score = 0

    for mcq in mcqs:
        selected = answers.get(str(mcq.id))
        if selected and selected == mcq.correct_answer:
            score += 2

    progress.mcq_score = score
    progress.date = date.today()

    user.total_points += score

    db.session.commit()

    return jsonify({
        "msg": "MCQ submitted successfully 💜",
        "score": score,
        "new_total_points": user.total_points
    })

@intern_bp.route("/intern/upload-leetcode/<int:day>", methods=["POST"])
@jwt_required()
def upload_leetcode(day):

    identity = get_jwt_identity()

    if identity == "admin":
        return jsonify({"msg": "Admins cannot upload"}), 403

    user_id = int(identity)
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    progress = DailyProgress.query.filter_by(
        user_id=user_id,
        day_number=day
    ).first()

    if not progress:
        return jsonify({"msg": "Invalid day"}), 400

    if progress.leet_pdf_url:
        return jsonify({"msg": "LeetCode already uploaded for this day"}), 400

    if "file" not in request.files:
        return jsonify({"msg": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"msg": "Empty filename"}), 400

    
    filename = secure_filename(f"{user.reg_no}_day{day}.pdf")

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    filepath = os.path.join(upload_folder, filename)

    file.save(filepath)

    progress.leet_pdf_url = filepath
    progress.date = date.today()

    db.session.commit()

    return jsonify({
        "msg": "LeetCode PDF uploaded successfully 💜",
        "status": "Pending Approval"
    })
@intern_bp.route("/intern/add-blog", methods=["POST"])
@jwt_required()
def add_blog():

    identity = get_jwt_identity()

    if identity == "admin":
        return jsonify({"msg": "Admins cannot add blogs"}), 403

    user_id = int(identity)
    user = User.query.get(user_id)

    data = request.json
    blog_date = data.get("date")
    link = data.get("link")

    if not blog_date or not link:
        return jsonify({"msg": "Missing fields"}), 400

    blog = Blog(
        user_id=user_id,
        blog_date=blog_date,
        medium_link=link,
        points=2
    )

    db.session.add(blog)

    user.total_points += 2

    db.session.commit()

    return jsonify({
        "msg": "Blog added 💜",
        "new_total_points": user.total_points
    })
@intern_bp.route("/intern/submit-final", methods=["POST"])
@jwt_required()
def submit_final():

    identity = get_jwt_identity()

    if identity == "admin":
        return jsonify({"msg": "Admins cannot submit"}), 403

    user_id = int(identity)
    user = User.query.get(user_id)

    data = request.json

    final = FinalProject.query.filter_by(user_id=user_id).first()

    if final:
        return jsonify({"msg": "Already submitted"}), 400

    final = FinalProject(
        user_id=user_id,
        github_link=data.get("github"),
        demo_video=data.get("demo"),
        deployed_link=data.get("deploy"),
        blog_link=data.get("blog"),
        submitted=True,
        approved=False
    )

    db.session.add(final)
    db.session.commit()

    return jsonify({"msg": "Final project submitted 💜"})