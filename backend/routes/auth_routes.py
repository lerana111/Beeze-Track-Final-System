from flask import Blueprint
from backend.controllers.auth_controller import AuthController

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Register routes
auth_bp.route('/register', methods=['POST'])(AuthController.register)
auth_bp.route('/login', methods=['POST'])(AuthController.login)
auth_bp.route('/me', methods=['GET'])(AuthController.get_current_user)
auth_bp.route('/profile', methods=['PUT'])(AuthController.update_profile)
auth_bp.route('/password', methods=['PUT'])(AuthController.update_password) 