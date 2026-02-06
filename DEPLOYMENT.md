# Events Hub - Deployment Guide

## 🐳 Docker Deployment

This application can be deployed using Docker and Docker Compose.

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd events-hub
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001/api

### Services

| Service   | Port | Description              |
|-----------|------|--------------------------|
| Frontend  | 3000 | React application (nginx)|
| Backend   | 8001 | FastAPI REST API         |
| MongoDB   | 27017| Database                 |

### Environment Variables

#### Backend
| Variable      | Default                    | Description          |
|--------------|----------------------------|----------------------|
| MONGO_URL    | mongodb://mongodb:27017    | MongoDB connection   |
| DB_NAME      | events_db                  | Database name        |
| CORS_ORIGINS | *                          | Allowed CORS origins |

#### Frontend
| Variable               | Description       |
|-----------------------|-------------------|
| REACT_APP_BACKEND_URL | Backend API URL   |

### Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Remove volumes (CAUTION: deletes database)
docker-compose down -v
```

### Production Deployment

For production, update the following:

1. **docker-compose.yml**: Set proper `REACT_APP_BACKEND_URL` to your domain
2. **nginx.conf**: Update `proxy_pass` if using different backend URL
3. **Security**: Add MongoDB authentication and proper CORS configuration

### Building Individual Images

```bash
# Backend
cd backend
docker build -t events-backend .

# Frontend
cd frontend
docker build -t events-frontend --build-arg REACT_APP_BACKEND_URL=https://api.yourdomain.com .
```

## 🔧 Development Setup

### Without Docker

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend:**
```bash
cd frontend
yarn install
yarn start
```

### API Documentation

Once running, access the API docs at:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc
