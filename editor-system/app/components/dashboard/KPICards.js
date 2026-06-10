/**
 * KPI Cards Component for Editor Dashboard
 * Matches editor_desktop.html design
 */

'use client';

import styles from './KPICards.module.css';

export default function KPICards({ stats }) {
  return (
    <div className={styles.kpiGrid}>
      <div className={styles.kpi}>
        <div className={styles.kpiLabel}>Pending review</div>
        <div className={`${styles.kpiVal} ${styles.amber}`}>{stats.pendingReview}</div>
        <div className={styles.kpiChange}>+3 since yesterday</div>
      </div>
      
      <div className={styles.kpi}>
        <div className={styles.kpiLabel}>Drafts</div>
        <div className={`${styles.kpiVal} ${styles.purple}`}>{stats.drafts}</div>
        <div className={styles.kpiChange}>2 ready to publish</div>
      </div>
      
      <div className={styles.kpi}>
        <div className={styles.kpiLabel}>Published</div>
        <div className={`${styles.kpiVal} ${styles.green}`}>{stats.published.toLocaleString()}</div>
        <div className={styles.kpiChange}>+6 this week</div>
      </div>
      
      <div className={styles.kpi}>
        <div className={styles.kpiLabel}>Highlights pending</div>
        <div className={`${styles.kpiVal} ${styles.amber}`}>{stats.highlightsPending}</div>
        <div className={styles.kpiChange}>AI generated</div>
      </div>
    </div>
  );
}
