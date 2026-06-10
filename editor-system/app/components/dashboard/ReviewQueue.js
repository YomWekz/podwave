/**
 * Review Queue Component for Editor Dashboard
 * Matches editor_desktop.html design
 */

'use client';

import styles from './ReviewQueue.module.css';

export default function ReviewQueue({ items, onApprove, onReject, onEdit, onViewAll, showViewAll = true }) {
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'review': return 'In review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Podcast review queue</span>
        {showViewAll && (
          <span className={styles.panelAction} onClick={onViewAll}>
            View all {items.length}
          </span>
        )}
      </div>
      <div className={styles.queueList}>
        {items.map((item) => (
          <div key={item.id} className={styles.qrow}>
            <div className={`${styles.qart} ${styles[item.artClass]}`}></div>
            <div className={styles.qinfo}>
              <div className={styles.qtitle}>{item.title}</div>
              <div className={styles.qmeta}>{item.meta}</div>
            </div>
            <span className={`${styles.qstatus} ${styles[item.status]}`}>
              {getStatusLabel(item.status)}
            </span>
            <div className={styles.qbtns}>
              {item.status !== 'approved' && item.status !== 'rejected' && (
                <>
                  <button 
                    className={`${styles.qbtn} ${styles.approve}`}
                    onClick={() => onApprove(item.id)}
                  >
                    <i className="ti ti-check"></i> Approve
                  </button>
                  <button 
                    className={`${styles.qbtn} ${styles.reject}`}
                    onClick={() => onReject(item.id)}
                  >
                    <i className="ti ti-x"></i> Reject
                  </button>
                </>
              )}
              <button 
                className={styles.qbtn}
                onClick={() => onEdit(item)}
              >
                <i className="ti ti-edit"></i> Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
