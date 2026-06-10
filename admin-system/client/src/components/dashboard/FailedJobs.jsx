/**
 * Failed Jobs Panel Component
 * Lists failed ingestion jobs with retry option
 * Matches admin_desktop.html design
 */

import React, { useState } from 'react';
import './FailedJobs.css';

function FailedJobs({ jobs, onRetry, onRetryAll }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleRetry = (id) => {
    setLoadingId(id);
    // Simulate loading
    setTimeout(() => {
      onRetry(id);
      setLoadingId(null);
    }, 1800);
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Failed Jobs</span>
        {jobs.length > 0 && (
          <span className="panel-action" onClick={onRetryAll}>Retry All</span>
        )}
      </div>
      <div className="failed-list">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-circle-check"></i>
            <p>No failed jobs 🎉</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="failed-row">
              <div className="failed-icon">
                <i className="ti ti-alert-triangle"></i>
              </div>
              <div className="failed-info">
                <div className="failed-name">{job.name}</div>
                <div className="failed-reason">{job.reason}</div>
                <div className="failed-meta">{job.meta}</div>
              </div>
              <button 
                className={`retry-btn ${loadingId === job.id ? 'loading' : ''}`}
                onClick={() => handleRetry(job.id)}
                disabled={loadingId === job.id}
              >
                <i className="ti ti-refresh"></i>
                {loadingId === job.id ? 'Retrying…' : 'Retry'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FailedJobs;
