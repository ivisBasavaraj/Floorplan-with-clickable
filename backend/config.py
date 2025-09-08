import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/imtma_flooring')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-super-secret-jwt-key-change-this-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = False  # For development, set to actual time in production
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
    
    # Flask settings
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', JWT_SECRET_KEY)
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ('true', '1', 'yes')