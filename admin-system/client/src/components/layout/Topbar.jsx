/**
 * Topbar Component
 * Top navigation bar for Admin Dashboard
 * Matches admin_desktop.html design
 */

import React from 'react';
import './Topbar.css';

function Topbar({ title, subtitle, isUsingMockData, isLoading, onLogout }) {
  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-sub">{subtitle}</div>
      </div>
      <div className="topbar-actions">
        {isLoading ? (
          <div className="sync-badge loading">
            <div className="sync-dot spinning"></div>
            Loading...
          </div>
        ) : isUsingMockData ? (
          <div className="sync-badge warning">
            <div className="sync-dot warning"></div>
            Using mock data
          </div>
        ) : (
          <div className="sync-badge">
            <div className="sync-dot"></div>
            Connected to database
          </div>
        )}
        <button className="logout-button" type="button" onClick={onLogout}>
          <i className="ti ti-logout"></i>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;
