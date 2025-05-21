import sqlite3
import datetime
import random
import string
from .db import Database

class DeliveryUpdate:
    def __init__(self, id=None, delivery_id=None, status=None, date=None, time=None, description=None):
        self.id = id
        self.delivery_id = delivery_id
        self.status = status
        self.date = date
        self.time = time
        self.description = description
    
    def to_dict(self):
        """Convert delivery update to dictionary."""
        return {
            'id': self.id,
            'delivery_id': self.delivery_id,
            'status': self.status,
            'date': self.date,
            'time': self.time,
            'description': self.description
        }

class Delivery:
    def __init__(self, id=None, tracking_number=None, package_type=None, weight=None, dimensions=None, 
                 from_address=None, to_address=None, date=None, status=None, user_id=None, image_url=None):
        self.id = id
        self.tracking_number = tracking_number or self._generate_tracking_number()
        self.package_type = package_type
        self.weight = weight
        self.dimensions = dimensions
        self.from_address = from_address
        self.to_address = to_address
        self.date = date or datetime.datetime.now().strftime("%B %d, %Y")
        self.status = status or "Pending"
        self.user_id = user_id
        self.image_url = image_url
        self.updates = []
        self.db = Database()

    def _generate_tracking_number(self):
        """Generate a unique tracking number."""
        prefix = "BZ"
        # Generate 6 random digits
        random_digits = ''.join(random.choices(string.digits, k=6))
        return f"{prefix}{random_digits}"
    
    def to_dict(self):
        """Convert delivery object to dictionary."""
        return {
            'id': self.id,
            'trackingNumber': self.tracking_number,
            'packageType': self.package_type,
            'weight': self.weight,
            'dimensions': self.dimensions,
            'from': self.from_address,
            'to': self.to_address,
            'date': self.date,
            'status': self.status,
            'userId': self.user_id,
            'imageUrl': self.image_url,
            'updates': [update.to_dict() for update in self.updates]
        }
    
    def save(self):
        """Save delivery to database."""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Check if the deliveries table has the image_url column
        cursor.execute("PRAGMA table_info(deliveries)")
        columns = cursor.fetchall()
        has_image_url = any(column['name'] == 'image_url' for column in columns)

        # Add image_url column if it doesn't exist
        if not has_image_url:
            cursor.execute("ALTER TABLE deliveries ADD COLUMN image_url TEXT")
            conn.commit()
        
        if self.id is None:
            cursor.execute('''
            INSERT INTO deliveries (tracking_number, package_type, weight, dimensions, from_address, to_address, date, status, user_id, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (self.tracking_number, self.package_type, self.weight, self.dimensions, self.from_address, self.to_address, self.date, self.status, self.user_id, self.image_url))
            
            self.id = cursor.lastrowid
            
            # Add initial delivery update
            current_time = datetime.datetime.now().strftime("%I:%M %p")
            description = f"Your package has been scheduled for pickup."
            
            cursor.execute('''
            INSERT INTO delivery_updates (delivery_id, status, date, time, description)
            VALUES (?, ?, ?, ?, ?)
            ''', (self.id, self.status, self.date, current_time, description))
        else:
            cursor.execute('''
            UPDATE deliveries
            SET tracking_number = ?, package_type = ?, weight = ?, dimensions = ?, from_address = ?, to_address = ?, date = ?, status = ?, user_id = ?, image_url = ?
            WHERE id = ?
            ''', (self.tracking_number, self.package_type, self.weight, self.dimensions, self.from_address, self.to_address, self.date, self.status, self.user_id, self.image_url, self.id))
        
        conn.commit()
        return self
    
    def update_status(self, new_status, description=None):
        """Update delivery status and add a status update entry."""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # Update delivery status
        cursor.execute('UPDATE deliveries SET status = ? WHERE id = ?', (new_status, self.id))
        
        # Create status update record
        current_date = datetime.datetime.now().strftime("%B %d, %Y")
        current_time = datetime.datetime.now().strftime("%I:%M %p")
        
        if description is None:
            description = f"Your package status has been updated to {new_status}."
        
        cursor.execute('''
        INSERT INTO delivery_updates (delivery_id, status, date, time, description)
        VALUES (?, ?, ?, ?, ?)
        ''', (self.id, new_status, current_date, current_time, description))
        
        self.status = new_status
        conn.commit()
        
        # Refresh the updates list
        self.load_updates()
        
        return self
    
    def update_image(self, image_url):
        """Update the package image URL."""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # Update image URL
        cursor.execute('UPDATE deliveries SET image_url = ? WHERE id = ?', (image_url, self.id))
        
        self.image_url = image_url
        conn.commit()
        
        return self
    
    def load_updates(self):
        """Load all updates for this delivery."""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT * FROM delivery_updates
        WHERE delivery_id = ?
        ORDER BY created_at DESC
        ''', (self.id,))
        
        updates_data = cursor.fetchall()
        self.updates = []
        
        for update_data in updates_data:
            update = DeliveryUpdate(
                id=update_data['id'],
                delivery_id=update_data['delivery_id'],
                status=update_data['status'],
                date=update_data['date'],
                time=update_data['time'],
                description=update_data['description']
            )
            self.updates.append(update)
        
        return self.updates
    
    @staticmethod
    def find_by_id(delivery_id):
        """Find delivery by ID."""
        db = Database()
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM deliveries WHERE id = ?', (delivery_id,))
        delivery_data = cursor.fetchone()
        
        if delivery_data:
            delivery = Delivery(
                id=delivery_data['id'],
                tracking_number=delivery_data['tracking_number'],
                package_type=delivery_data['package_type'],
                weight=delivery_data['weight'],
                dimensions=delivery_data['dimensions'],
                from_address=delivery_data['from_address'],
                to_address=delivery_data['to_address'],
                date=delivery_data['date'],
                status=delivery_data['status'],
                user_id=delivery_data['user_id'],
                image_url=delivery_data['image_url']
            )
            delivery.load_updates()
            return delivery
        return None
    
    @staticmethod
    def find_by_tracking_number(tracking_number):
        """Find delivery by tracking number."""
        db = Database()
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM deliveries WHERE tracking_number = ?', (tracking_number,))
        delivery_data = cursor.fetchone()
        
        if delivery_data:
            delivery = Delivery(
                id=delivery_data['id'],
                tracking_number=delivery_data['tracking_number'],
                package_type=delivery_data['package_type'],
                weight=delivery_data['weight'],
                dimensions=delivery_data['dimensions'],
                from_address=delivery_data['from_address'],
                to_address=delivery_data['to_address'],
                date=delivery_data['date'],
                status=delivery_data['status'],
                user_id=delivery_data['user_id'],
                image_url=delivery_data['image_url']
            )
            delivery.load_updates()
            return delivery
        return None
    
    @staticmethod
    def find_by_user_id(user_id):
        """Find all deliveries for a user."""
        db = Database()
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM deliveries WHERE user_id = ? ORDER BY date DESC', (user_id,))
        deliveries_data = cursor.fetchall()
        
        deliveries = []
        for delivery_data in deliveries_data:
            delivery = Delivery(
                id=delivery_data['id'],
                tracking_number=delivery_data['tracking_number'],
                package_type=delivery_data['package_type'],
                weight=delivery_data['weight'],
                dimensions=delivery_data['dimensions'],
                from_address=delivery_data['from_address'],
                to_address=delivery_data['to_address'],
                date=delivery_data['date'],
                status=delivery_data['status'],
                user_id=delivery_data['user_id'],
                image_url=delivery_data['image_url']
            )
            delivery.load_updates()
            deliveries.append(delivery)
        
        return deliveries
    
    @staticmethod
    def get_statistics(user_id=None):
        """Get delivery statistics, optionally filtered by user_id."""
        db = Database()
        conn = db.get_connection()
        cursor = conn.cursor()
        
        query_params = []
        user_filter = ""
        if user_id:
            user_filter = "WHERE user_id = ?"
            query_params.append(user_id)
        
        # Get total deliveries
        cursor.execute(f'SELECT COUNT(*) as count FROM deliveries {user_filter}', query_params)
        result = cursor.fetchone()
        total_deliveries = result['count'] if result else 0
        
        # Get pending deliveries
        if user_id:
            cursor.execute('SELECT COUNT(*) as count FROM deliveries WHERE user_id = ? AND status = "Pending"', (user_id,))
        else:
            cursor.execute('SELECT COUNT(*) as count FROM deliveries WHERE status = "Pending"')
        result = cursor.fetchone()
        pending_deliveries = result['count'] if result else 0
        
        # Get in-transit deliveries
        if user_id:
            cursor.execute('SELECT COUNT(*) as count FROM deliveries WHERE user_id = ? AND status = "In-Transit"', (user_id,))
        else:
            cursor.execute('SELECT COUNT(*) as count FROM deliveries WHERE status = "In-Transit"')
        result = cursor.fetchone()
        in_transit_deliveries = result['count'] if result else 0
        
        # Get delivered deliveries
        if user_id:
            cursor.execute('SELECT COUNT(*) as count FROM deliveries WHERE user_id = ? AND status = "Delivered"', (user_id,))
        else:
            cursor.execute('SELECT COUNT(*) as count FROM deliveries WHERE status = "Delivered"')
        result = cursor.fetchone()
        delivered_deliveries = result['count'] if result else 0
        
        # For demo purposes, we'll generate some fake statistics
        on_time_delivery_rate = 95 if delivered_deliveries > 0 else 0
        average_delivery_time = "2.5 days" if delivered_deliveries > 0 else "0 days"
        customer_satisfaction = 4.8 if delivered_deliveries > 0 else 0
        
        return {
            'totalDeliveries': total_deliveries,
            'pendingDeliveries': pending_deliveries,
            'inTransitDeliveries': in_transit_deliveries,
            'deliveredDeliveries': delivered_deliveries,
            'onTimeDeliveryRate': on_time_delivery_rate,
            'averageDeliveryTime': average_delivery_time,
            'customerSatisfaction': customer_satisfaction
        } 