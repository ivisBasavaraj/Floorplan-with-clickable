# IMTMA Flooring Backend

A Flask-based backend API for managing floor plans and booth information with MongoDB storage and JWT authentication.

## Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 🗄️ **MongoDB Integration** - NoSQL database for storing floor plans and user data
- 📊 **Dashboard Interface** - Web-based dashboard for viewing and managing data
- 🏢 **Booth Management** - Complete booth lifecycle management
- 📈 **Analytics** - Real-time statistics and reporting
- 🔄 **RESTful API** - Clean API endpoints for frontend integration

## Tech Stack

- **Backend**: Flask (Python)
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: Bootstrap 5 + Chart.js (for dashboard)
- **Security**: bcrypt for password hashing

## Quick Start

### Prerequisites

1. **Python 3.8+** installed
2. **MongoDB** running locally or connection string to remote MongoDB
3. **Git** for cloning

### Installation

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Configure MongoDB:**
   - Make sure MongoDB is running locally on `mongodb://localhost:27017`
   - Or update `MONGODB_URI` in `.env` with your connection string

4. **Start the server:**
   ```bash
   python run.py
   ```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |
| GET | `/api/auth/verify` | Verify JWT token |

### Floor Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/floorplans` | Get all floor plans |
| POST | `/api/floorplans` | Create new floor plan |
| GET | `/api/floorplans/{id}` | Get specific floor plan |
| PUT | `/api/floorplans/{id}` | Update floor plan |
| DELETE | `/api/floorplans/{id}` | Delete floor plan |
| GET | `/api/floorplans/{id}/booths` | Get booth details |

### Dashboard Routes

| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard overview |
| `/dashboard/floorplans` | Floor plans management |
| `/dashboard/floorplans/{id}` | Floor plan details |
| `/dashboard/booths` | Booths overview |
| `/dashboard/analytics` | Analytics and reports |

## API Usage Examples

### Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "secure_password",
    "role": "admin"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "secure_password"
  }'
```

### Create Floor Plan

```bash
curl -X POST http://localhost:5000/api/floorplans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Main Exhibition Hall",
    "description": "Primary exhibition space",
    "event_id": "event_2024_001",
    "floor": 1,
    "state": {
      "elements": [
        {
          "id": "booth_001",
          "type": "booth",
          "x": 100,
          "y": 100,
          "width": 100,
          "height": 100,
          "number": "A1",
          "status": "available",
          "price": 500,
          "dimensions": {
            "imperial": "10x10 ft",
            "metric": "3x3 m"
          }
        }
      ],
      "canvasSize": {"width": 1200, "height": 800}
    }
  }'
```

### Get Floor Plans

```bash
curl -X GET http://localhost:5000/api/floorplans \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Data Models

### Floor Plan Structure

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "created": "datetime",
  "last_modified": "datetime",
  "state": {
    "elements": [
      {
        "id": "string",
        "type": "booth|text|shape|image|door|furniture|plant",
        "x": "number",
        "y": "number",
        "width": "number", 
        "height": "number",
        "rotation": "number",
        "fill": "string",
        "stroke": "string",
        "strokeWidth": "number",
        "draggable": "boolean",
        "selected": "boolean",
        "layer": "number",
        "customProperties": "object",
        // Booth-specific properties
        "number": "string",
        "status": "available|reserved|sold|on-hold",
        "price": "number",
        "dimensions": {
          "imperial": "string",
          "metric": "string"
        },
        "exhibitor": {
          "companyName": "string",
          "logo": "string",
          "description": "string",
          "category": "string",
          "contact": {
            "phone": "string",
            "email": "string",
            "website": "string"
          }
        }
      }
    ],
    "canvasSize": {"width": "number", "height": "number"},
    "zoom": "number",
    "offset": {"x": "number", "y": "number"},
    "grid": {
      "enabled": "boolean",
      "size": "number",
      "snap": "boolean",
      "opacity": "number"
    }
  },
  "version": "number",
  "event_id": "string",
  "floor": "number",
  "layer": "number",
  "user_id": "string"
}
```

## Configuration

### Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET_KEY`: Secret key for JWT token signing
- `FLASK_ENV`: Development/production environment
- `FLASK_DEBUG`: Enable/disable debug mode
- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)
- `DETECTION_BACKEND`: Toggle detection backend. Allowed values: `yolo` (default) or `opencv`.
- `YOLO_MODEL_PATH`: Optional Ultralytics model path (e.g., `yolov8n.pt`, `yolov8s.pt`, or a custom `.pt`).

### Selecting Detection Backend

You can switch the detection backend without code changes:

1. Set in `.env`:
   ```ini
   DETECTION_BACKEND=yolo   # or opencv
   ```
2. Or override per-request:
   - Query parameter: `POST /detect-from-upload?backend=yolo` or `?backend=opencv`
   - JSON body field: `{ "filename": "...", "backend": "opencv" }`

The endpoint response includes the `backend` field indicating which backend was used.

### Ultralytics/Torch Installation Matrix (GPU/CPU)

- CPU-only (simplest, slower):
  ```bash
  pip install torch==2.3.1 torchvision==0.18.1
  pip install ultralytics==8.2.103
  ```
- NVIDIA GPU (CUDA): install versions matching your CUDA toolkit (see https://pytorch.org/get-started/locally/). Examples:
  - CUDA 12.1:
    ```bash
    pip install --index-url https://download.pytorch.org/whl/cu121 torch==2.3.1 torchvision==0.18.1
    pip install ultralytics==8.2.103
    ```
  - CUDA 11.8:
    ```bash
    pip install --index-url https://download.pytorch.org/whl/cu118 torch==2.3.1 torchvision==0.18.1
    pip install ultralytics==8.2.103
    ```

Notes:
- Verify GPU is visible: `python -c "import torch; print(torch.cuda.is_available())"`
- First model run will download weights if `YOLO_MODEL_PATH` isn’t present.
- For best speed, prefer `yolov8s.pt` or larger on GPU; use `yolov8n.pt` on CPU.

### Database Collections

- `users`: User accounts and authentication
- `floorplans`: Floor plan data and booth information

## Security Features

- 🔑 JWT token authentication
- 🔒 Password hashing with bcrypt
- 👤 Role-based access control (admin/user)
- 🛡️ CORS protection
- 🔍 Input validation and sanitization

## Dashboard Features

- 📊 **Overview Dashboard**: Key metrics and statistics
- 🗺️ **Floor Plans Management**: View and manage all floor plans
- 🏪 **Booth Overview**: Comprehensive booth management
- 📈 **Analytics**: Detailed reports and visualizations
- 🔍 **Search & Filtering**: Advanced search capabilities
- 📱 **Responsive Design**: Mobile-friendly interface

## Development

### Project Structure
```
backend/
├── app.py              # Main Flask application
├── config.py           # Configuration settings
├── models.py           # Data models
├── auth.py             # Authentication utilities
├── routes/             # API route definitions
│   ├── auth_routes.py
│   ├── floorplan_routes.py
│   └── dashboard_routes.py
├── templates/          # HTML templates for dashboard
│   └── dashboard/
├── requirements.txt    # Python dependencies
├── .env.example       # Environment variables template
└── README.md          # This file
```

### Adding New Features

1. **API Endpoints**: Add new routes in `routes/` directory
2. **Data Models**: Extend models in `models.py`
3. **Dashboard Pages**: Add templates in `templates/dashboard/`
4. **Authentication**: Modify `auth.py` for access control

## Health Check

The API provides a health check endpoint:

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00",
  "database": "connected",
  "version": "1.0.0"
}
```

## Integration with Frontend

This backend is designed to work with the React frontend in the main project. To integrate:

1. **Update frontend API calls** to point to `http://localhost:5000/api`
2. **Add JWT token handling** in your React app
3. **Use the authentication endpoints** for login/register
4. **Implement floor plan sync** between canvas state and backend

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **JWT Token Issues**
   - Check if `JWT_SECRET_KEY` is set
   - Verify token is included in request headers
   - Ensure token hasn't expired

3. **CORS Errors**
   - Update `CORS_ORIGINS` in `.env`
   - Include your frontend URL

### Logs

The application provides detailed logging for debugging:
- Authentication events
- Database operations
- API request/response cycles
- Error stack traces

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.