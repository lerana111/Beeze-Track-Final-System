import sqlite3
import os
from pathlib import Path

class Database:
    def __init__(self):
        # Get the path to the data directory
        self.db_path = os.path.join(Path(__file__).parent.parent, 'data', 'beezetrack.db')
        
        # Ensure data directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        # Initialize database
        self.conn = None
        self.initialize_db()

    def get_connection(self):
        """Get a connection to the database."""
        if self.conn is None:
            self.conn = sqlite3.connect(self.db_path)
            # Enable foreign keys
            self.conn.execute("PRAGMA foreign_keys = ON")
            # Return dictionary-like objects for rows
            self.conn.row_factory = sqlite3.Row
        return self.conn

    def initialize_db(self):
        """Initialize the database tables if they don't exist."""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Create users table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            bio TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')

        # Create deliveries table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tracking_number TEXT NOT NULL UNIQUE,
            package_type TEXT NOT NULL,
            weight TEXT NOT NULL,
            dimensions TEXT NOT NULL,
            from_address TEXT NOT NULL,
            to_address TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')

        # Create delivery updates table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS delivery_updates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            delivery_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (delivery_id) REFERENCES deliveries (id)
        )
        ''')

        conn.commit()

    def close(self):
        """Close the database connection."""
        if self.conn is not None:
            self.conn.close()
            self.conn = None 