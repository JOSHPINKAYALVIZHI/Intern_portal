from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, jwt
from routes.intern import intern_bp
import os
from flask import send_from_directory
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
DATABASE_URL = os.getenv("DATABASE_URL")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["DATABASE_URL"] = DATABASE_URL
    print("DATABASE USED:", app.config["DATABASE_URL"])
    CORS(app,supports_credentials=True)

    db.init_app(app)
    jwt.init_app(app)

    from routes.auth import auth_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(intern_bp)
    @app.route("/")
    def home():
        return "Intern Portal API Running "

    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

    @app.route("/uploads/<path:filename>")
    def serve_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    return app
app = create_app()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
if __name__ == "__main__":
    app.run(debug=True)