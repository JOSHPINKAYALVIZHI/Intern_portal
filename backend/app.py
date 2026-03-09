
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from extensions import db, jwt
from routes.intern import intern_bp
from routes.auth import auth_bp
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Load config
    app.config.from_object(Config)

    print("DATABASE USED:", app.config["SQLALCHEMY_DATABASE_URI"])

    # JWT Secret
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

    # Allow React frontend
    CORS(app)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)

    # Register routes
    app.register_blueprint(auth_bp)
    app.register_blueprint(intern_bp)

    # Upload folder
    upload_folder = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = upload_folder

    @app.route("/")
    def home():
        return "Intern Portal API Running"

    @app.route("/uploads/<path:filename>")
    def serve_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)