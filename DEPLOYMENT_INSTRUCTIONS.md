# 🏏 Cricket Team Selection App - Docker Deployment Instructions

## ✅ Docker Setup Complete!

I've successfully created a complete Docker deployment setup for your Cricket Team Selection app. Here's what has been configured:

### 📁 Files Created/Updated:

1. **Frontend Docker Files:**
   - `client/Dockerfile` - Multi-stage build with Nginx
   - `client/nginx.conf` - Optimized Nginx configuration
   - `client/.dockerignore` - Exclude unnecessary files

2. **Backend Docker Files:**
   - `server/dockerfile` - Updated with security and health checks
   - `server/Dockerfile.dev` - Development version with hot reload
   - `server/.dockerignore` - Exclude unnecessary files
   - `server/.env.production` - Production environment variables

3. **Docker Compose Files:**
   - `docker-compose.yml` - Production deployment
   - `docker-compose.dev.yml` - Development environment

4. **Deployment Scripts:**
   - `deploy.sh` - Linux/Mac deployment script
   - `deploy.bat` - Windows deployment script
   - `DOCKER_README.md` - Comprehensive documentation

5. **Configuration Updates:**
   - Updated `client/src/constants/index.js` for Docker environment support

## 🚀 Quick Start

### Prerequisites
1. **Install Docker Desktop** from https://www.docker.com/products/docker-desktop/
2. **Start Docker Desktop** and wait for it to be ready
3. **Verify Docker is running**: Open terminal and run `docker --version`

### Option 1: Using Deployment Script (Recommended)

**Windows:**
```cmd
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

## 🌐 Access Your Application

Once deployed:
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     Redis       │
│   (React+Nginx) │◄──►│  (Node.js+API)  │◄──►│   (Database)    │
│   Port: 80      │    │   Port: 3001    │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Development Mode

For development with hot reload:

```bash
# Start only backend with Redis
docker-compose -f docker-compose.dev.yml up

# In another terminal, run frontend locally
cd client
npm install
npm run dev
```

## 📋 Available Commands

### Production Commands:
```bash
docker-compose up --build          # Build and start
docker-compose up -d               # Start in background
docker-compose down                # Stop services
docker-compose down -v             # Stop and remove data
docker-compose logs -f             # View logs
docker-compose ps                  # Check status
```

### Using Scripts:
```bash
# Windows
deploy.bat deploy    # Start production
deploy.bat dev       # Start development
deploy.bat stop      # Stop services
deploy.bat clean     # Clean everything
deploy.bat logs      # View logs
deploy.bat status    # Check status

# Linux/Mac
./deploy.sh deploy   # Start production
./deploy.sh dev      # Start development
./deploy.sh stop     # Stop services
./deploy.sh clean    # Clean everything
./deploy.sh logs     # View logs
./deploy.sh status   # Check status
```

## 🔧 Configuration

### Environment Variables

The app automatically detects the environment:

- **Development**: Uses `http://localhost:3001` for backend
- **Docker**: Uses container networking
- **Production**: Uses environment-specific URLs

### Port Mapping

| Service  | Container Port | Host Port | Description |
|----------|----------------|-----------|-------------|
| Frontend | 80             | 80        | React app via Nginx |
| Backend  | 3001           | 3001      | API and Socket.IO |
| Redis    | 6379           | 6379      | Database |

## 🏥 Health Checks

All services include health monitoring:
- **Frontend**: `curl http://localhost/health`
- **Backend**: `curl http://localhost:3001/health`
- **Redis**: Automatic ping checks

## 🐛 Troubleshooting

### Common Issues:

1. **Docker not running**
   ```
   Error: Cannot connect to Docker daemon
   Solution: Start Docker Desktop
   ```

2. **Port conflicts**
   ```bash
   # Check what's using ports
   netstat -ano | findstr ":80\|:3001\|:6379"
   
   # Kill processes if needed (Windows)
   taskkill /PID <PID> /F
   ```

3. **Build failures**
   ```bash
   # Clean rebuild
   docker-compose down -v
   docker-compose build --no-cache
   docker-compose up
   ```

4. **Service not responding**
   ```bash
   # Check logs
   docker-compose logs backend
   docker-compose logs frontend
   
   # Restart specific service
   docker-compose restart backend
   ```

## 🔒 Security Features

- ✅ Non-root users in containers
- ✅ Security headers in Nginx
- ✅ Network isolation
- ✅ Health checks
- ✅ Environment variable isolation

## 📈 Performance Features

- ✅ Multi-stage builds (smaller images)
- ✅ Nginx gzip compression
- ✅ Static asset caching
- ✅ Production React build
- ✅ Alpine Linux (lightweight)

## 🎯 Next Steps

1. **Start Docker Desktop** if not already running
2. **Run the deployment**: `deploy.bat` (Windows) or `./deploy.sh` (Linux/Mac)
3. **Test the application** at http://localhost
4. **Check logs** if needed: `docker-compose logs -f`

## 📞 Support

If you encounter issues:
1. Check Docker is running: `docker --version`
2. View logs: `docker-compose logs -f`
3. Check service status: `docker-compose ps`
4. Reset if needed: `docker-compose down -v && docker-compose up --build`

Your Cricket Team Selection app is now ready for Docker deployment! 🎉
