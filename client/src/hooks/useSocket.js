import { useCallback } from 'react';
import { socketService } from '../services/socketService.js';
import { SOCKET_EVENTS, PAGES } from '../constants/index.js';

// Custom hook for Socket.IO integration with React
export const useSocket = (actions, navigate) => {
  
  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    const socket = socketService.connect();
    actions.setSocket(socket);
    actions.setConnected(true);
    return socket;
  }, [actions]);

  // Event handlers
  const handleConnect = useCallback(() => {
    console.log('Socket connected');
    actions.setConnected(true);
  }, [actions]);

  const handleDisconnect = useCallback(() => {
    console.log('Socket disconnected');
    actions.setConnected(false);
  }, [actions]);

  const handleRoomJoined = useCallback((data) => {
    console.log('🎉 Room joined successfully:', data);
    actions.setRoom(data.room);

    const me = data.room.users.find(u => u.id === data.userId);
    if (me) {
      console.log('👤 User data set:', me);
      actions.setUser(me);
    }

    actions.showToast('Room joined successfully!', 'success');
    actions.setLoading(false);

    console.log('🧭 Attempting navigation to room page...');
    if (navigate) {
      navigate(PAGES.ROOM);
      console.log('✅ Navigation function called');
    } else {
      console.log('❌ Navigate function not available');
    }
  }, [actions, navigate]);

  const handleUserJoined = useCallback((data) => {
    console.log('User joined:', data);
    actions.setRoom(data.room);
    actions.showToast(`${data.user.name} joined`, 'info');
  }, [actions]);

  const handleUserLeft = useCallback((data) => {
    console.log('User left:', data);
    actions.setRoom(data.room);
    actions.showToast(`${data.user.name} left`, 'info');
  }, [actions]);

  const handleRoomUpdated = useCallback((data) => {
    console.log('Room updated:', data);
    actions.setRoom(data.room);
  }, [actions]);

  const handleError = useCallback((error) => {
    console.error('Socket error:', error);
    actions.showToast(error.message || 'An error occurred', 'error');
    actions.setLoading(false);
  }, [actions]);

  // Register event handlers
  const registerEventHandlers = useCallback((socket) => {
    if (!socket) return;

    console.log('Registering socket event handlers');

    // Connection events
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    // Room events
    socketService.on(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
    socketService.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
    socketService.on(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
    socketService.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);

    // Error events
    socketService.on(SOCKET_EVENTS.ERROR, handleError);

    console.log('Socket event handlers registered');
  }, [
    handleConnect,
    handleDisconnect,
    handleRoomJoined,
    handleUserJoined,
    handleUserLeft,
    handleRoomUpdated,
    handleError
  ]);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('Cleaning up socket connection');
    socketService.disconnect();
  }, []);

  return {
    initializeSocket,
    registerEventHandlers,
    cleanup,
    socketService
  };
};
