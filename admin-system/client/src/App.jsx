/**
 * PodWave Admin Dashboard
 * React + Vite + Express + MySQL
 * 
 * Main App Component
 * Matches admin_desktop.html and admin_mobile.html designs
 */

import React, { useState, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import MobileNav from './components/layout/MobileNav';
import KPICards from './components/dashboard/KPICards';
import AddFeedPanel from './components/dashboard/AddFeedPanel';
import FeedManager from './components/dashboard/FeedManager';
import JobLogs from './components/dashboard/JobLogs';
import FailedJobs from './components/dashboard/FailedJobs';
import RawDataViewer from './components/dashboard/RawDataViewer';
import Toast from './components/Toast';
import DeleteDialog from './components/DeleteDialog';

import { 
  mockFeeds, 
  mockLogs, 
  mockFailedJobs, 
  mockRawData, 
  mockKPIs 
} from './data/mockData';
import { pageTitles } from './data/pageConfig';

import './App.css';

function App() {
  // State
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [feeds, setFeeds] = useState(mockFeeds);
  const [logs, setLogs] = useState(mockLogs);
  const [failedJobs, setFailedJobs] = useState(mockFailedJobs);
  const [stats, setStats] = useState(mockKPIs);
  const [toasts, setToasts] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, feed: null });
  const [nextId, setNextId] = useState(100);

  // Toast helper
  const showToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Navigation handler
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // Add feed handler
  const handleAddFeed = (newFeed) => {
    const feed = { ...newFeed, id: nextId };
    setNextId(prev => prev + 1);
    setFeeds(prev => [feed, ...prev]);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      pendingFeeds: prev.pendingFeeds + 1
    }));
    
    // Add log entry
    setLogs(prev => [
      { 
        id: Date.now(), 
        status: 'r', 
        name: `${feed.url} — initial fetch`, 
        eps: 'fetching...', 
        time: 'just now' 
      },
      ...prev
    ]);
    
    showToast('info', `Feed added: ${feed.url}`);
  };

  // Retry feed handler
  const handleRetryFeed = (feedId) => {
    showToast('info', 'Retrying feed…');
    
    setTimeout(() => {
      setFeeds(prev => prev.map(f => 
        f.id === feedId ? { ...f, status: 'ok', eps: '310 eps' } : f
      ));
      
      setStats(prev => ({
        ...prev,
        failedFeeds: Math.max(0, prev.failedFeeds - 1)
      }));
      
      showToast('success', 'Feed synced successfully');
    }, 2200);
  };

  // Delete feed handlers
  const handleDeleteClick = (feed) => {
    setDeleteDialog({ isOpen: true, feed });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.feed) {
      setFeeds(prev => prev.filter(f => f.id !== deleteDialog.feed.id));
      setStats(prev => ({
        ...prev,
        activeFeeds: prev.activeFeeds - 1
      }));
      showToast('success', 'Feed removed');
    }
    setDeleteDialog({ isOpen: false, feed: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, feed: null });
  };

  // Retry failed job handler
  const handleRetryJob = (jobId) => {
    setFailedJobs(prev => prev.filter(j => j.id !== jobId));
    setStats(prev => ({
      ...prev,
      failedJobs: Math.max(0, prev.failedJobs - 1)
    }));
    showToast('success', 'Job retried successfully');
  };

  // Retry all failed jobs
  const handleRetryAllJobs = () => {
    setFailedJobs([]);
    setStats(prev => ({
      ...prev,
      failedJobs: 0
    }));
    showToast('success', 'All failed jobs retried');
  };

  // Get current page title
  const pageTitle = pageTitles[currentPage] || { title: 'Dashboard', sub: '' };

  return (
    <div className="app-shell">
      {/* Sidebar (desktop only) */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        failedCount={stats.failedJobs}
      />

      {/* Main content area */}
      <main className="main-content">
        <Topbar title={pageTitle.title} subtitle={pageTitle.sub} />
        
        <div className="content">
          {/* Dashboard Page */}
          {currentPage === 'dashboard' && (
            <div className="page active">
              <KPICards stats={stats} />
              <AddFeedPanel onAddFeed={handleAddFeed} />
              
              <div className="two-col">
                <FeedManager 
                  feeds={feeds.slice(0, 4)} 
                  onRetry={handleRetryFeed}
                  onDelete={handleDeleteClick}
                  onViewAll={() => handleNavigate('rss')}
                />
                <JobLogs logs={logs.slice(0, 5)} />
              </div>
            </div>
          )}

          {/* RSS Feeds Page */}
          {currentPage === 'rss' && (
            <div className="page active">
              <AddFeedPanel onAddFeed={handleAddFeed} />
              <FeedManager 
                feeds={feeds} 
                onRetry={handleRetryFeed}
                onDelete={handleDeleteClick}
                onViewAll={() => {}}
              />
            </div>
          )}

          {/* Job Logs Page */}
          {currentPage === 'logs' && (
            <div className="page active">
              <JobLogs logs={logs} />
            </div>
          )}

          {/* Failed Jobs Page */}
          {currentPage === 'failed' && (
            <div className="page active">
              <FailedJobs 
                jobs={failedJobs} 
                onRetry={handleRetryJob}
                onRetryAll={handleRetryAllJobs}
              />
            </div>
          )}

          {/* Raw Data Page */}
          {currentPage === 'raw' && (
            <div className="page active">
              <RawDataViewer data={mockRawData} />
            </div>
          )}

          {/* Sync Stats Page */}
          {currentPage === 'stats' && (
            <div className="page active">
              <div className="panel">
                <div className="panel-head">
                  <span className="panel-title">Sync Statistics</span>
                </div>
                <div className="placeholder-page">
                  <i className="ti ti-chart-bar"></i>
                  <h3>Sync Stats</h3>
                  <p>Charts and sync history — coming soon</p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Page */}
          {currentPage === 'settings' && (
            <div className="page active">
              <div className="panel">
                <div className="panel-head">
                  <span className="panel-title">Settings</span>
                </div>
                <div className="placeholder-page">
                  <i className="ti ti-settings"></i>
                  <h3>Settings</h3>
                  <p>System configuration — coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        failedCount={stats.failedJobs}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog 
        isOpen={deleteDialog.isOpen}
        feed={deleteDialog.feed}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default App;
