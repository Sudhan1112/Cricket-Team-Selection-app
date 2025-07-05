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

## � Project Structure

```
cricket-team-selection-app/
├── client/                           # React Frontend
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── HomeScreen.jsx       # Landing page
│   │   │   ├── RoomScreen.jsx       # Game room interface
│   │   │   ├── PlayerCard.jsx       # Player selection cards
│   │   │   └── Toast.jsx            # Notification system
│   │   ├── context/
│   │   │   └── AppContext.jsx       # Global state management
│   │   ├── hooks/
│   │   │   └── useSocket.js         # Socket.IO integration
│   │   ├── services/
│   │   │   └── socketService.js     # Socket service layer
│   │   ├── store/
│   │   │   ├── reducer.js           # State reducer
│   │   │   └── types.js             # Action types
│   │   ├── constants/
│   │   │   └── index.js             # Frontend constants
│   │   ├── utils/
│   │   │   └── helpers.js           # Utility functions
│   │   └── App.jsx                  # Main application
│   ├── public/                      # Static assets
│   ├── Dockerfile                   # Frontend container
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js               # Vite configuration
├── server/                          # Node.js Backend
│   ├── controllers/
│   │   └── socketController.js      # Socket.IO event handlers
│   ├── models/
│   │   ├── Room.js                  # Room data model
│   │   └── User.js                  # User data model
│   ├── services/
│   │   └── roomService.js           # Room business logic
│   ├── constants/
│   │   ├── index.js                 # Backend constants
│   │   └── cricketPlayers.js        # Cricket player data
│   ├── config/
│   │   └── redis.js                 # Redis configuration
│   ├── utils/
│   │   └── validation.js            # Input validation
│   ├── Dockerfile                   # Backend container
│   ├── package.json                 # Backend dependencies
│   └── server.js                    # Server entry point
├── Cricket_selection_app_bruno_API_testing/  # API Tests
├── docker-compose.yml               # Production deployment
├── docker-compose.dev.yml           # Development deployment
├── deploy.sh / deploy.bat           # Deployment scripts
└── README.md                        # This file
```

## 🎮 How It Works

1. **Room Creation**: Host creates a room and receives a unique room ID
2. **Player Joining**: Other players join using the room ID
3. **Game Start**: Host starts the selection when 2+ players are ready
4. **Turn-based Selection**: Players take turns selecting cricket players (10s timer)
5. **Auto-selection**: System auto-selects if timer expires
6. **Game Completion**: Game ends when all players have selected 5 players each

## �🔧 Configuration

### Frontend Environment Variables

Create `client/.env` file:
```bash
# Backend API URL
VITE_BACKEND_URL=http://localhost:3001

# Development settings
VITE_NODE_ENV=development
```

### Backend Environment Variables

Create `server/.env` file:
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://localhost:6379

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Application Settings
TURN_TIME_LIMIT=10
PLAYERS_PER_USER=5
MAX_USERS_PER_ROOM=10
ROOM_TTL=3600
```

### Application Configuration

| Setting | Value | Description |
|---------|--------|-------------|
| Turn Timer | 10 seconds | Selection time limit per turn |
| Players per User | 5 | Cricket players each user selects |
| Max Users | 10 | Maximum users per room |
| Room TTL | 3600s (1 hour) | Room expiration time |
| Auto-select | Enabled | Fallback when timer expires |

## 📡 API Endpoints

### Core Room Management

#### Create New Room
```http
POST /api/rooms/create
Content-Type: application/json

{
  "hostId": "user_12345",
  "hostName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "room": {
    "id": "room_abc123",
    "hostId": "user_12345",
    "hostName": "John Doe",
    "users": [...],
    "status": "waiting",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Get Room Information
```http
GET /api/rooms/room_abc123
```

**Response:**
```json
{
  "success": true,
  "room": {
    "id": "room_abc123",
    "hostId": "user_12345",
    "hostName": "John Doe",
    "users": [
      {
        "id": "user_12345",
        "name": "John Doe",
        "isHost": true,
        "selectedPlayers": [],
        "isConnected": true
      }
    ],
    "status": "waiting",
    "currentTurn": null,
    "turnOrder": [],
    "availablePlayers": [...],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Join Room
```http
POST /api/rooms/join
Content-Type: application/json

{
  "roomId": "room_abc123",
  "userId": "user_67890",
  "userName": "Jane Smith"
}
```

**Response:**
```json
{
  "success": true,
  "room": { /* updated room object */ },
  "user": {
    "id": "user_67890",
    "name": "Jane Smith",
    "isHost": false,
    "selectedPlayers": [],
    "isConnected": true
  }
}
```

#### Get Available Players
```http
GET /api/rooms/players/available
```

**Response:**
```json
{
  "success": true,
  "players": [
    {
      "id": "player_001",
      "name": "Virat Kohli",
      "role": "Batsman",
      "team": "India",
      "rating": 95
    }
  ]
}
```

### Utility Endpoints

- `GET /health` - Health check endpoint
- `GET /api/rooms/:roomId/stats` - Room statistics
- `POST /api/rooms/:roomId/leave` - Leave room
- `DELETE /api/rooms/:roomId` - Delete room (host only)

## 🔌 Socket.IO Events

### Client → Server Events

| Event | Description | Payload Schema |
|-------|-------------|----------------|
| `join-room` | Join or create room | `{ roomId: string, userId: string, userName: string }` |
| `start-selection` | Start player selection | `{}` |
| `select-player` | Select a cricket player | `{ playerId: string }` |

### Server → Client Events

| Event | Description | Payload Schema |
|-------|-------------|----------------|
| `room-joined` | User successfully joined room | `{ room: Room, userId: string }` |
| `user-joined` | Another user joined room | `{ user: User, room: Room }` |
| `user-left` | User left the room | `{ userId: string, userName: string }` |
| `room-updated` | Room state updated | `{ room: Room }` |
| `selection-started` | Selection phase began | `{ room: Room }` |
| `turn-started` | User's turn to select | `{ userId: string, userName: string, timeLimit: number }` |
| `player-selected` | Player was selected | `{ player: Player, userId: string, room: Room }` |
| `auto-selected` | Auto-selection occurred | `{ player: Player, userId: string, room: Room }` |
| `selection-ended` | Selection completed | `{ results: Array, room: Room }` |
| `error` | Error occurred | `{ message: string }` |

### Frontend Socket Integration

**Socket Service Usage**:
```javascript
import { socketService } from './services/socketService.js';

// Connect to server
const socket = socketService.connect();

// Join room
socketService.joinRoom('room123', 'John Doe');

// Listen for events
socketService.on('room-joined', (data) => {
  console.log('Joined room:', data.room);
});

// Start selection
socketService.startSelection();

// Select player
socketService.selectPlayer('player_001');
```

## 🧪 Testing

### Frontend Testing

**Development Testing**:
```bash
cd client
npm run dev
# Open http://localhost:5173
# Test room creation, joining, and player selection
```

**Build Testing**:
```bash
cd client
npm run build
npm run preview
```

### Backend Testing

**Bruno API Testing Suite**:
```bash
# Install Bruno API Client
# Import Cricket_selection_app_bruno_API_testing collection
# Run comprehensive API tests

# Test endpoints:
# - Room creation
# - Room joining
# - Player selection
# - Health checks
```

**Socket.IO Testing**:
```bash
cd server
node tests/socket.test.js
# Tests real-time events and room management
```

**Manual Testing**:
```bash
# Start backend
cd server && npm run dev

# Test health endpoint
curl http://localhost:3001/health

# Test room creation
curl -X POST http://localhost:3001/api/rooms/create \
  -H "Content-Type: application/json" \
  -d '{"hostId":"test123","hostName":"Test User"}'
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

**Current Production**: [cricket-team-selection-app.vercel.app](https://cricket-team-selection-app.vercel.app)

```bash
# Deploy to Vercel
cd client
npm run build
vercel --prod

# Environment variables in Vercel:
# VITE_BACKEND_URL=https://your-backend-url.com
```

### Backend Deployment Options

**Option 1: Railway**
```bash
# Connect GitHub repository to Railway
# Set environment variables:
# PORT=3001
# REDIS_URL=redis://redis:6379
# NODE_ENV=production
```

**Option 2: Render**
```bash
# Connect GitHub repository to Render
# Add Redis add-on
# Configure environment variables
```

**Option 3: Docker Deployment**
```bash
# Production deployment
docker-compose up --build -d

# Development deployment
docker-compose -f docker-compose.dev.yml up --build
```

### Cloud Platform Deployment

**AWS/GCP/Azure**:
- **Frontend**: Static hosting (S3, Cloud Storage, Blob Storage)
- **Backend**: Container service (ECS, Cloud Run, Container Instances)
- **Database**: Managed Redis (ElastiCache, Memorystore, Azure Cache)

## 🔒 Security Features

### Frontend Security
- **Input Validation**: Client-side validation with sanitization
- **Environment Variables**: Secure API URL configuration
- **CORS Protection**: Proper origin validation
- **XSS Prevention**: React's built-in XSS protection
- **Secure Headers**: Content Security Policy ready

### Backend Security
- **Input Validation**: Joi schema validation for all inputs
- **CORS Configuration**: Configurable allowed origins
- **Rate Limiting**: Built-in request rate limiting
- **Error Handling**: Secure error messages without data leakage
- **Non-root Containers**: Docker containers run as non-root user
- **Environment Isolation**: Separate development/production configs

### Redis Security
- **Connection Security**: Secure Redis connection strings
- **Data Expiration**: TTL-based automatic data cleanup
- **Access Control**: Redis AUTH when configured

## ⚡ Performance Optimization

### Frontend Performance
- **Code Splitting**: Vite's automatic code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Optimized images and fonts
- **Bundle Analysis**: Built-in bundle size monitoring
- **Lazy Loading**: Component-level lazy loading ready

### Backend Performance
- **Redis Caching**: Fast in-memory data storage
- **Connection Pooling**: Efficient database connections
- **Event Batching**: Optimized Socket.IO event handling
- **Memory Management**: Efficient room and user data handling
- **Compression**: Response compression enabled

### Real-time Performance
- **WebSocket Optimization**: Efficient Socket.IO configuration
- **Event Debouncing**: Reduced unnecessary event emissions
- **State Synchronization**: Optimized room state updates
- **Connection Management**: Automatic reconnection handling

## 🔧 Troubleshooting

### Common Issues

**Frontend Issues**:
```bash
# Socket connection failed
# Check backend URL in .env
VITE_BACKEND_URL=http://localhost:3001

# Build errors
rm -rf node_modules package-lock.json
npm install

# Vite dev server issues
npm run dev -- --host 0.0.0.0 --port 5173
```

**Backend Issues**:
```bash
# Redis connection failed
redis-server  # Start Redis server
redis-cli ping  # Test Redis connection

# Port already in use
lsof -ti:3001 | xargs kill -9  # Kill process on port 3001

# Socket.IO connection issues
# Check CORS configuration in server
# Verify frontend URL in FRONTEND_URL env var
```

**Docker Issues**:
```bash
# Container build failed
docker system prune -a  # Clean Docker cache
docker-compose down -v  # Remove volumes
docker-compose up --build --force-recreate

# Port conflicts
docker-compose down
# Check docker-compose.yml port mappings

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

**Built with ❤️ for cricket fans and developers**

*This application demonstrates modern full-stack development with real-time features, cloud deployment, and production-ready architecture. Perfect for learning WebSocket communication, React state management, and containerized deployments.*
