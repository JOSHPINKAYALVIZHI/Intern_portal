
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from models import User, DailyProgress, Blog, FinalProject, MCQ
from extensions import db
from werkzeug.utils import secure_filename
import os
from flask import current_app
intern_bp = Blueprint("intern", __name__)
@intern_bp.route("/intern/dashboard")
@jwt_required()
def dashboard():

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user.domain:
        return jsonify({
            "profile_complete": False,
            "name": user.name
        })

    progress_list = DailyProgress.query.filter_by(user_id=user_id).all()

    activity_grid = []

    for p in progress_list:

        status = "no_activity"

        if p.mcq_score > 0 and p.leet_pdf_url:
            status = "full_complete"

        elif p.mcq_score > 0:
            status = "mcq_done"

        activity_grid.append({
            "day": p.day_number,
            "status": status
        })

    blog_count = Blog.query.filter_by(user_id=user_id).count()

    return jsonify({
        "profile_complete": True,
        "profile": {
            "name": user.name,
            "domain": user.domain,
            "total_points": user.total_points
        },
        "blog_count": blog_count,
        "activity_grid": activity_grid
    })
@intern_bp.route("/intern/setup-profile", methods=["POST"])
@jwt_required()
def setup_profile():

    user_id = get_jwt_identity()
    data = request.json

    user = User.query.get(user_id)

    user.name = data.get("name")
    user.reg_no = data.get("reg_no")
    user.domain = data.get("domain")
    user.college_email = data.get("college_email")
    user.linkedin = data.get("linkedin")
    user.github = data.get("github")

    db.session.commit()

    # 🔹 Create 21-day roadmap automatically
    existing = DailyProgress.query.filter_by(user_id=user_id).first()

    if not existing:

        for day in range(1, 22):

            progress = DailyProgress(
                user_id=user_id,
                day_number=day,
                mcq_score=0,
                leet_pdf_url=None
            )

            db.session.add(progress)

        db.session.commit()

    return jsonify({
        "msg": "Profile saved and roadmap generated 💜"
    }) 
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