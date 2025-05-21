import os
import sys
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.routes.auth_routes import auth_bp
from backend.routes.delivery_routes import delivery_bp

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configure app
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 60 * 60 * 24  # 24 hours

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(delivery_bp)

    # Create a simple health check route
    @app.route('/health')
    def health_check():
        return {'status': 'alive'}, 200

    return app 