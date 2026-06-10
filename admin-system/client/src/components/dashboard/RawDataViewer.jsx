/**
 * Raw Data Viewer Component
 * Placeholder for raw podcast data viewer
 * Matches admin_desktop.html design
 */

import React from 'react';
import './RawDataViewer.css';

function RawDataViewer({ data }) {
  return (
    <div className="raw-data-container">
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Raw Data Viewer</span>
          <span className="panel-action">Export JSON</span>
        </div>
        <div className="raw-data-content">
          <div className="placeholder-page">
            <i className="ti ti-database"></i>
            <h3>Raw Data Viewer</h3>
            <p>Browse raw podcast & episode JSON data — coming soon</p>
          </div>
          
          {/* Sample raw data preview */}
          <div className="raw-preview">
            <div className="raw-preview-label">Sample Raw Podcast Data:</div>
            <pre className="raw-json">
{JSON.stringify(data[0], null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RawDataViewer;
