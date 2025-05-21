import sqlite3
import bcrypt
from .db import Database

class User:
    def __init__(self, id=None, name=None, email=None, password=None, phone=None, address=None, city=None, state=None, zip_code=None, bio=None):
        self.id = id
        self.name = name
        self.email = email
        self.password = password
        self.phone = phone
        self.address = address
        self.city = city
        self.state = state
        self.zip_code = zip_code
        self.bio = bio
        self.db = Database()

    def to_dict(self):
        """Convert user object to dictionary, excluding password."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zipCode': self.zip_code,
            'bio': self.bio
        }

    def save(self):
        """Save user to database."""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        if self.id is None:
            # Hash the password before storing
            hashed_password = bcrypt.hashpw(self.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            cursor.execute('''
            INSERT INTO users (name, email, password, phone, address, city, state, zip_code, bio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (self.name, self.email, hashed_password, self.phone, self.address, self.city, self.state, self.zip_code, self.bio))
            
            self.id = cursor.lastrowid
        else:
            cursor.execute('''
            UPDATE users
            SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ?, bio = ?
            WHERE id = ?
            ''', (self.name, self.email, self.phone, self.address, self.city, self.state, self.zip_code, self.bio, self.id))
        
        conn.commit()
        return self

    def update_password(self, new_password):
        """Update user password."""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # Hash the new password
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cursor.execute('''
        UPDATE users
        SET password = ?
        WHERE id = ?
        ''', (hashed_password, self.id))
        
        conn.commit()
        return True

    @staticmethod
    def verify_password(stored_password, provided_password):
        """Verify a password against a stored hash."""
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password.encode('utf-8'))

    @staticmethod
    def find_by_email(email):
        """Find a user by email."""
        db = Database()
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user_data = cursor.fetchone()
        
        if user_data:
            user = User(
                id=user_data['id'],
                name=user_data['name'],
                email=user_data['email'],
                password=user_data['password'],
                phone=user_data['phone'],
                address=user_data['address'],
                city=user_data['city'],
                state=user_data['state'],
                zip_code=user_data['zip_code'],
                bio=user_data['bio']
            )
            return user
        return None

    @staticmethod
    def find_by_id(user_id):
        """Find a user by ID."""
        db = Database()
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user_data = cursor.fetchone()
        
        if user_data:
            user = User(
                id=user_data['id'],
                name=user_data['name'],
                email=user_data['email'],
                password=user_data['password'],
                phone=user_data['phone'],
                address=user_data['address'],
                city=user_data['city'],
                state=user_data['state'],
                zip_code=user_data['zip_code'],
                bio=user_data['bio']
            )
            return user
        return None 