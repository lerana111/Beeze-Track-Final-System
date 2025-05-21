from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from backend.models.user import User

class AuthController:
    @staticmethod
    def register():
        data = request.get_json()
        
        # Check if required fields are present
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check if user already exists
        existing_user = User.find_by_email(data['email'])
        if existing_user:
            return jsonify({"error": "User with this email already exists"}), 409
        
        # Create new user
        user = User(
            name=data['name'],
            email=data['email'],
            password=data['password'],
            phone=data.get('phone'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            zip_code=data.get('zipCode'),
            bio=data.get('bio')
        )
        
        user.save()
        
        # Generate access token
        access_token = create_access_token(identity=user.id)
        
        # Return user data and token
        return jsonify({
            "user": user.to_dict(),
            "token": access_token
        }), 201
    
    @staticmethod
    def login():
        data = request.get_json()
        
        # Check if required fields are present
        if 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Find user by email
        user = User.find_by_email(data['email'])
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Verify password
        if not User.verify_password(user.password, data['password']):
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Generate access token
        access_token = create_access_token(identity=user.id)
        
        # Return user data and token
        return jsonify({
            "user": user.to_dict(),
            "token": access_token
        }), 200
    
    @staticmethod
    @jwt_required()
    def get_current_user():
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        # Find user by ID
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Return user data
        return jsonify({"user": user.to_dict()}), 200
    
    @staticmethod
    @jwt_required()
    def update_profile():
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        # Find user by ID
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get request data
        data = request.get_json()
        
        # Update user fields
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        if 'address' in data:
            user.address = data['address']
        if 'city' in data:
            user.city = data['city']
        if 'state' in data:
            user.state = data['state']
        if 'zipCode' in data:
            user.zip_code = data['zipCode']
        if 'bio' in data:
            user.bio = data['bio']
        
        # Save updated user
        user.save()
        
        # Return updated user data
        return jsonify({"user": user.to_dict()}), 200
    
    @staticmethod
    @jwt_required()
    def update_password():
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        # Find user by ID
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get request data
        data = request.get_json()
        
        # Check if required fields are present
        if 'currentPassword' not in data or 'newPassword' not in data:
            return jsonify({"error": "Current password and new password are required"}), 400
        
        # Verify current password
        if not User.verify_password(user.password, data['currentPassword']):
            return jsonify({"error": "Current password is incorrect"}), 401
        
        # Update password
        user.update_password(data['newPassword'])
        
        return jsonify({"message": "Password updated successfully"}), 200 