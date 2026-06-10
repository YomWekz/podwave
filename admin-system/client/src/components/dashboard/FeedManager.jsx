/**
 * Feed Manager Panel Component
 * Lists RSS feeds with status, actions
 * Matches admin_desktop.html design
 */

import React from 'react';
import './FeedManager.css';

function FeedManager({ feeds, onRetry, onDelete, onViewAll }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">RSS Feed Manager</span>
        <span className="panel-action" onClick={onViewAll}>View all {feeds.length}</span>
      </div>
      <div className="feed-list">
        {feeds.map((feed) => (
          <div key={feed.id} className="feed-row">
            <div className={`fdot ${feed.status}`}></div>
            <div className="furl" title={feed.url}>{feed.url}</div>
            <span className="ftag">{feed.tag}</span>
            <div className="feps">{feed.eps}</div>
            <div className="fbtns">
              {feed.status === 'fail' ? (
                <button 
                  className="ficon retry" 
                  title="Retry"
                  onClick={() => onRetry(feed.id)}
                >
                  <i className="ti ti-refresh"></i>
                </button>
              ) : (
                <button className="ficon" title="Refresh">
                  <i className="ti ti-refresh"></i>
                </button>
              )}
              <button className="ficon" title="View">
                <i className="ti ti-eye"></i>
              </button>
              <button 
                className="ficon del" 
                title="Remove"
                onClick={() => onDelete(feed)}
              >
                <i className="ti ti-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeedManager;
