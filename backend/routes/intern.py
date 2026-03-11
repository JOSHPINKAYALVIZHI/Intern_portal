from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, DailyProgress, Blog, FinalProject, MCQ, Profile
from extensions import db

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

    profile = Profile.query.filter_by(user_id=user_id).first()

    if not profile:
        return jsonify({"profile_complete": False})

    # check if roadmap already exists
    progress = DailyProgress.query.filter_by(user_id=user_id).all()

    roadmap = ROADMAPS.get(profile.domain, [])

    # create roadmap automatically if missing
    if len(progress) == 0:

        for i, item in enumerate(roadmap, start=1):

            progress_row = DailyProgress(
                user_id=user_id,
                day_number=i,
                task=item["title"],
                mcq_score=0
            )

            db.session.add(progress_row)

        db.session.commit()

        progress = DailyProgress.query.filter_by(user_id=user_id).all()

    activity = []

    for p in progress:

        if p.day_number > len(roadmap):
            continue

        status = "no_activity"

        if p.mcq_score > 0 and p.leetcode_pdf:
            status = "full_complete"
        elif p.mcq_score > 0:
            status = "mcq_done"

        phase_data = roadmap[p.day_number - 1]

        activity.append({
            "day": p.day_number,
            "phase": phase_data["phase"],
            "title": phase_data["title"],
            "description": phase_data["description"],
            "status": status
        })

    blog_count = Blog.query.filter_by(user_id=user_id).count()

    return jsonify({
        "profile_complete": True,
        "profile": {
            "name": profile.name,
            "domain": profile.domain,
            "total_points": profile.total_points
        },
        "blog_count": blog_count,
        "activity_grid": activity
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
        profile.domain = data.get("domain")
        profile.college_email = data.get("college_email")
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
                mcq_score=0
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
    path = f"uploads/{filename}"

    file.save(path)

    progress = DailyProgress.query.filter_by(
        user_id=user_id,
        day_number=day
    ).first()

    progress.daily_doc_url = path

    db.session.commit()

    return jsonify({"msg": "Document uploaded"})


@intern_bp.route("/intern/upload-leetcode/<int:day>", methods=["POST"])
@jwt_required()
def upload_leetcode(day):

    user_id = int(get_jwt_identity())

    file = request.files["file"]

    filename = f"{user_id}_day{day}_leetcode.pdf"
    path = f"uploads/{filename}"

    file.save(path)

    progress = DailyProgress.query.filter_by(
        user_id=user_id,
        day_number=day
    ).first()

    progress.leetcode_pdf = path

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