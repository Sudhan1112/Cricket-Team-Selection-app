import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { socketService } from '../services/socketService.js';
import { UI_CONSTANTS } from '../constants/index.js';

const RoomScreen = () => {
  const { state } = useApp();

  if (!state.room || !state.user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading room...</h2>
      </div>
    );
  }

  const isHost = state.user.id === state.room.hostId;
  const userCount = state.room.users?.length || 0;
  const canStart = userCount >= UI_CONSTANTS.MIN_USERS_TO_START;

  const handleStartSelection = () => {
    if (canStart && !state.isSelectionActive) {
      socketService.startSelection();
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  };

  const roomIdStyle = {
    fontSize: '18px',
    color: '#666',
    marginBottom: '20px'
  };

  const usersGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  };

  const userCardStyle = {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '2px solid #e9ecef'
  };

  const hostUserCardStyle = {
    ...userCardStyle,
    border: '2px solid #667eea',
    background: '#f0f4ff'
  };

  const buttonStyle = {
    width: '100%',
    padding: '15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  };

  const statusStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    color: '#1976d2'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>🏏 Cricket Team Selection</h1>
          <div style={roomIdStyle}>Room ID: <strong>{state.room.id}</strong></div>
          
          <div style={statusStyle}>
            {userCount} player{userCount !== 1 ? 's' : ''} in room
            {isHost && (
              <div>You are the host</div>
            )}
          </div>
        </div>

        <div style={usersGridStyle}>
          {state.room.users.map((user) => (
            <div
              key={user.id}
              style={user.id === state.room.hostId ? hostUserCardStyle : userCardStyle}
            >
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {user.id === state.room.hostId ? '👑 Host' : '👤 Player'}
              </div>
            </div>
          ))}
        </div>

        {isHost && (
          <div>
            {!canStart && (
              <div style={{ textAlign: 'center', marginBottom: '15px', color: '#666' }}>
                Need at least {UI_CONSTANTS.MIN_USERS_TO_START} players to start
              </div>
            )}
            
            <button
              onClick={handleStartSelection}
              style={canStart && !state.isSelectionActive ? buttonStyle : disabledButtonStyle}
              disabled={!canStart || state.isSelectionActive}
            >
              {state.isSelectionActive ? 'Selection in Progress...' : 'Start Selection'}
            </button>
          </div>
        )}

        {!isHost && (
          <div style={{ textAlign: 'center', color: '#666' }}>
            Waiting for host to start the selection...
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomScreen;
