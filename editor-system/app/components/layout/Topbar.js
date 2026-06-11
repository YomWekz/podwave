/**
 * Topbar Component for Editor Dashboard
 * Matches editor_desktop.html design
 */

'use client';

import { useState } from 'react';
import styles from './Topbar.module.css';

export default function Topbar({ title, subtitle, connectionStatus, onLogout }) {
  const [showNotif, setShowNotif] = useState(false);
  
  // Connection status indicator
  const getConnectionIndicator = () => {
    switch (connectionStatus) {
      case 'connected':
        return <span className={styles.connected}>Connected to Supabase</span>;
      case 'mock':
        return <span className={styles.mockMode}>Using mock data</span>;
      default:
        return <span className={styles.checking}>Checking connection…</span>;
    }
  };

  return (
    <header className={styles.topbar}>
      <div>
        <div className={styles.topbarTitle}>{title}</div>
        <div className={styles.topbarSub}>
          {subtitle}
          {getConnectionIndicator()}
        </div>
      </div>
      <div className={styles.topbarActions}>
        <button className={styles.logoutBtn} type="button" onClick={onLogout}>
          <i className="ti ti-logout"></i>
          Logout
        </button>

        <div className={styles.notifWrap}>
        <div 
          className={styles.notifBtn}
          onClick={() => setShowNotif(!showNotif)}
        >
          <i className="ti ti-bell"></i>
          Notifications
          <div className={styles.notifDot}></div>
        </div>
        
        {showNotif && (
          <div className={styles.notifPanel}>
            <div className={styles.notifHead}>Notifications</div>
            <div className={styles.notifItem}>
              <div className={styles.notifDot2}></div>
              <div>
                <div className={styles.notifText}>12 podcasts pending review in queue</div>
                <div className={styles.notifTime}>just now</div>
              </div>
            </div>
            <div className={styles.notifItem}>
              <div className={styles.notifDot2}></div>
              <div>
                <div className={styles.notifText}>5 AI highlights awaiting your approval</div>
                <div className={styles.notifTime}>4 min ago</div>
              </div>
            </div>
            <div className={styles.notifItem}>
              <div className={styles.notifDot2}></div>
              <div>
                <div className={styles.notifText}>Hard Fork sync completed — 142 eps</div>
                <div className={styles.notifTime}>8 min ago</div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </header>
  );
}
