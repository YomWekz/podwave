/**
 * KPI Cards Component
 * Dashboard statistics cards
 * Matches admin_desktop.html design
 */

import React from 'react';
import './KPICards.css';

function KPICards({ stats }) {
  return (
    <div className="kpi-grid">
      <div className="kpi">
        <div className="kpi-label">
          <i className="ti ti-microphone"></i>
          Total Podcasts
        </div>
        <div className="kpi-val">{stats.totalPodcasts.toLocaleString()}</div>
        <div className="kpi-change">+12 this week</div>
      </div>
      
      <div className="kpi">
        <div className="kpi-label">
          <i className="ti ti-player-play"></i>
          Total Episodes
        </div>
        <div className="kpi-val">{stats.totalEpisodes.toLocaleString()}</div>
        <div className="kpi-change">+340 this week</div>
      </div>
      
      <div className="kpi">
        <div className="kpi-label">
          <i className="ti ti-alert-triangle"></i>
          Failed Jobs
        </div>
        <div className="kpi-val red">{stats.failedJobs}</div>
        <div className="kpi-change">Needs attention</div>
      </div>
      
      <div className="kpi">
        <div className="kpi-label">
          <i className="ti ti-refresh"></i>
          Active Feeds
        </div>
        <div className="kpi-val green">{stats.activeFeeds}</div>
        <div className="kpi-change">{stats.pendingFeeds} pending · {stats.failedFeeds} failed</div>
      </div>
    </div>
  );
}

export default KPICards;
