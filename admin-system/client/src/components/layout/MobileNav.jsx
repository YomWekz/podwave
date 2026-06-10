/**
 * Mobile Navigation Component
 * Bottom navigation for mobile devices
 * Matches admin_mobile.html design
 */

import React from 'react';
import './MobileNav.css';

function MobileNav({ currentPage, onNavigate, failedCount }) {
  return (
    <nav className="bottom-nav">
      <div 
        className={`nav-tab ${currentPage === 'dashboard' ? 'active' : ''}`}
        onClick={() => onNavigate('dashboard')}
      >
        <i className="ti ti-layout-dashboard"></i>
        <span>Home</span>
      </div>
      <div 
        className={`nav-tab ${currentPage === 'rss' ? 'active' : ''}`}
        onClick={() => onNavigate('rss')}
      >
        <i className="ti ti-rss"></i>
        <span>Feeds</span>
      </div>
      <div 
        className={`nav-tab ${currentPage === 'failed' ? 'active' : ''}`}
        onClick={() => onNavigate('failed')}
      >
        <i className="ti ti-alert-triangle"></i>
        <span>Failed</span>
        {failedCount > 0 && (
          <div className="nav-badge">{failedCount}</div>
        )}
      </div>
      <div 
        className={`nav-tab ${currentPage === 'logs' ? 'active' : ''}`}
        onClick={() => onNavigate('logs')}
      >
        <i className="ti ti-list-check"></i>
        <span>Logs</span>
      </div>
      <div 
        className={`nav-tab ${currentPage === 'settings' ? 'active' : ''}`}
        onClick={() => onNavigate('settings')}
      >
        <i className="ti ti-settings"></i>
        <span>More</span>
      </div>
    </nav>
  );
}

export default MobileNav;
