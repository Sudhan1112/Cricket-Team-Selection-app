# Cricket Team Selection Room - Backend

A real-time multiplayer backend for cricket team selection using Express.js, Socket.IO, and Redis. This system allows multiple users to join rooms and take turns selecting cricket players in a real-time environment with comprehensive Docker support and API testing suite.

## 🚀 Features

- **Real-time Communication**: WebSocket-based real-time updates using Socket.IO
- **Turn-based Selection**: 10-second turn timer with auto-selection fallback
- **Room Management**: Create, join, leave rooms with host privileges
- **User Management**: Multi-user support with reconnection handling
- **Redis Persistence**: Room data persistence with configurable TTL
- **Docker Ready**: Production-ready containerization with multi-stage builds
- **Health Monitoring**: Built-in health checks and monitoring endpoints
- **API Testing**: Comprehensive Bruno API testing suite
- **Scalable Architecture**: Clean separation with services, controllers, and models

## 🛠 Tech Stack

- **Runtime**: Node.js 18+ (Alpine Linux in containers)
- **Framework**: Express.js 4.x
- **Real-time**: Socket.IO 4.8+
- **Database**: Redis 7+ (for session storage and caching)
- **Validation**: Joi schema validation
- **Containerization**: Docker & Docker Compose
- **Testing**: Bruno API Client, Custom Socket.IO test scripts
- **Security**: Non-root containers, CORS protection, input validation

## 📋 Prerequisites

- **Development**: Node.js 18+, Redis 7+, npm/yarn
- **Docker**: Docker 20.10+, Docker Compose 2.0+
- **Testing**: Bruno API Client (optional)
- **Ports**: 3001 (API), 6379 (Redis)

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

```bash
# Clone and navigate
git clone <repository-url>
cd cricket-team-selection-app

# Quick deploy with script
./deploy.sh        # Linux/Mac
deploy.bat         # Windows

# Or manual Docker Compose
docker-compose up --build -d

# Verify deployment
curl http://localhost:3001/health
```

### Option 2: Local Development

```bash
# Install dependencies
cd server
npm install

# Start Redis
redis-server

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Development mode
npm run dev

# Production mode
npm start
```

### Option 3: Development with Docker

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Frontend separately (recommended for faster development)
cd client && npm run dev
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Docker Override |
|----------|-------------|---------|-----------------|
| PORT | Server port | 3001 | 3001 |
| REDIS_URL | Redis connection | redis://localhost:6379 | redis://redis:6379 |
| FRONTEND_URL | CORS origin | http://localhost:3000 | http://localhost:80 |
| NODE_ENV | Environment | development | production |

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
| join-room | Join a room | `{ roomId: string, userId: string, userName: string }` |
| start-selection | Begin selection process | `{}` |
| select-player | Select a cricket player | `{ playerId: string }` |
| leave-room | Leave current room | `{}` |

### Server → Client Events

| Event | Description | Payload Schema |
|-------|-------------|----------------|
| room-joined | Successfully joined room | `{ room: Room, userId: string }` |
| user-joined | Another user joined | `{ user: User, room: Room }` |
| user-left | User left room | `{ userId: string, userName: string, room: Room }` |
| selection-started | Selection process began | `{ room: Room, turnOrder: string[] }` |
| turn-started | Turn timer started | `{ userId: string, userName: string, timeLimit: number, room: Room }` |
| player-selected | Player successfully selected | `{ userId: string, userName: string, player: Player, room: Room }` |
| auto-selected | Auto-selection occurred | `{ userId: string, userName: string, player: Player, room: Room }` |
| selection-ended | Selection process completed | `{ results: SelectionResults, room: Room }` |
| room-updated | Room state changed | `{ room: Room }` |
| error | Error occurred | `{ message: string, code?: string }` |

## 🎮 Application Flow

### 1. Room Creation & Joining

1. Host creates room via API
2. Users join using room ID
3. Host manages room settings
4. Real-time updates via Socket.IO

### 2. Selection Process

1. Host starts selection
2. Turn-based player selection
3. 10-second timer per turn
4. Auto-selection on timeout
5. Results aggregation

## 🏗 Project Structure

```
server/
├── config/
│   ├── redis.js              # Redis connection & configuration
│   └── database.js           # Database setup utilities
├── constants/
│   ├── index.js              # Application constants
│   ├── players.js            # Cricket players data
│   └── socketEvents.js       # Socket.IO event names
├── controllers/
│   ├── roomController.js     # HTTP route handlers
│   ├── socketController.js   # Socket.IO event handlers
│   └── playerController.js   # Player management
├── models/
│   ├── Room.js               # Room data model & validation
│   ├── User.js               # User data model
│   └── Player.js             # Player data model
├── routes/
│   ├── roomRoutes.js         # Room management routes
│   ├── playerRoutes.js       # Player routes
│   └── index.js              # Route aggregation
├── services/
│   ├── roomService.js        # Room business logic
│   ├── socketService.js      # Socket.IO service layer
│   ├── playerService.js      # Player management logic
│   └── redisService.js       # Redis operations
├── middleware/
│   ├── validation.js         # Request validation
│   ├── errorHandler.js       # Error handling
│   └── cors.js               # CORS configuration
├── utils/
│   ├── logger.js             # Logging utilities
│   └── helpers.js            # Helper functions
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── socket/               # Socket.IO tests
├── docker/
│   ├── Dockerfile            # Production container
│   ├── Dockerfile.dev        # Development container
│   └── .dockerignore         # Docker ignore rules
├── server.js                 # Main application entry
├── simple-server.js          # Simplified server for testing
├── package.json              # Dependencies & scripts
├── .env.example              # Environment template
└── .env.production           # Production environment
```

## 🧪 Testing

### Bruno API Testing Suite

The project includes a comprehensive Bruno API testing collection located in `Cricket_selection_app_bruno_API_testing/`:

#### Bruno Test Collection Structure

```
Cricket_selection_app_bruno_API_testing/
├── bruno.json                    # Bruno configuration
├── Health Check request.bru      # Health endpoint test
├── creating room.bru             # Room creation test
├── joining Room.bru              # Room joining test
├── Getting Available Players.bru # Players endpoint test
├── Get Room Info.bru             # Room details test
├── Leave Room request.bru        # Leave room test
└── Deleting Room.bru             # Room deletion test
```

#### Running Bruno Tests

1. **Install Bruno**: Download from [Bruno Website](https://www.usebruno.com/)
2. **Open Collection**: File → Open Collection → Select `Cricket_selection_app_bruno_API_testing`
3. **Configure Environment**: Set base URL to `http://localhost:3001`
4. **Run Tests**: Execute individual tests or run entire collection

#### Test Scenarios Covered

- ✅ **Health Check**: Server availability and status
- ✅ **Room Creation**: Valid/invalid room creation scenarios
- ✅ **Room Joining**: Multiple users joining rooms
- ✅ **Player Management**: Available players retrieval
- ✅ **Room Information**: Detailed room state retrieval
- ✅ **Leave Room**: User leaving room scenarios
- ✅ **Room Deletion**: Host deleting rooms

### Custom Test Scripts

#### Available Test Scripts

```bash
# Socket.IO Connection Tests
node test-socket.js              # Basic socket connection
node test-simple.js              # Simple room operations
node debug-socket.js             # Socket debugging

# Room Flow Tests
node test-room-flow.js           # Complete room workflow
node test-two-users.js           # Multi-user scenarios
node test-selection-start.js     # Selection process testing

# API Tests
node test-api.js                 # HTTP API testing
node test-connection.js          # Connection testing
node comprehensive-test.js       # Full system test
```

#### Running Tests

```bash
# Start test server
npm run test:server

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:socket        # Socket.IO tests

# Run all tests with coverage
npm run test:coverage

# Custom test scripts
node test-two-users.js     # Test multi-user scenarios
node comprehensive-test.js # Full system test
```

## 🐳 Docker Configuration

### Production Container (`Dockerfile`)

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Security: Non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Application code
COPY . .
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

EXPOSE 3001
CMD ["node", "server.js"]
```

### Development Container (`Dockerfile.dev`)

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install nodemon for hot reload
RUN npm install -g nodemon

# Dependencies (including dev dependencies)
COPY package*.json ./
RUN npm install

# Application code
COPY . .

EXPOSE 3001
CMD ["nodemon", "server.js"]
```

### Docker Compose Configuration

#### Production Setup (`docker-compose.yml`)

```yaml
services:
  # Redis database
  redis:
    image: redis:alpine
    container_name: cricket-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: ["redis-server", "--appendonly", "yes"]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API server
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: cricket-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - REDIS_URL=redis://redis:6379
      - FRONTEND_URL=http://localhost:80
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - cricket-network

volumes:
  redis-data:
    driver: local

networks:
  cricket-network:
    driver: bridge
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "redis": "connected",
    "socket": "active"
  },
  "memory": {
    "used": "45.2 MB",
    "total": "512 MB"
  }
}
```

### Docker Health Checks

- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Retries**: 3 attempts
- **Start Period**: 5 seconds

### Monitoring Commands

```bash
# Container stats
docker stats cricket-backend 

# Resource usage
docker-compose top

# Service status
docker-compose ps

# Real-time logs
docker-compose logs -f --tail=100
```

## 🔒 Security Features

### Container Security

- ✅ **Non-root user**: Runs as nodejs user (UID 1001)
- ✅ **Minimal base image**: Alpine Linux for reduced attack surface
- ✅ **Health checks**: Automatic service monitoring
- ✅ **Network isolation**: Custom Docker networks

### Application Security

- ✅ **Input validation**: Joi schema validation for all inputs
- ✅ **CORS protection**: Configurable origin restrictions
- ✅ **Rate limiting**: Ready for implementation
- ✅ **Error handling**: Secure error messages
- ✅ **Environment isolation**: Separate configs per environment

### Redis Security

- ✅ **Network isolation**: Container-to-container communication
- ✅ **Data persistence**: Configurable with AOF
- ✅ **Connection security**: URL-based authentication ready

## 🚀 Deployment

### Local Development

```bash
# Quick start
npm run dev

# With Docker
docker-compose -f docker-compose.dev.yml up
```

### Production Deployment

#### Docker Deployment

```bash
# Using deployment scripts
./deploy.sh deploy        # Linux/Mac
deploy.bat deploy         # Windows

# Manual deployment
docker-compose up --build -d

# Verify deployment
curl http://localhost:3001/health
```

#### Cloud Deployment

**Railway:**
```bash
# Connect to Railway
railway login
railway link
railway up
```

**Render:**
- Connect GitHub repository
- Set environment variables
- Deploy from `server/` directory

**AWS ECS:**
- Push image to ECR
- Create ECS service
- Configure load balancer

### Environment-specific Configurations

#### Development
```env
NODE_ENV=development
PORT=3001
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
DEBUG=socket.io:*
```

#### Production
```env
NODE_ENV=production
PORT=3001
REDIS_URL=redis://redis:6379
FRONTEND_URL=https://your-domain.com
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Run tests: `npm test`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Create Pull Request

### Code Standards

- **ESLint**: Follow configured linting rules
- **Testing**: Maintain test coverage above 80%
- **Documentation**: Update README for new features
- **Docker**: Test containerized deployment

## 🐛 Troubleshooting

### Common Issues

#### Redis Connection Issues

```bash
# Check Redis status
redis-cli ping
# Expected: PONG

# Docker Redis check
docker-compose exec redis redis-cli ping

# Connection string issues
# Ensure REDIS_URL format: redis://host:port
```

#### Socket.IO Connection Problems

```bash
# Check CORS configuration
# Verify FRONTEND_URL in environment

# Debug socket connections
DEBUG=socket.io:* npm run dev

# Test socket endpoint
curl http://localhost:3001/socket.io/
```

#### Docker Issues

```bash
# Port conflicts
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Container logs
docker-compose logs backend

# Rebuild containers
docker-compose down -v
docker-compose up --build
```

### Debug Mode

```bash
# Enable comprehensive debugging
DEBUG=* npm run dev

# Socket.IO specific debugging
DEBUG=socket.io:* npm run dev

# Application debugging
DEBUG=app:* npm run dev
```

## 📈 Performance Optimization

### Redis Optimization

- **Connection pooling**: Implemented for high concurrency
- **TTL management**: Automatic room cleanup
- **Memory optimization**: Efficient data structures

### Socket.IO Optimization

- **Event batching**: Reduced message frequency
- **Room-based broadcasting**: Targeted message delivery
- **Connection management**: Automatic reconnection handling

### Container Optimization

- **Multi-stage builds**: Reduced image size
- **Alpine Linux**: Minimal base image
- **Health checks**: Proactive monitoring

## 🙏 Acknowledgments

- Socket.IO team for excellent real-time communication
- Redis team for robust caching solution
- Docker team for containerization platform
- Express.js team for web framework

---
