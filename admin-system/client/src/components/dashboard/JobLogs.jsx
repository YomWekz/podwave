/**
 * Job Logs Panel Component
 * Shows ingestion job log entries
 * Matches admin_desktop.html design
 */

import React from 'react';
import './JobLogs.css';

function JobLogs({ logs }) {
  const getStatusLabel = (status) => {
    switch (status) {
      case 's': return 'Success';
      case 'e': return 'Error';
      case 'r': return 'Running';
      default: return status;
    }
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Ingestion Job Log</span>
        <span className="panel-action">Last 24 hours</span>
      </div>
      <div className="log-list">
        {logs.map((log) => (
          <div key={log.id} className="log-row">
            <span className={`lstatus ${log.status}`}>{getStatusLabel(log.status)}</span>
            <span className="lname">{log.name}</span>
            <span className="leps">{log.eps}</span>
            <span className="ltime">{log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobLogs;
