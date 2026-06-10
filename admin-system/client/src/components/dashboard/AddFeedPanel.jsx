/**
 * Add Feed Panel Component
 * Form to add new RSS feeds
 * Matches admin_desktop.html design
 */

import React, { useState } from 'react';
import { categories } from '../../data/mockData';
import './AddFeedPanel.css';

function AddFeedPanel({ onAddFeed }) {
  const [feedUrl, setFeedUrl] = useState('');
  const [category, setCategory] = useState('Tech');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!feedUrl.trim()) {
      setError(true);
      setTimeout(() => setError(false), 1200);
      return;
    }
    
    // Clean URL (remove protocol for display)
    const cleanUrl = feedUrl.replace(/^https?:\/\//, '');
    
    onAddFeed({
      url: cleanUrl,
      tag: category,
      status: 'pend',
      eps: '—'
    });
    
    setFeedUrl('');
    setError(false);
  };

  return (
    <div className="add-panel">
      <div className="add-panel-label">Add RSS Feed</div>
      <div className="add-row">
        <input
          className={`add-input ${error ? 'error' : ''}`}
          placeholder="Paste RSS feed URL — e.g. https://feeds.simplecast.com/abc123"
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <select
          className="add-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button className="add-btn" onClick={handleSubmit}>
          <i className="ti ti-plus"></i>
          Add Feed
        </button>
      </div>
    </div>
  );
}

export default AddFeedPanel;
