import { ActionTypes } from './types.js';

// Initial state
export const initialState = {
  user: null,
  room: null,
  socket: null,
  currentTurn: null,
  timer: 0,
  isSelectionActive: false,
  toast: null,
  loading: false,
  connected: false,
  shouldNavigateToRoom: false
};

// App reducer
export function appReducer(state, action) {
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
      
    case ActionTypes.NAVIGATE_TO_ROOM:
      return { ...state, shouldNavigateToRoom: true };
      
    default:
      return state;
  }
}
