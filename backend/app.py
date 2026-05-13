
from flask import Flask, send_from_directory, send_file
from flask_cors import CORS
# from backend.models import User
from config import Config
from extensions import db, jwt
from routes.intern import intern_bp
from routes.auth import auth_bp
import os
from dotenv import load_dotenv
from routes.admin import admin_bp
from werkzeug.security import generate_password_hash
from models import User, db


load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure CORS for React frontend
    CORS(
        app,
        resources={r"/*": {"origins": ["http://localhost:5173", ""https://intern-portal-3hs9acopb-joshpinkayalvizhis-projects.vercel.app"]}},
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True
    )

    # Load config
    app.config.from_object(Config)

    print("DATABASE USED:", app.config["SQLALCHEMY_DATABASE_URI"])

    # JWT Secret
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    print(generate_password_hash("intern2026"))
    # Register routes
    app.register_blueprint(auth_bp)
    app.register_blueprint(intern_bp)
    app.register_blueprint(admin_bp)
    # Upload folder
    upload_folder = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = upload_folder

    @app.route("/")
    def home():
        return "Intern Portal API Running"

    @app.route("/uploads/<path:filename>")
    def serve_file(filename):
        try:
            file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            print(f"Attempting to serve file: {file_path}")
            print(f"File exists: {os.path.exists(file_path)}")
            if not os.path.exists(file_path):
                print(f"File not found at: {file_path}")
                return {"error": f"File not found: {filename}"}, 404
            print(f"Serving file: {file_path}")
            return send_file(file_path, as_attachment=False, mimetype='application/pdf')
        except Exception as e:
            print(f"Error serving file: {e}")
            import traceback
            traceback.print_exc()
            return {"error": str(e)}, 500

    @app.route('/<path:path>',methods=["OPTIONS"])
    def handle_options(path):
        return '', 200

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
