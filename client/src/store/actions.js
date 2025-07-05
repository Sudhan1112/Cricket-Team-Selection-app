import { ActionTypes } from './types.js';

// Action creators
export const createActions = (dispatch) => ({
  // User actions
  setUser: (user) => 
    dispatch({ type: ActionTypes.SET_USER, payload: user }),
  
  // Room actions
  setRoom: (room) => 
    dispatch({ type: ActionTypes.SET_ROOM, payload: room }),
  
  updateRoom: (updates) =>
    dispatch({ type: ActionTypes.UPDATE_ROOM, payload: updates }),
  
  // Socket actions
  setSocket: (socket) =>
    dispatch({ type: ActionTypes.SET_SOCKET, payload: socket }),
  
  setConnected: (connected) =>
    dispatch({ type: ActionTypes.SET_CONNECTED, payload: connected }),
  
  // Selection actions
  setCurrentTurn: (turn) =>
    dispatch({ type: ActionTypes.SET_CURRENT_TURN, payload: turn }),
  
  setTimer: (timer) => 
    dispatch({ type: ActionTypes.SET_TIMER, payload: timer }),
  
  setSelectionStatus: (status) =>
    dispatch({ type: ActionTypes.SET_SELECTION_STATUS, payload: status }),
  
  // UI actions
  showToast: (message, type = 'info') =>
    dispatch({
      type: ActionTypes.SET_TOAST,
      payload: { message, type }
    }),
  
  clearToast: () =>
    dispatch({ type: ActionTypes.CLEAR_TOAST }),
  
  setLoading: (loading) =>
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
  
  // Navigation actions
  navigateToRoom: () =>
    dispatch({ type: ActionTypes.NAVIGATE_TO_ROOM })
});
