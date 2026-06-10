/**
 * Topbar Component
 * Top navigation bar for Admin Dashboard
 * Matches admin_desktop.html design
 */

import React from 'react';
import './Topbar.css';

function Topbar({ title, subtitle }) {
  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-sub">{subtitle}</div>
      </div>
      <div>
        <div className="sync-badge">
          <div className="sync-dot"></div>
          All systems operational
        </div>
      </div>
    </header>
  );
}

export default Topbar;
