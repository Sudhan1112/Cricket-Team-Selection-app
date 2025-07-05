# Cricket Team Selection App

A comprehensive real-time multiplayer cricket team selection system built with modern web technologies. This application enables multiple users to join rooms and take turns selecting cricket players in a real-time environment with turn-based gameplay, auto-selection, and comprehensive room management.

🌐 **Live Demo**: [cricket-team-selection-app.vercel.app](https://cricket-team-selection-app.vercel.app)

## 🚀 Overview

This full-stack application consists of a React frontend deployed on Vercel and a Node.js backend with Socket.IO for real-time communication. Users can create or join rooms, participate in turn-based cricket player selection with 10-second timers, and experience seamless real-time updates across all connected clients.

### Key Features

- **Real-time Multiplayer**: WebSocket-based communication using Socket.IO
- **Turn-based Selection**: 10-second turn timer with auto-selection fallback
- **Room Management**: Create, join, and manage rooms with host privileges
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Cloud Deployment**: Frontend on Vercel, backend ready for containerization
- **Comprehensive Testing**: Bruno API testing suite and Socket.IO test scripts
- **Modern Architecture**: Clean separation of concerns with modular design

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19.1.0 with functional components
- **Build Tool**: Vite 7.0.0 with lightning-fast HMR
- **Styling**: TailwindCSS 4.1.11 for responsive design
- **Real-time**: Socket.IO Client 4.8.1
- **State Management**: Context API with useReducer
- **Icons**: Lucide React 0.525.0
- **Deployment**: Vercel (Production)

### Backend
- **Runtime**: Node.js 18+ with Express.js 4.x
- **Real-time**: Socket.IO 4.8+ for WebSocket communication
- **Database**: Redis 7+ for session storage and caching
- **Validation**: Joi schema validation
- **Containerization**: Docker & Docker Compose ready
- **Testing**: Bruno API Client with comprehensive test suite

## 📋 Prerequisites

- **Development**: Node.js 18+, Redis 7+, npm/yarn
- **Docker**: Docker 20.10+, Docker Compose 2.0+ (optional)
- **Browser**: Modern browser with WebSocket support

## 🚀 Quick Start

### Option 1: Full Local Development

```bash
# Clone repository
git clone <repository-url>
cd cricket-team-selection-app

# Backend setup
cd server
npm install
redis-server  # Start Redis in separate terminal
cp .env.example .env
npm run dev

# Frontend setup (new terminal)
cd ../client
npm install
npm run dev

# Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

### Option 2: Docker Deployment

```bash
# Clone and navigate
git clone <repository-url>
cd cricket-team-selection-app

# Deploy with Docker Compose
docker-compose up --build -d

# Access application
# Frontend: http://localhost:80
# Backend API: http://localhost:3001
# Redis: localhost:6379
```

### Option 3: Production Access

Visit the live application: [cricket-team-selection-app.vercel.app](https://cricket-team-selection-app.vercel.app)

## 🏗 Project Structure

```
cricket-team-selection-app/
├── client/                       # React Frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── HomeScreen.jsx    # Landing page
│   │   │   ├── RoomScreen.jsx    # Game interface
│   │   │   └── Toast.jsx         # Notifications
│   │   ├── context/              # React Context
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # API services
│   │   ├── store/                # State management
│   │   └── constants/            # App constants
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── server/                       # Node.js Backend
│   ├── config/                   # Configuration
│   ├── controllers/              # Route handlers
│   ├── models/                   # Data models
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic
│   ├── middleware/               # Express middleware
│   ├── constants/                # Server constants
│   ├── tests/                    # Test suites
│   ├── server.js                 # Main entry point
│   ├── package.json
│   └── README.md
├── Cricket_selection_app_bruno_API_testing/  # API Tests
├── docker-compose.yml            # Production deployment
├── docker-compose.dev.yml        # Development deployment
├── deploy.sh                     # Deployment script (Linux/Mac)
├── deploy.bat                    # Deployment script (Windows)
└── README.md                     # This file
```

## 🎮 How It Works

### 1. Room Creation & Joining
- Host creates a room and receives a unique room ID
- Other users join using the room ID
- Real-time updates show all connected users
- Host has privileges to start the selection process

### 2. Player Selection Process
- Host initiates the selection phase
- Users take turns selecting cricket players
- Each turn has a 10-second timer
- Auto-selection occurs if timer expires
- Real-time updates for all participants

### 3. Game Completion
- Selection ends when all users have selected their teams
- Results are displayed showing each user's selected players
- Room remains active for continued interaction

## 🔧 Configuration

### Environment Variables

**Frontend (client/.env)**:
```env
VITE_BACKEND_URL=http://localhost:3001  # Backend API URL
NODE_ENV=development                     # Environment mode
```

**Backend (server/.env)**:
```env
PORT=3001                               # Server port
REDIS_URL=redis://localhost:6379        # Redis connection
FRONTEND_URL=http://localhost:5173      # CORS origin
NODE_ENV=development                    # Environment mode
```

### Application Settings

| Setting | Value | Description |
|---------|-------|-------------|
| **Turn Timer** | 10 seconds | Selection time limit per turn |
| **Players per User** | 5 | Cricket players each user selects |
| **Max Users** | 10 | Maximum users per room |
| **Room TTL** | 1 hour | Room expiration time |
| **Toast Duration** | 5 seconds | Notification display time |

## 📡 API Endpoints

### Core Room Management

**Create Room**:
```http
POST /api/rooms/create
Content-Type: application/json

{
  "hostId": "user_12345",
  "hostName": "John Doe"
}
```

**Join Room**:
```http
POST /api/rooms/join
Content-Type: application/json

{
  "roomId": "room_abc123",
  "userId": "user_67890",
  "userName": "Jane Smith"
}
```

**Get Room Info**:
```http
GET /api/rooms/{roomId}
```

**Get Available Players**:
```http
GET /api/rooms/players/available
```

**Health Check**:
```http
GET /health
```

## 🔌 Socket.IO Events

### Client → Server Events
| Event | Description | Payload |
|-------|-------------|---------|
| `join-room` | Join a room | `{ roomId, userId, userName }` |
| `start-selection` | Begin selection process | `{}` |
| `select-player` | Select a cricket player | `{ playerId }` |
| `leave-room` | Leave current room | `{}` |

### Server → Client Events
| Event | Description | Payload |
|-------|-------------|---------|
| `room-joined` | Successfully joined room | `{ room, userId }` |
| `user-joined` | Another user joined | `{ user, room }` |
| `user-left` | User left room | `{ userId, userName, room }` |
| `selection-started` | Selection process began | `{ room, turnOrder }` |
| `turn-started` | Turn timer started | `{ userId, userName, timeLimit, room }` |
| `player-selected` | Player successfully selected | `{ userId, userName, player, room }` |
| `auto-selected` | Auto-selection occurred | `{ userId, userName, player, room }` |
| `selection-ended` | Selection process completed | `{ results, room }` |
| `room-updated` | Room state changed | `{ room }` |
| `error` | Error occurred | `{ message, code }` |

## 🧪 Testing

### Bruno API Testing Suite

The project includes comprehensive API tests in `Cricket_selection_app_bruno_API_testing/`:

- ✅ Health Check
- ✅ Room Creation
- ✅ Room Joining
- ✅ Player Management
- ✅ Room Information
- ✅ Leave Room
- ✅ Room Deletion

**Running Bruno Tests**:
1. Install Bruno from [Bruno Website](https://www.usebruno.com/)
2. Open Collection: `Cricket_selection_app_bruno_API_testing/`
3. Configure base URL: `http://localhost:3001`
4. Run individual tests or entire collection

### Development Testing

```bash
# Backend tests
cd server
npm test                    # Run all tests
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:socket        # Socket.IO tests

# Frontend tests
cd client
npm run lint               # ESLint checks
npm run build              # Build verification

# Custom test scripts
node test-two-users.js     # Multi-user scenarios
node comprehensive-test.js # Full system test
```

## 🐳 Docker Deployment

### Production Deployment

**Full Stack with Docker Compose**:
```bash
# Deploy all services
docker-compose up --build -d

# Services included:
# - Frontend: http://localhost:80
# - Backend: http://localhost:3001
# - Redis: localhost:6379

# Check deployment status
docker-compose ps
docker-compose logs -f
```

**Individual Service Deployment**:
```bash
# Backend only
cd server
docker build -t cricket-backend .
docker run -p 3001:3001 cricket-backend

# Frontend only
cd client
docker build -t cricket-frontend .
docker run -p 80:80 cricket-frontend
```

### Development with Docker

```bash
# Development environment
docker-compose -f docker-compose.dev.yml up --build

# Features:
# - Hot reload for both frontend and backend
# - Development dependencies included
# - Debug mode enabled
```

### Docker Configuration

**Services Architecture**:
- **Frontend**: Nginx-served React app (Port 80)
- **Backend**: Node.js Express server (Port 3001)
- **Redis**: Data persistence and caching (Port 6379)
- **Networks**: Isolated container communication
- **Volumes**: Persistent Redis data storage

## 🚀 Deployment Options

### 1. Vercel (Current Frontend)

The frontend is deployed on Vercel: [cricket-team-selection-app.vercel.app](https://cricket-team-selection-app.vercel.app)

**Vercel Configuration**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "environmentVariables": {
    "VITE_BACKEND_URL": "auto-detected"
  }
}
```

### 2. Railway (Backend Recommended)

```bash
# Deploy backend to Railway
cd server
railway login
railway link
railway up

# Configure environment variables in Railway dashboard
```

### 3. Render (Full Stack)

```bash
# Backend deployment
# Connect GitHub repository
# Set build command: npm install
# Set start command: npm start
# Configure environment variables

# Frontend deployment
# Connect GitHub repository
# Set build command: npm run build
# Set publish directory: dist
```

### 4. AWS/GCP/Azure

**Container Registry Deployment**:
```bash
# Build and push images
docker build -t cricket-backend ./server
docker build -t cricket-frontend ./client

# Push to registry (ECR/GCR/ACR)
docker tag cricket-backend:latest <registry>/cricket-backend:latest
docker push <registry>/cricket-backend:latest

# Deploy to container service (ECS/Cloud Run/Container Instances)
```

## 🔒 Security Features

### Frontend Security
- ✅ **Input Validation**: Client-side validation for all inputs
- ✅ **XSS Protection**: React's built-in XSS protection
- ✅ **HTTPS**: Secure communication in production (Vercel)
- ✅ **Environment Variables**: Secure configuration management
- ✅ **Content Security Policy**: Configured for production

### Backend Security
- ✅ **Input Validation**: Joi schema validation for all inputs
- ✅ **CORS Protection**: Configurable origin restrictions
- ✅ **Error Handling**: Secure error messages without sensitive data
- ✅ **Environment Isolation**: Separate configs per environment
- ✅ **Non-root Containers**: Docker security best practices

### Infrastructure Security
- ✅ **Network Isolation**: Container-to-container communication
- ✅ **Health Checks**: Automatic service monitoring
- ✅ **Minimal Base Images**: Alpine Linux for reduced attack surface
- ✅ **Secret Management**: Environment-based configuration

## 🚀 Performance Optimization

### Frontend Optimization
- **Code Splitting**: Automatic chunk splitting for optimal loading
- **Tree Shaking**: Dead code elimination via Vite
- **Asset Optimization**: Image and font optimization
- **Caching Strategy**: Aggressive caching for static assets
- **Bundle Analysis**: Vite bundle analyzer for size monitoring

### Backend Optimization
- **Redis Caching**: Efficient room data persistence
- **Connection Pooling**: Optimized database connections
- **Event Batching**: Reduced Socket.IO message frequency
- **Room-based Broadcasting**: Targeted message delivery
- **Health Monitoring**: Proactive performance monitoring

### Infrastructure Optimization
- **Multi-stage Builds**: Reduced Docker image sizes
- **Container Health Checks**: Automatic service recovery
- **Resource Limits**: Configured memory and CPU limits
- **Load Balancing**: Ready for horizontal scaling

## 🐛 Troubleshooting

### Common Issues

**Socket.IO Connection Problems**:
```bash
# Check backend connectivity
curl http://localhost:3001/health

# Debug socket connection (browser console)
localStorage.debug = 'socket.io-client:*';

# Verify CORS configuration
# Check FRONTEND_URL in backend environment
```

**Redis Connection Issues**:
```bash
# Check Redis status
redis-cli ping
# Expected: PONG

# Docker Redis check
docker-compose exec redis redis-cli ping

# Connection string format
# Ensure REDIS_URL: redis://host:port
```

**Build Issues**:
```bash
# Frontend build issues
cd client
rm -rf node_modules package-lock.json
npm install
npm run build

# Backend build issues
cd server
rm -rf node_modules package-lock.json
npm install
npm test
```

**Docker Issues**:
```bash
# Port conflicts
netstat -ano | findstr :3001
# Kill conflicting processes

# Container logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down -v
docker-compose up --build
```
### Debug Mode

**Frontend Debug**:
```bash
# Enable Vite debug mode
DEBUG=vite:* npm run dev

# Socket.IO client debug (browser console)
localStorage.debug = 'socket.io-client:*';
```

**Backend Debug**:
```bash
# Enable comprehensive debugging
DEBUG=* npm run dev

# Socket.IO specific debugging
DEBUG=socket.io:* npm run dev

# Application debugging
DEBUG=app:* npm run dev
```

## 📊 Monitoring & Analytics

### Health Monitoring

**Backend Health Check**:
```http
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "redis": "connected",
    "socket": "active"
  }
}
```

**Container Monitoring**:
```bash
# Resource usage
docker stats cricket-backend cricket-frontend

# Service status
docker-compose ps

# Real-time logs
docker-compose logs -f --tail=100
```

### Performance Metrics

**Frontend Metrics**:
- Bundle size monitoring via Vite analyzer
- Lighthouse performance scores
- Core Web Vitals tracking
- Real-time user analytics (ready for integration)

**Backend Metrics**:
- API response times
- Socket.IO connection counts
- Redis performance metrics
- Memory and CPU usage

## 🤝 Contributing

### Development Setup

1. **Fork Repository**: Create your fork on GitHub
2. **Clone Locally**: `git clone <your-fork-url>`
3. **Install Dependencies**:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
4. **Start Services**:
   ```bash
   # Terminal 1: Redis
   redis-server

   # Terminal 2: Backend
   cd server && npm run dev

   # Terminal 3: Frontend
   cd client && npm run dev
   ```
5. **Make Changes**: Implement your feature/fix
6. **Test Changes**: Run test suites and verify functionality
7. **Commit Changes**: `git commit -m 'Add amazing feature'`
8. **Push Changes**: `git push origin feature/amazing-feature`
9. **Create PR**: Submit pull request for review

### Code Standards

**Frontend Standards**:
- Use functional components with hooks
- Follow ESLint configuration
- Use TailwindCSS utility classes
- Implement proper error boundaries

**Backend Standards**:
- Follow Express.js best practices
- Use Joi for input validation
- Implement proper error handling
- Write comprehensive tests

**General Standards**:
- Write clear commit messages
- Update documentation for new features
- Maintain test coverage above 80%
- Test Docker deployment before submitting

## 📞 Support

### Getting Help

- 📖 **Documentation**: Check README files in `/client` and `/server`
- 🐛 **Issues**: Create GitHub issue with reproduction steps
- 💬 **Discussions**: Use GitHub Discussions for questions
- 🔧 **Development**: Check browser DevTools and server logs

### Useful Commands

```bash
# Quick health check
curl http://localhost:3001/health

# Reset development environment
rm -rf client/node_modules server/node_modules
cd client && npm install
cd ../server && npm install

# Full system restart
docker-compose down -v
docker-compose up --build -d

# Check all services
docker-compose ps
curl http://localhost:3001/health
curl http://localhost/health
```

### Browser Compatibility

| Browser | Version | Frontend | Backend API |
|---------|---------|----------|-------------|
| Chrome | 90+ | ✅ Full | ✅ Full |
| Firefox | 88+ | ✅ Full | ✅ Full |
| Safari | 14+ | ✅ Full | ✅ Full |
| Edge | 90+ | ✅ Full | ✅ Full |
| Mobile Safari | 14+ | ✅ Full | ✅ Full |
| Chrome Mobile | 90+ | ✅ Full | ✅ Full |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Socket.IO Team**: Excellent real-time communication framework
- **Redis Team**: Robust caching and persistence solution
- **Vercel Team**: Seamless frontend deployment platform
- **React Team**: Powerful UI library with excellent developer experience
- **Vite Team**: Lightning-fast build tool and development server
- **TailwindCSS Team**: Utility-first CSS framework
- **Docker Team**: Containerization platform for consistent deployments

---

*This application demonstrates modern full-stack development with real-time features, cloud deployment, and production-ready architecture. Perfect for learning WebSocket communication, React state management, and containerized deployments.*