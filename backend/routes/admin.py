from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Blog, FinalProject, User, DailyProgress, Profile
from extensions import db
from datetime import date

admin_bp = Blueprint("admin", __name__,url_prefix="/admin")


# ---------------------------------------------------------  
# HELPER: CHECK ADMIN
# ---------------------------------------------------------  
def is_admin(identity):
    if identity == "admin":
        return True
    try:
        user_id = int(identity)
        user = User.query.get(user_id)
        return user and user.role == "ADMIN"
    except ValueError:
        return False


# ---------------------------------------------------------  
# GET ALL PENDING LEETCODE SUBMISSIONS
# ---------------------------------------------------------  
# @admin_bp.route("/admin/pending-leetcode", methods=["GET"])
# @jwt_required()
# def get_pending_leetcode():

#     identity = get_jwt_identity()

#     if not is_admin(identity):
#         return jsonify({"msg": "Only admin allowed"}), 403

#     pending = DailyProgress.query.filter(
#         DailyProgress.leetcode_pdf.isnot(None),
#         DailyProgress.leet_approved == False
#     ).all()

#     data = []

#     for p in pending:
#         profile = Profile.query.filter_by(user_id=p.user_id).first()
#         user = User.query.get(p.user_id)
        
#         if profile and user:
#             data.append({
#                 "id": p.id,
#                 "user_id": p.user_id,
#                 "name": profile.name,
#                 "reg_no": profile.reg_no,
#                 "day": p.day_number,
#                 "leetcode_pdf": p.leetcode_pdf,
#                 "daily_doc": p.daily_doc_url,
#                 "leet_approved": p.leet_approved
#             })

#     return jsonify(data)

@admin_bp.route("/pending-leetcode", methods=["GET"])
@jwt_required()
def pending_leetcode():
    identity = get_jwt_identity()
    
    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    data = db.session.query(DailyProgress, Profile).join(
        Profile, DailyProgress.user_id == Profile.user_id
    ).filter(
        DailyProgress.leetcode_pdf.isnot(None),
        DailyProgress.leet_approved == False
    ).all()

    result = []

    for progress, profile in data:
        result.append({
            "id": progress.id,
            "user_id": progress.user_id,
            "day": progress.day_number,
            "pdf": progress.leetcode_pdf,
            "name": profile.name,
            "reg_no": profile.reg_no
        })

    return jsonify(result)

# ---------------------------------------------------------  
# APPROVE LEETCODE SUBMISSION (by DailyProgress ID)
# ---------------------------------------------------------  
@admin_bp.route("/approve/<int:progress_id>", methods=["POST"])
@jwt_required()
def approve_by_id(progress_id):
    identity = get_jwt_identity()
    
    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    progress = DailyProgress.query.get(progress_id)

    if not progress:
        return jsonify({"msg": "Progress not found"}), 404

    if not progress.leetcode_pdf:
        return jsonify({"msg": "No LeetCode submission"}), 400

    if progress.leet_approved:
        return jsonify({"msg": "Already approved"}), 400

    user = User.query.get(progress.user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    progress.leet_approved = True
    progress.leet_points = 5

    if user.total_points is None:
        user.total_points = 0
    user.total_points += 5

    db.session.commit()

    return jsonify({
        "msg": "LeetCode Approved 💜",
        "user": user.name,
        "day": progress.day_number,
        "points_added": 5,
        "total_points": user.total_points
    })


# ---------------------------------------------------------  
# REJECT LEETCODE SUBMISSION (by DailyProgress ID)
# ---------------------------------------------------------  
@admin_bp.route("/reject/<int:progress_id>", methods=["POST"])
@jwt_required()
def reject_by_id(progress_id):
    identity = get_jwt_identity()
    
    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    progress = DailyProgress.query.get(progress_id)

    if not progress:
        return jsonify({"msg": "Progress not found"}), 404

    if not progress.leetcode_pdf:
        return jsonify({"msg": "No LeetCode submission"}), 400

    progress.leet_approved = False
    progress.leet_points = 0

    db.session.commit()

    return jsonify({"msg": "Submission rejected ❌"})

# ---------------------------------------------------------  
# APPROVE LEETCODE SUBMISSION
# ---------------------------------------------------------  
@admin_bp.route("/approve-leetcode/<int:user_id>/<int:day>", methods=["POST"])
@jwt_required()
def approve_leetcode(user_id, day):

    identity = get_jwt_identity()

    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    progress = DailyProgress.query.filter_by(
        user_id=user_id,
        day_number=day
    ).first()

    if not progress:
        return jsonify({"msg": "Progress not found"}), 404

    if not progress.leetcode_pdf:
        return jsonify({"msg": "No LeetCode submission"}), 400

    if progress.leet_approved:
        return jsonify({"msg": "Already approved"}), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    # ✅ Safe update
    progress.leet_approved = True
    progress.leet_points = 5

    if user.total_points is None:
        user.total_points = 0
    user.total_points += 5

    db.session.commit()

    return jsonify({
        "msg": "LeetCode Approved 💜",
        "user": user.name,
        "day": day,
        "points_added": 5,
        "total_points": user.total_points
    })


# ---------------------------------------------------------  
# REJECT LEETCODE SUBMISSION
# ---------------------------------------------------------  
@admin_bp.route("/reject-leetcode/<int:user_id>/<int:day>", methods=["POST"])
@jwt_required()
def reject_leetcode(user_id, day):

    identity = get_jwt_identity()

    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    progress = DailyProgress.query.filter_by(
        user_id=user_id,
        day_number=day
    ).first()

    if not progress:
        return jsonify({"msg": "Progress not found"}), 404

    progress.leet_approved = False
    progress.leet_points = 0

    db.session.commit()

    return jsonify({"msg": "Submission rejected ❌"})


# ---------------------------------------------------------  
# APPROVE FINAL PROJECT
# ---------------------------------------------------------  
@admin_bp.route("/approve-final/<int:user_id>", methods=["POST"])
@jwt_required()
def approve_final(user_id):

    identity = get_jwt_identity()

    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    final = FinalProject.query.filter_by(user_id=user_id).first()

    if not final:
        return jsonify({"msg": "Final project not submitted"}), 400

    if final.approved:
        return jsonify({"msg": "Already approved"}), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    final.approved = True
    user.total_points += 50

    db.session.commit()

    return jsonify({
        "msg": "Final project approved 💜",
        "points_added": 50,
        "total_points": user.total_points
    })


# ---------------------------------------------------------  
# GET ALL INTERNS WITH DETAILED SUBMISSIONS
# ---------------------------------------------------------  
@admin_bp.route("/all-interns-detailed", methods=["GET"])
@jwt_required()
def get_all_interns_detailed():

    identity = get_jwt_identity()

    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    users = User.query.filter_by(role="INTERN").all()
    data = []

    for user in users:
        profile = Profile.query.filter_by(user_id=user.id).first()
        if not profile:
            continue

        progress_list = DailyProgress.query.filter_by(user_id=user.id).all()
        blogs = Blog.query.filter_by(user_id=user.id).all()
        final = FinalProject.query.filter_by(user_id=user.id).first()

        submissions = []
        for p in progress_list:
            submission = {
                "id": p.id,
                "day": p.day_number,
                "daily_doc_url": p.daily_doc_url,
                "leetcode_pdf": p.leetcode_pdf,
                "leet_approved": p.leet_approved,
                "leet_points": p.leet_points
            }
            submissions.append(submission)

        data.append({
            "user_id": user.id,
            "name": profile.name,
            "reg_no": profile.reg_no,
            "domain": profile.domain,
            "college_email": profile.college_email,
            "total_points": user.total_points if user.total_points else 0,
            "submissions": submissions,
            "blogs": len(blogs),
            "final_project": {
                "submitted": final.submitted if final else False,
                "approved": final.approved if final else False,
                "github_link": final.github_link if final else None,
                "demo_video": final.demo_video if final else None
            }
        })

    return jsonify(data)


# ---------------------------------------------------------  
# GET INTERN DETAILS
# ---------------------------------------------------------  
@admin_bp.route("/intern/<int:user_id>", methods=["GET"])
@jwt_required()
def get_intern_details(user_id):

    identity = get_jwt_identity()

    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    user = User.query.get(user_id)
    profile = Profile.query.filter_by(user_id=user_id).first()

    if not user or not profile:
        return jsonify({"msg": "User not found"}), 404

    progress = DailyProgress.query.filter_by(user_id=user_id).all()
    blogs = Blog.query.filter_by(user_id=user_id).all()
    final = FinalProject.query.filter_by(user_id=user_id).first()

    return jsonify({

        "profile": {
            "name": profile.name,
            "reg_no": profile.reg_no,
            "domain": profile.domain,
            "college_email": profile.college_email,
            "linkedin": profile.linkedin,
            "github": profile.github,
            "total_points": user.total_points  # ✅ FIXED
        },

        "progress": [
            {
                "day": p.day_number,
               
                "leet": p.leet_approved
            }
            for p in progress
        ],

        "blogs": len(blogs),

        "final_project": final.submitted if final else False
    })


# ---------------------------------------------------------  
# ADMIN LEADERBOARD
# ---------------------------------------------------------  
@admin_bp.route("/leaderboard", methods=["GET"])
@jwt_required()
def leaderboard():

    identity = get_jwt_identity()

    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    users = User.query.filter_by(role="INTERN")\
        .order_by(User.total_points.desc())\
        .all()

    data = []

    for u in users:
        profile = Profile.query.filter_by(user_id=u.id).first()
        if profile:
            data.append({
                "user_id": u.id,
                "name": profile.name,
                "reg_no": profile.reg_no,
                "points": u.total_points if u.total_points is not None else 0  # ✅ DEFAULT TO 0
            })

    return jsonify(data)