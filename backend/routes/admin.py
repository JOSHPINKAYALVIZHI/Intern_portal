import profile

from flask import Blueprint, jsonify, request, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Blog, FinalProject, User, DailyProgress, Profile, Attendance
from extensions import db
from datetime import date, datetime
from werkzeug.security import generate_password_hash
import csv
from io import StringIO

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

    progress.leet_approved = True
    progress.leet_points = 5


    db.session.commit()

    return jsonify({
        "msg": "LeetCode Approved",
        
        "day": progress.day_number,
        
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

    return jsonify({"msg": "Submission rejected"})

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

    progress.leet_approved = True
    progress.leet_points = 5

    db.session.commit()

    return jsonify({
        "msg": "LeetCode Approved",
       
        "day": day,
        
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

    return jsonify({"msg": "Submission rejected"})


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
    profile = Profile.query.filter_by(user_id=user_id).first()

    if profile.total_points is None:
      profile.total_points = 0

      profile.total_points += 50

    db.session.commit()

    return jsonify({
        "msg": "Final project approved",
        "points_added": 50,
        "total_points": profile.total_points
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

                    "points": (
                        (5 if p.daily_doc_url else 0) +
                        (5 if p.leetcode_pdf else 0)
                    )
                }
            submissions.append(submission)

        data.append({
            "user_id": user.id,
            "name": profile.name,
            "reg_no": profile.reg_no,
            "department": profile.department,
            "domain": profile.domain,
            "college_email": profile.college_email,
            "total_points": sum(
    (5 if p.daily_doc_url else 0) +
    (5 if p.leetcode_pdf else 0)
    for p in progress_list
),
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

    progress = DailyProgress.query.filter_by(user_id=user_id)\
        .order_by(DailyProgress.day_number.asc())\
        .all()
    blogs = Blog.query.filter_by(user_id=user_id).all()
    final = FinalProject.query.filter_by(user_id=user_id).first()

    return jsonify({

        "profile": {
            "name": profile.name,
            "department": user.department,
            "reg_no": profile.reg_no,
            "domain": profile.domain,
            "college_email": profile.college_email,
            "linkedin": profile.linkedin,
            "github": profile.github,
            "total_points": sum(
    (5 if p.daily_doc_url else 0) +
    (5 if p.leetcode_pdf else 0)
    for p in progress
)
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

    profiles = Profile.query.order_by(Profile.total_points.desc()).all()

    data = []

    for p in profiles:
        data.append({
            "user_id": p.user_id,
            "name": p.name,
            "reg_no": p.reg_no,
            "points": p.total_points if p.total_points else 0
        })

    return jsonify(data)


# ---------------------------------------------------------  
# CREATE NEW USER MANUALLY
# ---------------------------------------------------------  
@admin_bp.route("/create-user", methods=["POST"])
@jwt_required()
def create_user():
    identity = get_jwt_identity()
    
    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    data = request.json
    
    # Validate required fields
    if not data.get("password") or not data.get("name"):
        return jsonify({"msg": "Missing required fields: name, password"}), 400
    
    # Generate a unique registration number if not provided
    reg_no = data.get("reg_no") or f"USER_{datetime.now().timestamp()}"
    
    # Check if user already exists
    existing_user = User.query.filter_by(reg_no=reg_no).first()
    if existing_user:
        return jsonify({"msg": "User already exists"}), 409
    
    # Create new user
    new_user = User(
        reg_no=reg_no,
        password=generate_password_hash(data.get("password")),
        name=data.get("name"),
        role="INTERN",
        department="",
        domain=""
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Create profile for the user (empty fields to be filled by intern later)
    profile = Profile(
        user_id=new_user.id,
        name=data.get("name"),
        reg_no=reg_no,
        domain="",
        college_email="",
        linkedin="",
        github="",
        total_points=0
    )
    
    db.session.add(profile)
    db.session.commit()
    
    return jsonify({
        "msg": "User created successfully",
        "user_id": new_user.id,
        "reg_no": reg_no
    }), 201


# ---------------------------------------------------------  
# LOG ATTENDANCE
# ---------------------------------------------------------  
@admin_bp.route("/log-attendance", methods=["POST"])
@jwt_required()
def log_attendance():
    identity = get_jwt_identity()
    
    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    data = request.json
    user_id = data.get("user_id")
    day_number = data.get("day_number")
    status = data.get("status", "present")  # in, out, absent, leave
    
    if not user_id or not day_number:
        return jsonify({"msg": "Missing user_id or day_number"}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    # Check if attendance already exists for this day
    attendance = Attendance.query.filter_by(
        user_id=user_id,
        day_number=day_number
    ).first()
    
    if not attendance:
        attendance = Attendance(
            user_id=user_id,
            day_number=day_number,
            status=status
        )
        db.session.add(attendance)
    
    # Log entry or exit time
    if status == "in":
        attendance.entry_time = datetime.utcnow()
        attendance.status = "present"
    elif status == "out":
        attendance.exit_time = datetime.utcnow()
    elif status in ["absent", "leave"]:
        attendance.status = status
    
    db.session.commit()
    
    return jsonify({
        "msg": f"Attendance logged: {status}",
        "user_id": user_id,
        "day_number": day_number
    })


# ---------------------------------------------------------  
# GET ATTENDANCE RECORDS
# ---------------------------------------------------------  
@admin_bp.route("/attendance/<int:user_id>", methods=["GET"])
@jwt_required()
def get_attendance(user_id):
    identity = get_jwt_identity()
    
    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    profile = Profile.query.filter_by(user_id=user_id).first()
    attendance_records = Attendance.query.filter_by(user_id=user_id).all()
    
    data = []
    for record in attendance_records:
        data.append({
            "day": record.day_number,
            "entry_time": record.entry_time.isoformat() if record.entry_time else None,
            "exit_time": record.exit_time.isoformat() if record.exit_time else None,
            "status": record.status
        })
    
    return jsonify({
        "user_id": user_id,
        "name": profile.name if profile else user.name,
        "reg_no": user.reg_no,
        "attendance": data
    })


# ---------------------------------------------------------  
# GET ALL ATTENDANCE
# ---------------------------------------------------------  
@admin_bp.route("/attendance-all", methods=["GET"])
@jwt_required()
def get_all_attendance():
    identity = get_jwt_identity()
    
    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    users = User.query.filter_by(role="INTERN").all()
    data = []
    
    for user in users:
        profile = Profile.query.filter_by(user_id=user.id).first()
        attendance_records = Attendance.query.filter_by(user_id=user.id).all()
        
        user_attendance = []
        for record in attendance_records:
            user_attendance.append({
                "day": record.day_number,
                "entry_time": record.entry_time.isoformat() if record.entry_time else None,
                "exit_time": record.exit_time.isoformat() if record.exit_time else None,
                "status": record.status
            })
        
        data.append({
            "user_id": user.id,
            "name": profile.name if profile else user.name,
            "reg_no": user.reg_no,
            "department": profile.department,
            "domain": user.domain,
            "attendance": user_attendance
        })
    
    return jsonify(data)


# ---------------------------------------------------------  
# EXPORT ATTENDANCE AS CSV
# ---------------------------------------------------------  
@admin_bp.route("/export-attendance", methods=["GET"])
@jwt_required()
def export_attendance():
    identity = get_jwt_identity()
    
    if not is_admin(identity):
        return jsonify({"msg": "Only admin allowed"}), 403

    users = User.query.filter_by(role="INTERN").all()
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Header
    headers = ["User ID", "Name", "Reg No", "Department", "Domain"]
    for day in range(1, 22):
        headers.extend([f"Day {day} Entry", f"Day {day} Exit", f"Day {day} Status"])
    writer.writerow(headers)
    
    # Data
    for user in users:
        profile = Profile.query.filter_by(user_id=user.id).first()
        row = [
            user.id,
            profile.name if profile else user.name,
            user.reg_no,
            user.department,
            user.domain
        ]
        
        for day in range(1, 22):
            attendance = Attendance.query.filter_by(
                user_id=user.id,
                day_number=day
            ).first()
            
            if attendance:
                entry_time = attendance.entry_time.strftime("%H:%M:%S") if attendance.entry_time else "-"
                exit_time = attendance.exit_time.strftime("%H:%M:%S") if attendance.exit_time else "-"
                status = attendance.status
            else:
                entry_time = "-"
                exit_time = "-"
                status = "absent"
            
            row.extend([entry_time, exit_time, status])
        
        writer.writerow(row)
    
    response_data = output.getvalue()
    
    response = make_response(response_data)
    response.headers["Content-Disposition"] = f"attachment; filename=attendance_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    response.headers["Content-Type"] = "text/csv"
    return response