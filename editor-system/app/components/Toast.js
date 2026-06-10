/**
 * Toast Notification Component for Editor Dashboard
 * Matches editor_desktop.html design
 */

'use client';

import styles from './Toast.module.css';

export default function Toast({ toasts }) {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return 'ti-circle-check';
      case 'error': return 'ti-alert-circle';
      case 'info': return 'ti-info-circle';
      default: return 'ti-info-circle';
    }
  };

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <i className={`ti ${getIcon(toast.type)}`}></i>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
