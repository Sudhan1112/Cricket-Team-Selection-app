// Action Types for State Management

export const ActionTypes = {
  // User actions
  SET_USER: 'SET_USER',
  
  // Room actions
  SET_ROOM: 'SET_ROOM',
  UPDATE_ROOM: 'UPDATE_ROOM',
  
  // Socket actions
  SET_SOCKET: 'SET_SOCKET',
  SET_CONNECTED: 'SET_CONNECTED',
  
  // Selection actions
  SET_CURRENT_TURN: 'SET_CURRENT_TURN',
  SET_TIMER: 'SET_TIMER',
  SET_SELECTION_STATUS: 'SET_SELECTION_STATUS',
  
  // UI actions
  SET_TOAST: 'SET_TOAST',
  CLEAR_TOAST: 'CLEAR_TOAST',
  SET_LOADING: 'SET_LOADING',
  
  // Navigation actions
  NAVIGATE_TO_ROOM: 'NAVIGATE_TO_ROOM'
};
