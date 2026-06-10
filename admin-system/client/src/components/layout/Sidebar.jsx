/**
 * Sidebar Component
 * Left navigation sidebar for Admin Dashboard
 * Matches admin_desktop.html design
 */

import React from 'react';
import { navItems } from '../../data/mockData';
import './Sidebar.css';

function Sidebar({ currentPage, onNavigate, failedCount }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo-wrap">
        <div className="logo">pod<span>wave</span></div>
        <div className="logo-role">Admin panel</div>
      </div>

      {/* Navigation Sections */}
      {navItems.map((section, idx) => (
        <div key={idx} className="nav-section">
          <div className="nav-label">{section.section}</div>
          {section.items.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <i className={`ti ${item.icon}`}></i>
              {item.label}
              {item.badge === 'failedCount' && failedCount > 0 && (
                <span className="nav-badge">{failedCount}</span>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* User Profile */}
      <div className="sidebar-user">
        <div className="user-avatar">AD</div>
        <div>
          <div className="user-name">Admin</div>
          <div className="user-email">admin@podwave.io</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
