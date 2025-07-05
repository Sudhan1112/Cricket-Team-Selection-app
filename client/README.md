# Cricket Team Selection Room - Frontend

A modern, real-time React frontend for cricket team selection built with Vite, Socket.IO, and TailwindCSS. This application provides an intuitive interface for multiplayer cricket team selection with real-time updates.

🌐 **Live Demo**: [cricket-team-selection-app.vercel.app](https://cricket-team-selection-app.vercel.app)

## 🚀 Features

- **Modern React Architecture**: Built with React 19+ and functional components
- **Real-time Communication**: Socket.IO client integration for live updates
- **Responsive Design**: TailwindCSS for mobile-first responsive UI
- **State Management**: Context API with useReducer for predictable state
- **Modular Architecture**: Clean separation with hooks, services, and components
- **Hot Reload**: Vite development server with instant updates
- **Cloud Deployed**: Production deployment on Vercel

## 🛠 Tech Stack

- **Framework**: React 19.1.0 with JSX
- **Build Tool**: Vite 7.0.0 (Lightning fast HMR)
- **Styling**: TailwindCSS 4.1.11 with Vite plugin
- **Real-time**: Socket.IO Client 4.8.1
- **Icons**: Lucide React 0.525.0
- **Linting**: ESLint 9.29.0 with React hooks plugin
- **Deployment**: Vercel (Production)

## 📋 Prerequisites

- **Development**: Node.js 18+, npm/yarn
- **Browser**: Modern browser with WebSocket support

## 🚀 Quick Start

### Local Development

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Access development server
open http://localhost:5173
```

### Production Access

Visit the live application: [cricket-team-selection-app.vercel.app](https://cricket-team-selection-app.vercel.app)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Production |
|----------|-------------|---------|------------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:3001` | Auto-detected |
| `NODE_ENV` | Environment mode | `development` | `production` |

### Application Constants

| Setting | Value | Description |
|---------|-------|-------------|
| **Toast Duration** | 5000ms | Notification display time |
| **Selection Timer** | 10 seconds | Turn time limit |
| **Min Users** | 2 | Minimum users to start |
| **Max Users** | 10 | Maximum users per room |
| **Players per User** | 5 | Cricket players each user selects |

## 🏗 Project Structure

```
client/
├── public/
│   └── vite.svg                  # Vite logo asset
├── src/
│   ├── components/               # React components
│   │   ├── HomeScreen.jsx        # Landing page with room creation/join
│   │   ├── RoomScreen.jsx        # Main game interface
│   │   └── Toast.jsx             # Notification component
│   ├── context/
│   │   └── AppContext.jsx        # React Context provider
│   ├── hooks/
│   │   └── useSocket.js          # Socket.IO integration hook
│   ├── services/
│   │   └── socketService.js      # Socket.IO service layer
│   ├── store/
│   │   ├── actions.js            # Action creators
│   │   ├── reducer.js            # State reducer
│   │   └── types.js              # Action types
│   ├── constants/
│   │   └── index.js              # Application constants
│   ├── App.jsx                   # Main application component
│   ├── main.jsx                  # Application entry point
│   └── index.css                 # Global styles
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite configuration
├── eslint.config.js              # ESLint configuration
└── index.html                    # HTML template
```

## 🎨 Component Architecture

### Core Components

**App.jsx - Main Application**
```jsx
const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

const AppContent = () => {
  const { state, actions } = useApp();
  const [page, setPage] = useState(PAGES.HOME);

  // Socket initialization and event handling
  const { initializeSocket, registerEventHandlers } = useSocket(actions, navigate);

  return (
    <>
      {page === PAGES.HOME && <HomeScreen onNavigate={navigate} />}
      {page === PAGES.ROOM && <RoomScreen />}
      <Toast />
    </>
  );
};
```

**HomeScreen.jsx - Landing Page**
- Room creation with auto-generated IDs
- Room joining with validation
- Real-time connection status
- Input validation and loading states

**RoomScreen.jsx - Game Interface**
- Room information display
- User list with host indicators
- Player selection grid
- Turn timer and selection history
- Real-time updates

### State Management

**Context API with useReducer**
```jsx
const initialState = {
  // Connection state
  connected: false,
  socket: null,
  loading: false,

  // User and room state
  user: null,
  room: null,

  // UI state
  toast: { show: false, message: '', type: 'info' }
};
```

### Socket.IO Integration

**Socket Service Layer**
```jsx
class SocketService {
  connect() {
    this.socket = io(API_CONFIG.SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: API_CONFIG.TIMEOUT
    });
    return this.socket;
  }

  // Room operations
  joinRoom(roomId, userName) {
    const userId = this.socket?.id || Math.random().toString(36).substring(2, 15);
    this.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, userId, userName });
  }

  startSelection() {
    this.emit(SOCKET_EVENTS.START_SELECTION);
  }

  selectPlayer(playerId) {
    this.emit(SOCKET_EVENTS.SELECT_PLAYER, { playerId });
  }
}
```

## 🔌 Socket.IO Events

### Client Event Handlers

| Event | Handler | Description |
|-------|---------|-------------|
| `room-joined` | `handleRoomJoined` | User successfully joined room |
| `user-joined` | `handleUserJoined` | Another user joined room |
| `user-left` | `handleUserLeft` | User left the room |
| `selection-started` | `handleSelectionStarted` | Selection process began |
| `turn-started` | `handleTurnStarted` | User's turn to select |
| `player-selected` | `handlePlayerSelected` | Player was selected |
| `auto-selected` | `handleAutoSelected` | Auto-selection occurred |
| `selection-ended` | `handleSelectionEnded` | Selection completed |
| `room-updated` | `handleRoomUpdated` | Room state changed |
| `error` | `handleError` | Error occurred |

## 🧪 Testing & Development

### Development Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Testing Socket.IO Integration

```javascript
// Manual testing script
const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);

  // Test room joining
  socket.emit('join-room', {
    roomId: 'TEST123',
    userId: socket.id,
    userName: 'Test User'
  });
});

socket.on('room-joined', (data) => {
  console.log('✅ Room joined:', data);
});
```

## 🚀 Deployment

### Local Development
```bash
# Quick start
npm run dev

# With backend
cd ../server && npm run dev &
cd client && npm run dev
```

### Vercel Deployment (Current)

The application is deployed on Vercel at: [cricket-team-selection-app.vercel.app](https://cricket-team-selection-app.vercel.app)

**Deployment Configuration**:
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

### Other Cloud Platforms

**Netlify**:
```bash
npm run build
netlify deploy --prod --dir=dist
```

**AWS S3 + CloudFront**:
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Environment Configurations

**Development**:
```env
VITE_BACKEND_URL=http://localhost:3001
NODE_ENV=development
```

**Production (Vercel)**:
```env
VITE_BACKEND_URL=auto-detected
NODE_ENV=production
```

## 🐛 Troubleshooting

### Common Issues

**Socket.IO Connection Issues**:
```bash
# Check backend connectivity
curl http://localhost:3001/health

# Debug socket connection (browser console)
localStorage.debug = 'socket.io-client:*';
```

**Build Issues**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**Vercel Deployment Issues**:
- Check build logs in Vercel dashboard
- Verify environment variables are set correctly
- Ensure all dependencies are in package.json

## 🔒 Security Features

### Frontend Security
- ✅ **Input Validation**: Client-side validation for all inputs
- ✅ **Environment Variables**: Secure configuration management
- ✅ **XSS Protection**: React's built-in XSS protection
- ✅ **HTTPS**: Secure communication in production

## 🚀 Performance Optimization

### Build Optimization
- **Code Splitting**: Automatic chunk splitting for optimal loading
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Image and font optimization
- **Caching Strategy**: Aggressive caching for static assets

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Performance testing
npm run preview
lighthouse http://localhost:4173
```

## 📞 Support

### Getting Help
- 📖 **Documentation**: Check this README and inline code comments
- 🐛 **Issues**: Create GitHub issue with reproduction steps
- 💬 **Discussions**: Use GitHub Discussions for questions

### Useful Commands
```bash
# Reset development environment
rm -rf node_modules .vite
npm install && npm run dev

# Test production build locally
npm run build && npm run preview

# Check for updates
npm outdated
```

### Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Safari | 14+ | ✅ Full |
| Chrome Mobile | 90+ | ✅ Full |

---

**Built with ❤️ for cricket fans and developers**

*This frontend provides a modern, responsive interface for real-time cricket team selection with cloud deployment and production-ready architecture.*
