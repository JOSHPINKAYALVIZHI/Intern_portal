from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, DailyProgress, Blog, FinalProject,  Profile
from extensions import db
import os

intern_bp = Blueprint("intern", __name__)

# ---------------------------------------
# DOMAIN ROADMAP
# ---------------------------------------

ROADMAPS = {

    "Web": [
        {
            "phase": "Phase 1",
            "title": "Web Basics",
            "description": "Understanding how websites work, including client-server communication and browser functionality."
        },
        {
            "phase": "Phase 2",
            "title": "Frontend Development",
            "description": "Building responsive user interfaces using HTML, CSS, and JavaScript."
        },
        {
            "phase": "Phase 3",
            "title": "Backend Development",
            "description": "Developing server-side APIs and authentication systems."
        },
        {
            "phase": "Phase 4",
            "title": "Database Management",
            "description": "Managing application data using relational and NoSQL databases."
        },
        {
            "phase": "Phase 5",
            "title": "Deployment & Maintenance",
            "description": "Deploying applications to cloud platforms and maintaining performance."
        }
    ],

    "AI": [
        {
            "phase": "Phase 1",
            "title": "Programming Fundamentals",
            "description": "Learning Python and programming basics."
        },
        {
            "phase": "Phase 2",
            "title": "Mathematics for AI",
            "description": "Studying statistics, probability and linear algebra."
        },
        {
            "phase": "Phase 3",
            "title": "Machine Learning",
            "description": "Training ML models with supervised and unsupervised learning."
        },
        {
            "phase": "Phase 4",
            "title": "Deep Learning",
            "description": "Working with neural networks and computer vision."
        },
        {
            "phase": "Phase 5",
            "title": "AI Deployment",
            "description": "Deploying AI models into real-world applications."
        }
    ],

    "Cybersecurity": [
        {
            "phase": "Phase 1",
            "title": "Security Fundamentals",
            "description": "Understanding cyber threats and protection strategies."
        },
        {
            "phase": "Phase 2",
            "title": "Networking Security",
            "description": "Learning firewalls, protocols and infrastructure protection."
        },
        {
            "phase": "Phase 3",
            "title": "Ethical Hacking",
            "description": "Performing penetration testing and vulnerability analysis."
        },
        {
            "phase": "Phase 4",
            "title": "Cryptography",
            "description": "Protecting sensitive data using encryption techniques."
        },
        {
            "phase": "Phase 5",
            "title": "Incident Response",
            "description": "Handling cyber attacks and defense strategies."
        }
    ],

    "Embedded Systems": [
        {
            "phase": "Phase 1",
            "title": "Electronics Basics",
            "description": "Understanding circuits, sensors and microcontrollers."
        },
        {
            "phase": "Phase 2",
            "title": "Microcontroller Programming",
            "description": "Programming Arduino, STM32 and Raspberry Pi."
        },
        {
            "phase": "Phase 3",
            "title": "Hardware Interfacing",
            "description": "Connecting sensors, motors and communication modules."
        },
        {
            "phase": "Phase 4",
            "title": "Real Time Systems",
            "description": "Building optimized embedded applications with RTOS."
        },
        {
            "phase": "Phase 5",
            "title": "IoT Systems",
            "description": "Connecting embedded devices to cloud platforms."
        }
    ]

}

# ---------------------------------------
# DASHBOARD
# ---------------------------------------

@intern_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():

    user_id = get_jwt_identity()
    
    # Handle both admin and intern logins
    if user_id == "admin":
        return jsonify({"error": "Admins cannot access intern dashboard"}), 403
    
    try:
        user_id = int(user_id)
    except:
        return jsonify({"error": "Invalid user ID"}), 400
    user = User.query.get(user_id)
    profile = Profile.query.filter_by(user_id=user_id).first()

    if not profile:
        return jsonify({"profile_complete": False})

    progress = DailyProgress.query.filter_by(user_id=user_id).all()

    roadmap = ROADMAPS.get(profile.domain, [])

    # Create roadmap rows if none exist
    if len(progress) == 0:

        for i in range(1, 22):
            progress_row = DailyProgress(
                user_id=user_id,
                day_number=i,
                task=f"Day {i} Task",
               
            )
            db.session.add(progress_row)

        db.session.commit()

    activity = []

    for i in range(1, 22):

        progress_row = DailyProgress.query.filter_by(
            user_id=user_id,
            day_number=i
        ).first()

        status = "no_activity"

        if progress_row:
            if progress_row.daily_doc_url and progress_row.leetcode_pdf:
                status = "complete"
            elif progress_row.daily_doc_url or progress_row.leetcode_pdf:
                status = "partial"

        activity.append({
        "day": i,
        "status": status,
        "doc_url": progress_row.daily_doc_url if progress_row else None,
        "leetcode_url": progress_row.leetcode_pdf if progress_row else None
})

    blog_count = Blog.query.filter_by(user_id=user_id).count()

    return jsonify({
        "profile_complete": True,
        "profile": {
            "name": profile.name,
            "reg_no": user.reg_no,
            "department": profile.department,
            "domain": profile.domain,
            "college_email": profile.college_email,
            "linkedin": profile.linkedin,
            "github": profile.github,
            "total_points": user.total_points if user.total_points else 0
        },
        "blog_count": blog_count,
        "activity_grid": activity,
        "roadmap": roadmap
    })
# ---------------------------------------
# PROFILE SETUP
# ---------------------------------------

@intern_bp.route("/intern/setup-profile", methods=["POST"])
@jwt_required()
def setup_profile():

    user_id = get_jwt_identity()
    data = request.json

    profile = Profile.query.filter_by(user_id=user_id).first()

    if not profile:

        profile = Profile(
            user_id=user_id,
            name=data.get("name"),
            department=data.get("department"),
            reg_no=data.get("reg_no"),
            domain=data.get("domain"),
            college_email=data.get("college_email"),
            linkedin=data.get("linkedin"),
            github=data.get("github"),
            total_points=0
        )

        db.session.add(profile)

    else:

        profile.name = data.get("name")
        # profile.department = data.get("department")
        profile.domain = data.get("domain")
        profile.college_email = data.get("college_email")
        profile.department = data.get("department")
        profile.linkedin = data.get("linkedin")
        profile.github = data.get("github")

    db.session.commit()

    existing = DailyProgress.query.filter_by(user_id=user_id).first()

    if not existing:

        roadmap = ROADMAPS.get(profile.domain, [])

        for i, item in enumerate(roadmap, start=1):

            progress = DailyProgress(
                user_id=user_id,
                day_number=i,
                task=item["title"],
                
            )

            db.session.add(progress)

        db.session.commit()

    return jsonify({"msg": "Profile saved and roadmap generated"})


# ---------------------------------------
# BLOG
# ---------------------------------------

@intern_bp.route("/intern/add-blog", methods=["POST"])
@jwt_required()
def add_blog():

    data = request.json
    user_id = int(get_jwt_identity())

    blog = Blog(
        user_id=user_id,
        medium_link=data["link"],
        blog_date=data["date"]
    )

    db.session.add(blog)

    profile = Profile.query.filter_by(user_id=user_id).first()
    profile.total_points += 40

    db.session.commit()

    return jsonify({"msg": "Blog submitted"})


# ---------------------------------------
# FILE UPLOADS
# ---------------------------------------

@intern_bp.route("/intern/upload-daily-doc/<int:day>", methods=["POST"])
@jwt_required()
def upload_doc(day):

    user_id = int(get_jwt_identity())

    file = request.files["file"]

    filename = f"{user_id}_day{day}_doc.pdf"
    filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    
    file.save(filepath)
    
    file_url = f"https://intern-portal-nepj.onrender.com/uploads/{filename}"

    progress = DailyProgress.query.filter_by(
    user_id=user_id,
    day_number=day
).first()
    profile = Profile.query.filter_by(user_id=user_id).first()
    profile.total_points += 5

    if not progress:
        progress = DailyProgress(
        user_id=user_id,
        day_number=day
    )
    db.session.add(progress)

    progress.daily_doc_url = file_url

    db.session.commit()

    return jsonify({"msg": "Document uploaded"})


@intern_bp.route("/intern/upload-leetcode/<int:day>", methods=["POST"])
@jwt_required()
def upload_leetcode(day):

    user_id = int(get_jwt_identity())

    file = request.files["file"]

    filename = f"{user_id}_day{day}_leetcode.pdf"
    filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    
    file.save(filepath)
    
    file_url = f"https://intern-portal-nepj.onrender.com/uploads/{filename}"

    progress = DailyProgress.query.filter_by(
    user_id=user_id,
    day_number=day
).first()
    profile = Profile.query.filter_by(user_id=user_id).first()
    profile.total_points += 5
    if not progress:
        progress = DailyProgress(
        user_id=user_id,
        day_number=day
    )
    db.session.add(progress)

    progress.leetcode_pdf = file_url

    db.session.commit()

    return jsonify({"msg": "LeetCode uploaded"})


# ---------------------------------------
# LEADERBOARD
# ---------------------------------------

@intern_bp.route("/leaderboard")
def leaderboard():

    users = Profile.query.order_by(Profile.total_points.desc()).limit(10)

    data = []

    for u in users:

        data.append({
            "name": u.name,
            "domain": u.domain,
            "points": u.total_points
        })

    return jsonify(data)


# ---------------------------------------
# FINAL PROJECT
# ---------------------------------------

@intern_bp.route("/intern/submit-final", methods=["POST"])
@jwt_required()
def submit_final():

    user_id = int(get_jwt_identity())

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

    return jsonify({"msg": "Final project submitted"})


# ----------------------------------------
# GET INTERN'S OWN SUBMISSIONS (VIEW UPLOADS)
# ----------------------------------------
@intern_bp.route("/intern/my-submissions", methods=["GET"])
@jwt_required()
def get_my_submissions():
    user_id = int(get_jwt_identity())
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    profile = Profile.query.filter_by(user_id=user_id).first()
    submissions = DailyProgress.query.filter_by(user_id=user_id).order_by(DailyProgress.day_number).all()
    
    data = []
    for sub in submissions:
        data.append({
            "day": sub.day_number,
            "daily_doc_url": sub.daily_doc_url,
            "leetcode_pdf": sub.leetcode_pdf,
            "leet_approved": sub.leet_approved,
            "leet_points": sub.leet_points
        })
    
    return jsonify({
        "profile": {
            "name": profile.name if profile else user.name,
            "reg_no": user.reg_no,
            "domain": profile.domain if profile else "Unknown"
        },
        "submissions": data
    })


# ----------------------------------------
# UPDATE PROFILE (EDIT)
# ----------------------------------------
@intern_bp.route("/intern/update-profile", methods=["POST"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    data = request.json
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"msg": "Profile not found"}), 404
    
    # Update allowed fields
    profile.name = data.get("name", profile.name)
    profile.college_email = data.get("college_email", profile.college_email)
    profile.department = data.get("department", profile.department)
    profile.linkedin = data.get("linkedin", profile.linkedin)
    profile.github = data.get("github", profile.github)
    
    db.session.commit()
    
    return jsonify({"msg": "Profile updated successfully"})