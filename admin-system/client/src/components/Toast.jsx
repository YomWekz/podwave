/**
 * Toast Notification Component
 * Displays toast messages
 * Matches admin_desktop.html design
 */

import React from 'react';
import './Toast.css';

function Toast({ toasts }) {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return 'ti-circle-check';
      case 'error': return 'ti-alert-circle';
      case 'info': return 'ti-info-circle';
      default: return 'ti-info-circle';
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <i className={`ti ${getIcon(toast.type)}`}></i>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default Toast;
