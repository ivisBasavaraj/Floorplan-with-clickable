#!/usr/bin/env python3
"""
IMTMA Flooring Backend Server
Main entry point for the Flask application
"""

import os
import sys
from app import create_app

if __name__ == '__main__':
    # Add the backend directory to the Python path
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, backend_dir)
    
    # Create and run the Flask app
    app = create_app()
    if app:
        print("🚀 Starting IMTMA Flooring Backend Server...")
        print(f"📊 Dashboard: http://localhost:5000/dashboard")
        print(f"🔗 API: http://localhost:5000/api")
        print(f"💚 Health Check: http://localhost:5000/health")
        print("📝 Press Ctrl+C to stop the server")
        
        try:
            app.run(
                debug=True,
                host='0.0.0.0',
                port=5000,
                use_reloader=True
            )
        except KeyboardInterrupt:
            print("\n👋 Server stopped by user")
    else:
        print("❌ Failed to start application")
        print("🔍 Please check your MongoDB connection and configuration")
        sys.exit(1)