/**
 * Topbar Component
 * Top navigation bar for Admin Dashboard
 * Matches admin_desktop.html design
 */

import React from 'react';
import './Topbar.css';

function Topbar({ title, subtitle, isUsingMockData, isLoading }) {
  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-sub">{subtitle}</div>
      </div>
      <div>
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
      </div>
    </header>
  );
}

export default Topbar;
