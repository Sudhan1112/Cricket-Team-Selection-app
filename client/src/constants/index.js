// Constants for the Cricket Team Selection App

// Socket Events
export const SOCKET_EVENTS = {
  // Room events
  JOIN_ROOM: 'join-room',
  ROOM_JOINED: 'room-joined',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  ROOM_UPDATED: 'room-updated',
  
  // Selection events
  START_SELECTION: 'start-selection',
  SELECTION_STARTED: 'selection-started',
  SELECT_PLAYER: 'select-player',
  PLAYER_SELECTED: 'player-selected',
  TURN_CHANGED: 'turn-changed',
  SELECTION_COMPLETED: 'selection-completed',
  
  // System events
  ERROR: 'error'
};

// API Configuration
export const API_CONFIG = {
  SOCKET_URL: (() => {
    // Check for environment variable first (Docker/production)
    if (import.meta.env.VITE_BACKEND_URL) {
      return import.meta.env.VITE_BACKEND_URL;
    }

    // Fallback based on environment
    if (import.meta.env.PROD) {
      return window.location.protocol + '//' + window.location.hostname + ':3001';
    }

    // Development fallback
    return 'http://localhost:3001';
  })(),
  TIMEOUT: 20000
};

// UI Constants
export const UI_CONSTANTS = {
  TOAST_DURATION: 5000,
  SELECTION_TIMER: 10, // seconds
  MIN_USERS_TO_START: 2,
  MAX_USERS_PER_ROOM: 10,
  PLAYERS_PER_USER: 5
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Page Routes
export const PAGES = {
  HOME: 'home',
  ROOM: 'room'
};
