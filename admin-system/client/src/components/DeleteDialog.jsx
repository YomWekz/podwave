/**
 * Delete Confirmation Dialog
 * Modal dialog for confirming feed deletion
 * Matches admin_desktop.html design
 */

import React from 'react';
import './DeleteDialog.css';

function DeleteDialog({ isOpen, feed, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className={`dialog-overlay ${isOpen ? 'open' : ''}`}>
      <div className="dialog">
        <div className="dialog-title">Remove feed?</div>
        <div className="dialog-sub">{feed?.url || 'This cannot be undone.'}</div>
        <div className="dialog-btns">
          <button className="dialog-btn cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="dialog-btn confirm" onClick={onConfirm}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteDialog;
