# BeezeTrack - Package Delivery Tracking System

BeezeTrack is a complete package delivery tracking system with a Next.js frontend and Python Flask backend.

## Features

- User authentication and account management
- Package scheduling and tracking
- Real-time delivery status updates
- Dashboard with delivery statistics
- Responsive design for all devices

## Setup Instructions

### Backend Setup

1. Make sure you have Python 3.8+ installed
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Create a virtual environment:
   ```
   python -m venv venv
   ```
4. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
5. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
6. Run the simple Flask application (for testing):
   ```
   python simple_app.py
   ```
   Or run the full Flask application:
   ```
   python run.py
   ```
7. The API should now be running at `http://localhost:5000`

### Troubleshooting Backend

If you encounter import errors when running the full application, you can:

1. Try the simple test app first to verify Flask is working correctly:
   ```
   python backend/simple_app.py
   ```
2. Make sure all required packages are installed:
   ```
   pip install -r backend/requirements.txt
   ```

### Frontend Setup

1. Make sure you have Node.js installed (v16+)
2. Install dependencies from the project root:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. The frontend should now be accessible at `http://localhost:3000`

## Demo Accounts

For testing purposes, you can use the following demo credentials:

- Email: `demo@example.com`
- Password: `password`
