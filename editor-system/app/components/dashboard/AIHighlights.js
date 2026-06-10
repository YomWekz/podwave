/**
 * AI Highlights Component for Editor Dashboard
 * Matches editor_desktop.html design
 */

'use client';

import styles from './AIHighlights.module.css';

export default function AIHighlights({ items, onAccept, onReject, onTrim, onTag, onViewAll, showViewAll = true }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">AI highlight clips — awaiting review</span>
        {showViewAll && (
          <span className="panel-action" onClick={onViewAll}>
            View all {items.length}
          </span>
        )}
      </div>
      <div>
        {items.map((item) => (
          <div key={item.id} className={styles.hlItem}>
            <div className={styles.hlRow}>
              <div className={styles.hlIcon}>
                <i className="ti ti-sparkles"></i>
              </div>
              <div className={styles.hlContent}>
                <div className={styles.hlTitle}>{item.title}</div>
                <div className={styles.hlSnippet}>{item.snippet}</div>
                <div className={styles.hlBar}>
                  <div 
                    className={styles.hlClip}
                    style={{ left: item.clipLeft, width: item.clipWidth }}
                  ></div>
                </div>
                <div className={styles.hlTimes}>
                  <span>0:00</span>
                  <span>{item.timeRange}</span>
                  <span>{item.total}</span>
                </div>
                <div className={styles.hlBtns}>
                  <button 
                    className={`${styles.btn} ${styles.accept}`}
                    onClick={() => onAccept(item.id)}
                  >
                    <i className="ti ti-check"></i> Accept
                  </button>
                  <button 
                    className={`${styles.btn} ${styles.reject}`}
                    onClick={() => onReject(item.id)}
                  >
                    <i className="ti ti-x"></i> Reject
                  </button>
                  <button 
                    className={styles.btn}
                    onClick={() => onTrim(item)}
                  >
                    <i className="ti ti-adjustments-horizontal"></i> Trim
                  </button>
                  <button 
                    className={styles.btn}
                    onClick={() => onTag(item)}
                  >
                    <i className="ti ti-tag"></i> Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
