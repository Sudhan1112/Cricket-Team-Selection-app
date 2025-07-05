// App.jsx - Modular Cricket Team Selection App
import React, { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { useSocket } from './hooks/useSocket.js';
import HomeScreen from './components/HomeScreen.jsx';
import RoomScreen from './components/RoomScreen.jsx';
import Toast from './components/Toast.jsx';
import { PAGES } from './constants/index.js';

// Main App Content Component
const AppContent = () => {
  const { state, actions } = useApp();
  const [page, setPage] = useState(PAGES.HOME);
  
  // Stable navigation function
  const navigate = useCallback((newPage) => {
    console.log('🧭 Navigation called:', { from: page, to: newPage });
    setPage(newPage);
  }, [page]);

  // Initialize socket and event handlers
  const { initializeSocket, registerEventHandlers, cleanup } = useSocket(actions, navigate);

  // Initialize socket connection on mount
  useEffect(() => {
    console.log('Initializing socket connection...');
    const socket = initializeSocket();
    registerEventHandlers(socket);

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [initializeSocket, registerEventHandlers, cleanup]);

  // Handle navigation to room when room state is set
  useEffect(() => {
    if (state.room && page === PAGES.HOME) {
      console.log('🚀 Navigating to room page - room data received');
      setPage(PAGES.ROOM);
    }
  }, [state.room, page]);

  // Auto-navigate to home if user leaves room
  useEffect(() => {
    if (!state.room && page === PAGES.ROOM) {
      setPage(PAGES.HOME);
    }
  }, [state.room, page]);

  return (
    <>
      {page === PAGES.HOME && <HomeScreen onNavigate={navigate} />}
      {page === PAGES.ROOM && <RoomScreen />}
      <Toast />
    </>
  );
};

// Main App Component with Provider
const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
