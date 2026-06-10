/**
 * Sidebar Component for Editor Dashboard
 * Matches editor_desktop.html design
 */

'use client';

import { navItems } from '../../data/mockData';
import styles from './Sidebar.module.css';

export default function Sidebar({ currentPage, onNavigate, queueCount, highlightsCount }) {
  const getBadgeCount = (badgeType) => {
    if (badgeType === 'queueCount') return queueCount;
    if (badgeType === 'highlightsCount') return highlightsCount;
    return null;
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoWrap}>
        <div className={styles.logo}>pod<span>wave</span></div>
        <div className={styles.logoRole}>Editor panel</div>
      </div>

      {/* Navigation Sections */}
      {navItems.map((section, idx) => (
        <div key={idx} className={styles.navSection}>
          <div className={styles.navLabel}>{section.section}</div>
          {section.items.map((item) => {
            const badgeCount = item.badge ? getBadgeCount(item.badge) : null;
            return (
              <div
                key={item.id}
                className={`${styles.navItem} ${currentPage === item.id ? styles.active : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <i className={`ti ${item.icon}`}></i>
                {item.label}
                {badgeCount !== null && badgeCount > 0 && (
                  <span className={`${styles.navBadge} ${item.badge === 'queueCount' ? styles.purple : styles.amber}`}>
                    {badgeCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* User Profile */}
      <div className={styles.sidebarUser}>
        <div className={styles.userAvatar}>ED</div>
        <div>
          <div className={styles.userName}>Editor</div>
          <div className={styles.userRole}>editor@podwave.io</div>
        </div>
      </div>
    </aside>
  );
}
