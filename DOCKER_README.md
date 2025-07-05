# Cricket Team Selection App - Docker Deployment

This document provides comprehensive instructions for deploying the Cricket Team Selection app using Docker and Docker Compose.

## 🏗️ Architecture

The application consists of three main services:

- **Frontend**: React app served by Nginx (Port 80)
- **Backend**: Node.js/Express API with Socket.IO (Port 3001)
- **Redis**: In-memory database for session storage (Port 6379)

## 📋 Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 2GB of available RAM
- Ports 80, 3001, and 6379 available on your system

## 🚀 Quick Start (Production)

1. **Clone and navigate to the project directory**
   ```bash
   cd "Cricket Team Selection app"
   ```

2. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 🛠️ Development Setup

For development with hot reload:

1. **Start development services**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Run frontend separately** (recommended for faster development)
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 📝 Available Commands

### Production Commands
```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

### Development Commands
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Individual Service Commands
```bash
# Build only backend
docker-compose build backend

# Build only frontend
docker-compose build frontend

# Restart specific service
docker-compose restart backend
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=3001
REDIS_URL=redis://redis:6379
FRONTEND_URL=http://localhost:80
NODE_ENV=production
```

**Frontend (build-time)**
```env
VITE_BACKEND_URL=http://localhost:3001
```

### Port Configuration

| Service  | Internal Port | External Port | Description |
|----------|---------------|---------------|-------------|
| Frontend | 80            | 80            | React app via Nginx |
| Backend  | 3001          | 3001          | API and Socket.IO |
| Redis    | 6379          | 6379          | Database |

## 🏥 Health Checks

All services include health checks:

- **Frontend**: `GET /health` (returns "healthy")
- **Backend**: `GET /health` (returns JSON status)
- **Redis**: `redis-cli ping` (returns "PONG")

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :80
   netstat -ano | findstr :3001
   
   # Kill the process (Windows)
   taskkill /PID <PID> /F
   ```

2. **Services not connecting**
   ```bash
   # Check service status
   docker-compose ps
   
   # Check logs
   docker-compose logs backend
   docker-compose logs frontend
   ```

3. **Redis connection issues**
   ```bash
   # Check Redis status
   docker-compose exec redis redis-cli ping
   
   # Restart Redis
   docker-compose restart redis
   ```

4. **Frontend not loading**
   ```bash
   # Check if frontend container is running
   docker-compose ps frontend
   
   # Check nginx logs
   docker-compose logs frontend
   ```

### Reset Everything
```bash
# Stop all containers and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose up --build --force-recreate
```

## 📊 Monitoring

### View Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f redis
```

### Container Stats
```bash
# View resource usage
docker stats

# View specific container
docker stats cricket-backend
```

## 🔒 Security Features

- Non-root users in all containers
- Security headers in Nginx
- Environment variable isolation
- Network isolation between services
- Health checks for service monitoring

## 📈 Performance Optimization

- Multi-stage builds for smaller images
- Nginx gzip compression
- Static asset caching
- Production-optimized React build
- Alpine Linux base images for smaller footprint

## 🚀 Production Deployment

For production deployment:

1. Update environment variables in `docker-compose.yml`
2. Configure proper domain names
3. Set up SSL/TLS certificates
4. Configure reverse proxy if needed
5. Set up monitoring and logging
6. Configure backup for Redis data

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Test individual components: `curl http://localhost:3001/health`
4. Reset if needed: `docker-compose down -v && docker-compose up --build`
