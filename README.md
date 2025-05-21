# BeezeTrack - Package Delivery Tracking System

BeezeTrack is a complete package delivery tracking system with a Next.js frontend and Python Flask backend.

## Features

- User authentication and account management
- Package scheduling and tracking
- Real-time delivery status updates
- Dashboard with delivery statistics
- Responsive design for all devices

## Project Structure

- `/app` - Next.js frontend pages and components
- `/components` - Reusable UI components 
- `/contexts` - React context providers
- `/hooks` - Custom React hooks
- `/backend` - Python Flask API backend
  - `/app` - Flask application setup
  - `/controllers` - API endpoint logic
  - `/models` - Data models and database access
  - `/routes` - API route definitions

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
3. Ensure your PYTHONPATH includes the project root:
   - Windows: `set PYTHONPATH=.`
   - macOS/Linux: `export PYTHONPATH=.`

### Frontend Setup

1. Make sure you have Node.js installed (v16+)
2. Install dependencies from the project root:
   ```
   npm install
   ```
   or if you're using pnpm:
   ```
   pnpm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
   or with pnpm:
   ```
   pnpm dev
   ```
4. The frontend should now be accessible at `http://localhost:3000`

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login an existing user
- GET `/api/auth/me` - Get current user info
- PUT `/api/auth/profile` - Update user profile
- PUT `/api/auth/password` - Update user password

### Deliveries

- POST `/api/deliveries` - Create a new delivery
- GET `/api/deliveries` - Get all deliveries for the current user
- POST `/api/deliveries/track` - Track a delivery by tracking number
- GET `/api/deliveries/statistics` - Get delivery statistics
- GET `/api/deliveries/:id` - Get a specific delivery
- PUT `/api/deliveries/:id/status` - Update a delivery's status

## Demo Accounts

For testing purposes, you can use the following demo credentials:

- Email: `demo@example.com`
- Password: `password`

## Development Notes

When the backend is running, the system will use the SQLite database. When using the demo account, the frontend will fall back to using localStorage for data persistence.

## License

This project is licensed under the MIT License. 