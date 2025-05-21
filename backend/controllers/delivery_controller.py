from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import uuid
from werkzeug.utils import secure_filename

from backend.models.delivery import Delivery

# Add allowed file extensions for image uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class DeliveryController:
    @staticmethod
    @jwt_required()
    def create_delivery():
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        # Get request data
        data = request.get_json()
        
        # Check if required fields are present
        required_fields = ['packageType', 'weight', 'dimensions', 'from', 'to']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Create new delivery
        delivery = Delivery(
            package_type=data['packageType'],
            weight=data['weight'],
            dimensions=data['dimensions'],
            from_address=data['from'],
            to_address=data['to'],
            user_id=user_id
        )
        
        # Save delivery
        delivery.save()
        
        # Return delivery data
        return jsonify({"delivery": delivery.to_dict()}), 201
    
    @staticmethod
    @jwt_required()
    def get_user_deliveries():
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        # Get deliveries for user
        deliveries = Delivery.find_by_user_id(user_id)
        
        # Return deliveries data
        return jsonify({
            "deliveries": [delivery.to_dict() for delivery in deliveries]
        }), 200
    
    @staticmethod
    @jwt_required()
    def get_user_delivery(delivery_id):
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        # Find delivery by ID
        delivery = Delivery.find_by_id(delivery_id)
        
        # Check if delivery exists
        if not delivery:
            return jsonify({"error": "Delivery not found"}), 404
        
        # Check if delivery belongs to user
        if delivery.user_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Return delivery data
        return jsonify({"delivery": delivery.to_dict()}), 200
    
    @staticmethod
    def track_delivery():
        # Get request data
        data = request.get_json()
        
        # Check if tracking number is provided
        if 'trackingNumber' not in data:
            return jsonify({"error": "Tracking number is required"}), 400
        
        # Find delivery by tracking number
        delivery = Delivery.find_by_tracking_number(data['trackingNumber'])
        
        # Check if delivery exists
        if not delivery:
            return jsonify({"error": "Delivery not found"}), 404
        
        # Return delivery data (without sensitive information)
        delivery_data = delivery.to_dict()
        delivery_data.pop('userId', None)  # Remove user ID for public tracking
        
        return jsonify({"delivery": delivery_data}), 200
    
    @staticmethod
    @jwt_required()
    def update_delivery_status(delivery_id):
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        # Find delivery by ID
        delivery = Delivery.find_by_id(delivery_id)
        
        # Check if delivery exists
        if not delivery:
            return jsonify({"error": "Delivery not found"}), 404
        
        # Check if delivery belongs to user
        if delivery.user_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Get request data
        data = request.get_json()
        
        # Check if status is provided
        if 'status' not in data:
            return jsonify({"error": "Status is required"}), 400
        
        # Validate status
        valid_statuses = ["Pending", "In-Transit", "Delivered", "Cancelled"]
        if data['status'] not in valid_statuses:
            return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
        
        # Update delivery status
        description = data.get('description')
        delivery.update_status(data['status'], description)
        
        # Return updated delivery data
        return jsonify({"delivery": delivery.to_dict()}), 200
    
    @staticmethod
    @jwt_required()
    def get_user_statistics():
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        # Get statistics for user
        statistics = Delivery.get_statistics(user_id)
        
        # Return statistics data
        return jsonify({"statistics": statistics}), 200
        
    @staticmethod
    @jwt_required()
    def upload_package_image(delivery_id):
        """Upload an image for a package"""
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        # Find delivery by ID
        delivery = Delivery.find_by_id(delivery_id)
        
        # Check if delivery exists
        if not delivery:
            return jsonify({"error": "Delivery not found"}), 404
        
        # Check if delivery belongs to user
        if delivery.user_id != user_id:
            return jsonify({"error": "Unauthorized"}), 403
            
        # Check if a file was uploaded
        if 'image' not in request.files:
            return jsonify({"error": "No image uploaded"}), 400
            
        file = request.files['image']
        
        # Check if the file is empty
        if file.filename == '':
            return jsonify({"error": "No image selected"}), 400
            
        # Check if the file type is allowed
        if file and allowed_file(file.filename):
            # Create a unique filename
            filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
            
            # Ensure the upload directory exists
            upload_dir = os.path.join(current_app.root_path, 'static', 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            
            # Save the file
            file_path = os.path.join(upload_dir, filename)
            file.save(file_path)
            
            # Update the delivery with the image path
            image_url = f"/static/uploads/{filename}"
            delivery.update_image(image_url)
            
            return jsonify({
                "message": "Image uploaded successfully",
                "imageUrl": image_url,
                "delivery": delivery.to_dict()
            }), 200
        else:
            return jsonify({"error": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400 