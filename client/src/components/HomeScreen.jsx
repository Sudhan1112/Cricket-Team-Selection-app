import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { socketService } from '../services/socketService.js';

const HomeScreen = ({ onNavigate }) => {
  const { state, actions } = useApp();
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      actions.showToast('Please enter your name', 'error');
      return;
    }

    actions.setLoading(true);
    
    try {
      // Generate room ID
      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Join the room as host
      socketService.joinRoom(newRoomId, userName.trim());
    } catch (error) {
      console.error('Error creating room:', error);
      actions.showToast('Failed to create room', 'error');
      actions.setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!userName.trim()) {
      actions.showToast('Please enter your name', 'error');
      return;
    }

    if (!roomId.trim()) {
      actions.showToast('Please enter room ID', 'error');
      return;
    }

    actions.setLoading(true);
    
    try {
      socketService.joinRoom(roomId.trim().toUpperCase(), userName.trim());
    } catch (error) {
      console.error('Error joining room:', error);
      actions.showToast('Failed to join room', 'error');
      actions.setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '30px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    marginBottom: '16px',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '12px',
    transition: 'background-color 0.2s'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  };

  const connectionStatus = state.connected ? '🟢 Connected' : '🔴 Disconnected';

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>🏏 Cricket Team Selection</h1>
        
        <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          {connectionStatus}
        </div>

        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={inputStyle}
          disabled={state.loading}
        />

        <button
          onClick={handleCreateRoom}
          style={state.loading ? disabledButtonStyle : buttonStyle}
          disabled={state.loading}
        >
          {state.loading ? 'Creating...' : 'Create Room'}
        </button>

        <div style={{ margin: '20px 0', color: '#666' }}>OR</div>

        <input
          type="text"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          style={inputStyle}
          disabled={state.loading}
        />

        <button
          onClick={handleJoinRoom}
          style={state.loading ? disabledButtonStyle : buttonStyle}
          disabled={state.loading}
        >
          {state.loading ? 'Joining...' : 'Join Room'}
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
