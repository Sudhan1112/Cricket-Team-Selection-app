import { io } from 'socket.io-client';
import { API_CONFIG, SOCKET_EVENTS } from '../constants/index.js';

// Socket service for managing Socket.IO connections and events
class SocketService {
  constructor() {
    this.socket = null;
    this.eventHandlers = new Map();
  }

  // Create and connect socket
  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    console.log('Creating socket connection to:', API_CONFIG.SOCKET_URL);
    
    this.socket = io(API_CONFIG.SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: API_CONFIG.TIMEOUT
    });

    // Basic connection event handlers
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventHandlers.clear();
    }
  }

  // Register event handler
  on(event, handler) {
    if (!this.socket) {
      console.error('Socket not connected. Call connect() first.');
      return;
    }

    // Store handler reference for cleanup
    this.eventHandlers.set(event, handler);
    this.socket.on(event, handler);
  }

  // Remove event handler
  off(event) {
    if (!this.socket) return;

    const handler = this.eventHandlers.get(event);
    if (handler) {
      this.socket.off(event, handler);
      this.eventHandlers.delete(event);
    }
  }

  // Emit event
  emit(event, data) {
    if (!this.socket) {
      console.error('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.emit(event, data);
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Room operations
  joinRoom(roomId, userName) {
    // Generate userId from socket ID if not provided
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

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
