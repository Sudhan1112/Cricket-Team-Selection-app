import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { UI_CONSTANTS } from '../constants/index.js';

const Toast = () => {
  const { state, actions } = useApp();

  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => {
        actions.clearToast();
      }, UI_CONSTANTS.TOAST_DURATION);

      return () => clearTimeout(timer);
    }
  }, [state.toast, actions]);

  if (!state.toast) return null;

  const { message, type } = state.toast;

  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: 'bold',
      zIndex: 1000,
      maxWidth: '400px',
      wordWrap: 'break-word'
    };

    const typeStyles = {
      success: { backgroundColor: '#10b981' },
      error: { backgroundColor: '#ef4444' },
      info: { backgroundColor: '#3b82f6' },
      warning: { backgroundColor: '#f59e0b' }
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  return (
    <div style={getToastStyles()}>
      {message}
    </div>
  );
};

export default Toast;
