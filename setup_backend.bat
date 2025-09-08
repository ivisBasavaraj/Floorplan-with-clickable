@echo off
echo ========================================
echo   IMTMA Flooring Backend Setup
echo ========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8+ first.
    echo 📥 Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python found
echo.

:: Navigate to backend directory
cd /d "%~dp0backend"

:: Create virtual environment (optional but recommended)
echo 🔧 Setting up Python virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

:: Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

:: Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating environment configuration...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit .env file with your MongoDB connection details
    echo.
)

echo.
echo ========================================
echo   Setup Complete! 🎉
echo ========================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Edit backend\.env with your configuration
echo 3. Run: python run.py
echo.
echo Dashboard will be available at: http://localhost:5000/dashboard
echo API will be available at: http://localhost:5000/api
echo.
pause