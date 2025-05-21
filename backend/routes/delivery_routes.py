from flask import Blueprint
from backend.controllers.delivery_controller import DeliveryController

delivery_bp = Blueprint('delivery', __name__, url_prefix='/api/deliveries')

# Register routes
delivery_bp.route('', methods=['POST'])(DeliveryController.create_delivery)
delivery_bp.route('', methods=['GET'])(DeliveryController.get_user_deliveries)
delivery_bp.route('/track', methods=['POST'])(DeliveryController.track_delivery)
delivery_bp.route('/statistics', methods=['GET'])(DeliveryController.get_user_statistics)
delivery_bp.route('/<int:delivery_id>', methods=['GET'])(DeliveryController.get_user_delivery)
delivery_bp.route('/<int:delivery_id>/status', methods=['PUT'])(DeliveryController.update_delivery_status)
delivery_bp.route('/<int:delivery_id>/image', methods=['POST'])(DeliveryController.upload_package_image) 