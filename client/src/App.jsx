// App.jsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState
} from 'react';
import { io } from 'socket.io-client';
import {
  User,
  Users,
  Home,
  Timer,
  Copy,
  Check,
  Crown,
  Play
} from 'lucide-react';

// 🔗 Backend URL (Vite env or fallback)
const SOCKET_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// 🔔 Socket event constants
const SOCKET_EVENTS = {
  // client → server
  JOIN_ROOM: 'join-room',
  START_SELECTION: 'start-selection',
  SELECT_PLAYER: 'select-player',
  // server → client
  ROOM_JOINED: 'room-joined',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  SELECTION_STARTED: 'selection-started',
  TURN_STARTED: 'turn-started',
  PLAYER_SELECTED: 'player-selected',
  AUTO_SELECTED: 'auto-selected',
  SELECTION_ENDED: 'selection-ended',
  ERROR: 'error',
  ROOM_UPDATED: 'room-updated'
};

// 📦 App state & reducer
const initialState = {
  user: null,
  room: null,
  socket: null,
  currentTurn: null,
  timer: 0,
  isSelectionActive: false,
  toast: null,
  loading: false,
  connected: false
};

const ActionTypes = {
  SET_USER: 'SET_USER',
  SET_ROOM: 'SET_ROOM',
  UPDATE_ROOM: 'UPDATE_ROOM',
  SET_SOCKET: 'SET_SOCKET',
  SET_CURRENT_TURN: 'SET_CURRENT_TURN',
  SET_TIMER: 'SET_TIMER',
  SET_SELECTION_STATUS: 'SET_SELECTION_STATUS',
  SET_TOAST: 'SET_TOAST',
  CLEAR_TOAST: 'CLEAR_TOAST',
  SET_LOADING: 'SET_LOADING',
  SET_CONNECTED: 'SET_CONNECTED'
};

function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };
    case ActionTypes.SET_ROOM:
      return { ...state, room: action.payload };
    case ActionTypes.UPDATE_ROOM:
      return {
        ...state,
        room: { ...state.room, ...action.payload }
      };
    case ActionTypes.SET_SOCKET:
      return { ...state, socket: action.payload };
    case ActionTypes.SET_CURRENT_TURN:
      return { ...state, currentTurn: action.payload };
    case ActionTypes.SET_TIMER:
      return { ...state, timer: action.payload };
    case ActionTypes.SET_SELECTION_STATUS:
      return { ...state, isSelectionActive: action.payload };
    case ActionTypes.SET_TOAST:
      return { ...state, toast: action.payload };
    case ActionTypes.CLEAR_TOAST:
      return { ...state, toast: null };
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_CONNECTED:
      return { ...state, connected: action.payload };
    default:
      return state;
  }
}

// 🌐 Context & hook
const AppContext = createContext();
const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

// 🔌 Create socket
const createSocket = () => {
  console.log('Creating socket to:', SOCKET_URL);
  const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling']
  });
  socket.on('connect', () =>
    console.log('✅ WS connected:', socket.id)
  );
  socket.on('disconnect', reason =>
    console.log('❌ WS disconnected:', reason)
  );
  socket.on('connect_error', err =>
    console.error('🔥 WS error:', err)
  );
  return socket;
};

// 🎨 UI Components (Button, Card, Input, Toast)
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  icon: Icon,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 focus:ring-blue-500',
    secondary:
      'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 focus:ring-gray-500',
    ghost:
      'bg-transparent hover:bg-gray-800 text-gray-200 border border-gray-600 focus:ring-gray-500'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${
        sizes[size]
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
        className
      }`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '', ...props }) => (
  <div
    className={`bg-gray-800 rounded-lg border border-gray-700 shadow-lg ${className}`}
    {...props}
  >
    {children}
  </div>
);

const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-200">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      )}
      <input
        className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          Icon ? 'pl-10' : ''
        } ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-sm text-red-400">{error}</p>}
  </div>
);

const Toast = ({ message, type, onClose }) => {
  const bg =
    type === 'error'
      ? 'bg-red-900 text-red-200'
      : type === 'success'
      ? 'bg-green-900 text-green-200'
      : 'bg-blue-900 text-blue-200';
  return (
    <div
      className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 border border-gray-600 ${bg}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-4 text-gray-400">
          ×
        </button>
      </div>
    </div>
  );
};

// 🏠 HomeScreen
const HomeScreen = ({ onNavigate }) => {
  const { state, actions } = useApp();
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state.socket) {
      const socket = createSocket();
      actions.setSocket(socket);

      socket.on('connect', () => actions.setConnected(true));
      socket.on('disconnect', () => actions.setConnected(false));

      socket.on(SOCKET_EVENTS.ROOM_JOINED, data => {
        actions.setRoom(data.room);
        const me = data.room.users.find(u => u.id === data.userId);
        actions.setUser(me);
        actions.showToast('Room joined!', 'success');
        onNavigate('room');
      });
      socket.on(SOCKET_EVENTS.ERROR, err => {
        actions.showToast(err.message, 'error');
        setError(err.message);
      });
    }
    return () => state.socket?.off();
  }, [state.socket]);

const handleCreate = async () => {
  setError('');
  if (!userName.trim()) return setError('Enter your name');
  if (!state.socket?.id) return setError('WebSocket not ready');

  actions.setLoading(true);
  try {
    const res = await fetch(`${SOCKET_URL}/api/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostId: state.socket.id,
        hostName: userName
      })
    });

    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message);

    const roomId = json.data.roomId;

    console.log('🎉 Room Created:', roomId);

    state.socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
      roomId,
      userId: state.socket.id,
      userName
    });
  } catch (e) {
    actions.showToast(e.message, 'error');
    setError(e.message);
  } finally {
    actions.setLoading(false);
  }
};



  const handleJoin = () => {
    setError('');
    if (!userName.trim()) return setError('Enter your name');
    if (!roomId.trim()) return setError('Enter room ID');
    if (!state.connected) return setError('No WS connection');
    actions.setLoading(true);
    state.socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
      roomId: roomId.toUpperCase(),
      userId: state.socket.id,
      userName
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Cricket Team Selection
          </h1>
          <p className="text-gray-400 mb-2">
            {state.connected
              ? '🟢 Connected'
              : '🔴 Disconnected'}
          </p>
        </div>
        <Input
          label="Your Name"
          icon={User}
          value={userName}
          onChange={e => setUserName(e.target.value)}
          placeholder="Enter your name"
          error={error.includes('name') ? error : ''}
        />
        <div className="mt-6 space-y-4">
          <Button
            className="w-full"
            icon={Home}
            onClick={handleCreate}
            disabled={!state.connected || state.loading}
            size="lg"
          >
            Create Room
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">or</span>
            </div>
          </div>
          <Input
            label="Room ID"
            icon={Users}
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            placeholder="Enter room ID"
            error={error.includes('room') ? error : ''}
          />
          <Button
            variant="secondary"
            className="w-full"
            icon={Users}
            onClick={handleJoin}
            disabled={!state.connected || state.loading}
            size="lg"
          >
            Join Room
          </Button>
        </div>
      </Card>
    </div>
  );
};

// 🏟 RoomScreen
const RoomScreen = () => {
  const { state, actions } = useApp();
  const [tick, setTick] = useState(state.timer);

  useEffect(() => {
    if (!state.socket) return;
    const sock = state.socket;

    sock.on(SOCKET_EVENTS.USER_JOINED, data => {
      actions.updateRoom(data.room);
      actions.showToast(`${data.user.name} joined`, 'info');
    });
    sock.on(SOCKET_EVENTS.USER_LEFT, data => {
      actions.showToast(`${data.userName} left`, 'info');
    });
    sock.on(SOCKET_EVENTS.SELECTION_STARTED, data => {
      actions.setSelectionStatus(true);
      actions.updateRoom(data.room);
      actions.showToast('Selection started!', 'success');
    });
    sock.on(SOCKET_EVENTS.TURN_STARTED, data => {
      actions.setCurrentTurn({
        userId: data.userId,
        userName: data.userName
      });
      actions.setTimer(data.timeLimit / 1000);
      actions.updateRoom(data.room);
    });
    sock.on(SOCKET_EVENTS.PLAYER_SELECTED, data => {
      actions.updateRoom(data.room);
      actions.showToast(
        `${data.player.name} selected by ${data.userName}`,
        'success'
      );
    });
    sock.on(SOCKET_EVENTS.AUTO_SELECTED, data => {
      actions.updateRoom(data.room);
      actions.showToast(
        `${data.player.name} auto-picked for ${data.userName}`,
        'info'
      );
    });
    sock.on(SOCKET_EVENTS.SELECTION_ENDED, () => {
      actions.setSelectionStatus(false);
      actions.setCurrentTurn(null);
      actions.showToast('Selection complete!', 'success');
    });
    sock.on(SOCKET_EVENTS.ROOM_UPDATED, data => {
      actions.updateRoom(data.room);
    });

    return () => sock.off();
  }, [state.socket]);

  // Countdown timer
  useEffect(() => {
    setTick(state.timer);
    if (state.isSelectionActive && tick > 0) {
      const iv = setInterval(() => setTick(t => t - 1), 1000);
      return () => clearInterval(iv);
    }
  }, [state.timer, state.isSelectionActive]);

  const isMyTurn =
    state.currentTurn?.userId === state.user?.id;

  const startSelection = () =>
    state.socket.emit(SOCKET_EVENTS.START_SELECTION, {
      roomId: state.room.id
    });

  const selectPlayer = player =>
    state.socket.emit(SOCKET_EVENTS.SELECT_PLAYER, {
      roomId: state.room.id,
      playerId: player.id
    });

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* RoomHeader */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Room {state.room.id}
            </h2>
            {state.user.id === state.room.hostId && (
              <div className="flex items-center text-yellow-400">
                <Crown className="w-4 h-4 mr-1" />
                Host
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-400">
              Players: {state.room.users.length}/6
            </p>
            {state.isSelectionActive && (
              <div className="flex items-center mt-2 text-orange-400">
                <Timer className="w-4 h-4 mr-1" />
                {tick}s
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* UsersList */}
        <Card className="p-4">
          <h3 className="text-xl font-semibold text-white mb-4">
            Players
          </h3>
          <div className="space-y-3">
            {state.room.users.map(u => (
              <div
                key={u.id}
                className={`p-3 rounded-lg border ${
                  state.currentTurn?.userId === u.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 bg-gray-700/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-white">{u.name}</p>
                  </div>
                  {u.id === state.room.hostId && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
          {state.user.id === state.room.hostId &&
            !state.isSelectionActive && (
              <Button
                className="w-full mt-4"
                icon={Play}
                onClick={startSelection}
                disabled={state.room.users.length < 2}
              >
                Start
              </Button>
            )}
        </Card>

        {/* PlayersGrid */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Available Players
              </h3>
              <span className="text-gray-400">
                {state.room.availablePlayers.length} left
              </span>
            </div>
            {state.isSelectionActive && state.currentTurn && (
              <div
                className={`mb-4 p-3 rounded-lg border ${
                  isMyTurn
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-blue-500 bg-blue-900/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">
                    {isMyTurn
                      ? 'Your turn!'
                      : `${state.currentTurn.userName}'s turn`}
                  </span>
                  <span
                    className={`font-mono ${
                      tick <= 5
                        ? 'text-red-400'
                        : 'text-orange-400'
                    }`}
                  >
                    {tick}s
                  </span>
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {state.room.availablePlayers.map(pl => (
                <div
                  key={pl.id}
                  onClick={() =>
                    isMyTurn &&
                    state.isSelectionActive &&
                    selectPlayer(pl)
                  }
                  className={`p-3 rounded-lg border transition duration-200 ${
                    isMyTurn && state.isSelectionActive
                      ? 'hover:border-blue-500 cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <p className="text-white">{pl.name}</p>
                    <span className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded">
                      {pl.role}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">{pl.team}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 🎁 AppProvider & AppContent
const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const actions = {
    setUser: u => dispatch({ type: ActionTypes.SET_USER, payload: u }),
    setRoom: r => dispatch({ type: ActionTypes.SET_ROOM, payload: r }),
    updateRoom: u =>
      dispatch({ type: ActionTypes.UPDATE_ROOM, payload: u }),
    setSocket: s =>
      dispatch({ type: ActionTypes.SET_SOCKET, payload: s }),
    setCurrentTurn: t =>
      dispatch({ type: ActionTypes.SET_CURRENT_TURN, payload: t }),
    setTimer: t => dispatch({ type: ActionTypes.SET_TIMER, payload: t }),
    setSelectionStatus: s =>
      dispatch({
        type: ActionTypes.SET_SELECTION_STATUS,
        payload: s
      }),
    showToast: (msg, type) =>
      dispatch({
        type: ActionTypes.SET_TOAST,
        payload: { message: msg, type }
      }),
    clearToast: () =>
      dispatch({ type: ActionTypes.CLEAR_TOAST }),
    setLoading: l =>
      dispatch({ type: ActionTypes.SET_LOADING, payload: l }),
    setConnected: c =>
      dispatch({
        type: ActionTypes.SET_CONNECTED,
        payload: c
      })
  };
  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

const AppContent = () => {
  const { state, actions } = useApp();
  const [page, setPage] = useState('home');

  useEffect(() => {
    if (state.toast) {
      const to = setTimeout(() => actions.clearToast(), 5000);
      return () => clearTimeout(to);
    }
  }, [state.toast]);

  return (
    <>
      {page === 'home' && (
        <HomeScreen onNavigate={setPage} />
      )}
      {page === 'room' && <RoomScreen />}
      {state.toast && (
        <Toast
          message={state.toast.message}
          type={state.toast.type}
          onClose={actions.clearToast}
        />
      )}
      {state.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-md shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <p className="mt-3 text-gray-200">Loading...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
