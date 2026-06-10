/**
 * Collections Component for Editor Dashboard
 * Matches editor_desktop.html design
 */

'use client';

import styles from './Collections.module.css';

export default function Collections({ items, onEdit, onNew }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Collections</span>
        <span className="panel-action" onClick={onNew}>+ New</span>
      </div>
      <div>
        {items.map((col) => (
          <div key={col.id} className={styles.colItem}>
            <div className={`${styles.colIcon} ${styles[col.iconClass]}`}>
              <i className={`ti ${col.icon}`}></i>
            </div>
            <div className={styles.colInfo}>
              <div className={styles.colTitle}>
                {col.title}
                <span className={`${styles.colStatus} ${styles[col.status]}`}>
                  {col.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className={styles.colMeta}>{col.meta}</div>
            </div>
            <div 
              className={styles.colEdit}
              onClick={() => onEdit(col)}
            >
              <i className="ti ti-edit"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
