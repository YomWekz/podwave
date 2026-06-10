/**
 * Mobile Navigation Component for Editor Dashboard
 * Matches editor_mobile.html design
 */

'use client';

import styles from './MobileNav.module.css';

export default function MobileNav({ currentPage, onNavigate, queueCount, highlightsCount }) {
  return (
    <nav className={styles.mobileNav}>
      <div 
        className={`${styles.navTab} ${currentPage === 'dashboard' ? styles.active : ''}`}
        onClick={() => onNavigate('dashboard')}
      >
        <i className="ti ti-layout-dashboard"></i>
        <span>Home</span>
      </div>
      <div 
        className={`${styles.navTab} ${currentPage === 'queue' ? styles.active : ''}`}
        onClick={() => onNavigate('queue')}
      >
        <i className="ti ti-clock"></i>
        <span>Queue</span>
        {queueCount > 0 && <div className={styles.navBadge}>{queueCount}</div>}
      </div>
      <div 
        className={`${styles.navTab} ${currentPage === 'highlights' ? styles.active : ''}`}
        onClick={() => onNavigate('highlights')}
      >
        <i className="ti ti-scissors"></i>
        <span>Highlights</span>
      </div>
      <div 
        className={`${styles.navTab} ${currentPage === 'collections' ? styles.active : ''}`}
        onClick={() => onNavigate('collections')}
      >
        <i className="ti ti-books"></i>
        <span>Collections</span>
      </div>
      <div 
        className={`${styles.navTab} ${currentPage === 'settings' ? styles.active : ''}`}
        onClick={() => onNavigate('settings')}
      >
        <i className="ti ti-settings"></i>
        <span>More</span>
      </div>
    </nav>
  );
}
