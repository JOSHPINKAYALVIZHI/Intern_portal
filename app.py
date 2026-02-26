from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, jwt
from routes.intern import intern_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    print("DATABASE USED:", app.config["SQLALCHEMY_DATABASE_URI"])
    CORS(app)

    db.init_app(app)
    jwt.init_app(app)

    from routes.auth import auth_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(intern_bp)
    @app.route("/")
    def home():
        return "Intern Portal API Running "

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)