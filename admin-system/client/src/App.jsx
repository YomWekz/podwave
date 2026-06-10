/**
 * PodWave Admin Dashboard
 * React + Vite Frontend
 * 
 * Phase 7: Connected to real backend API with mock fallback
 * Matches admin_desktop.html and admin_mobile.html designs
 */

import { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import MobileNav from './components/layout/MobileNav';
import KPICards from './components/dashboard/KPICards';
import FeedManager from './components/dashboard/FeedManager';
import AddFeedPanel from './components/dashboard/AddFeedPanel';
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
  mockKPIs,
  categories 
} from './data/mockData';

import { pageTitles } from './data/pageConfig';
import * as api from './services/api';

export default function App() {
  // State
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [feeds, setFeeds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [failedJobs, setFailedJobs] = useState([]);
  const [stats, setStats] = useState({
    activeFeeds: 0,
    pendingFeeds: 0,
    failedFeeds: 0,
    failedJobs: 0,
    totalEpisodes: 0,
    successRate: 0
  });
  const [toasts, setToasts] = useState([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [feedToDelete, setFeedToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Toast helper
  const showToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Fetch all data from backend
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    // Fetch feeds
    try {
      const feedsRes = await api.getFeeds();
      if (feedsRes.success) {
        setFeeds(feedsRes.data.map(f => ({
          id: f.id,
          url: f.rss_url || f.url,
          tag: f.category,
          status: f.status === 'active' ? 'ok' : f.status === 'failed' ? 'err' : 'pend',
          eps: f.status === 'active' ? 'synced' : 'pending',
          lastSync: f.last_sync_at ? new Date(f.last_sync_at).toLocaleString() : 'Never'
        })));
        setIsUsingMockData(feedsRes.mock || false);
      }
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
      setFeeds(mockFeeds);
      setIsUsingMockData(true);
    }
    
    // Fetch job logs
    try {
      const logsRes = await api.getJobLogs();
      if (logsRes.success) {
        setLogs(logsRes.data.map(j => ({
          id: j.id,
          status: j.status === 'success' ? 's' : j.status === 'error' ? 'e' : 'r',
          name: j.rss_url || `Feed #${j.feed_id}`,
          eps: j.message || j.status,
          time: j.created_at ? new Date(j.created_at).toLocaleString() : 'N/A'
        })));
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs(mockLogs);
    }
    
    // Fetch failed jobs
    try {
      const failedRes = await api.getFailedJobs();
      if (failedRes.success) {
        setFailedJobs(failedRes.data.map(j => ({
          id: j.id,
          feedId: j.feed_id,
          feed: j.rss_url || `Feed #${j.feed_id}`,
          error: j.error_message || 'Unknown error',
          retries: j.retry_count || 0,
          time: j.created_at ? new Date(j.created_at).toLocaleString() : 'N/A'
        })));
      }
    } catch (error) {
      console.error('Failed to fetch failed jobs:', error);
      setFailedJobs(mockFailedJobs);
    }
    
    // Fetch stats
    try {
      const statsRes = await api.getStats();
      if (statsRes.success) {
        const data = statsRes.data;
        setStats({
          activeFeeds: data.feeds?.active || 0,
          pendingFeeds: data.feeds?.total - data.feeds?.active || 0,
          failedFeeds: data.feeds?.failed || 0,
          failedJobs: data.jobs?.failed || 0,
          totalEpisodes: data.episodes?.total || 0,
          successRate: data.jobs?.successRate || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats(mockKPIs);
    }
    
    setIsLoading(false);
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigation handler
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // Add feed handler
  const handleAddFeed = async (newFeed) => {
    try {
      const result = await api.addFeed(newFeed.url, newFeed.tag);
      
      if (result.success) {
        showToast('success', 'Feed added successfully');
        fetchData(); // Refresh data
      } else {
        showToast('error', result.error || 'Failed to add feed');
      }
    } catch (error) {
      showToast('error', 'Failed to add feed');
    }
  };

  // Sync feed handler
  const handleSyncFeed = async (feedId) => {
    showToast('info', 'Starting sync...');
    
    try {
      const result = await api.syncFeed(feedId);
      
      if (result.success) {
        showToast('success', 'Sync job started');
        // Refresh after a short delay to show updated status
        setTimeout(fetchData, 1000);
      } else {
        showToast('error', result.error || 'Failed to start sync');
      }
    } catch (error) {
      showToast('error', 'Failed to start sync');
    }
  };

  // Delete feed handlers
  const handleDeleteClick = (feed) => {
    setFeedToDelete(feed);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!feedToDelete) return;
    
    try {
      const result = await api.deleteFeed(feedToDelete.id);
      
      if (result.success) {
        showToast('success', 'Feed deleted');
        fetchData(); // Refresh data
      } else {
        showToast('error', result.error || 'Failed to delete feed');
      }
    } catch (error) {
      showToast('error', 'Failed to delete feed');
    }
    
    setShowDeleteDialog(false);
    setFeedToDelete(null);
  };

  // Retry job handler
  const handleRetryJob = async (jobId) => {
    try {
      const result = await api.retryJob(jobId);
      
      if (result.success) {
        showToast('success', 'Job retry initiated');
        fetchData(); // Refresh data
      } else {
        showToast('error', result.error || 'Failed to retry job');
      }
    } catch (error) {
      showToast('error', 'Failed to retry job');
    }
  };

  // Retry all failed jobs
  const handleRetryAllFailed = async () => {
    showToast('info', 'Retrying all failed jobs...');
    
    let successCount = 0;
    for (const job of failedJobs) {
      try {
        const result = await api.retryJob(job.id);
        if (result.success) successCount++;
      } catch (error) {
        console.error('Retry failed for job', job.id);
      }
    }
    
    showToast('success', `Retried ${successCount} jobs`);
    fetchData(); // Refresh data
  };

  // Get current page title
  const pageTitle = pageTitles[currentPage] || { title: 'Dashboard', sub: '' };

  // Calculate counts
  const failedCount = failedJobs.length;

  return (
    <div style={styles.shell}>
      {/* Sidebar (desktop) */}
      <Sidebar 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        failedCount={failedCount}
      />

      {/* Main content */}
      <main style={styles.main}>
        <Topbar 
          title={pageTitle.title} 
          subtitle={pageTitle.sub}
          isUsingMockData={isUsingMockData}
          isLoading={isLoading}
        />
        
        <div style={styles.content}>
          {/* Dashboard Page */}
          {currentPage === 'dashboard' && (
            <div style={styles.page}>
              <KPICards stats={stats} />
              
              <div style={styles.twoCol}>
                <FeedManager 
                  feeds={feeds.slice(0, 4)}
                  onAddNew={() => setShowAddPanel(true)}
                  onSync={handleSyncFeed}
                  onDelete={handleDeleteClick}
                  onViewAll={() => handleNavigate('rss')}
                />
                <JobLogs 
                  logs={logs.slice(0, 4)}
                  onViewAll={() => handleNavigate('logs')}
                />
              </div>
            </div>
          )}

          {/* RSS Feeds Page */}
          {currentPage === 'rss' && (
            <div style={styles.page}>
              <FeedManager 
                feeds={feeds}
                onAddNew={() => setShowAddPanel(true)}
                onSync={handleSyncFeed}
                onDelete={handleDeleteClick}
                onViewAll={() => {}}
                showViewAll={false}
              />
            </div>
          )}

          {/* Job Logs Page */}
          {currentPage === 'logs' && (
            <div style={styles.page}>
              <JobLogs 
                logs={logs}
                onViewAll={() => {}}
                showViewAll={false}
              />
            </div>
          )}

          {/* Failed Jobs Page */}
          {currentPage === 'failed' && (
            <div style={styles.page}>
              <FailedJobs 
                jobs={failedJobs}
                onRetry={handleRetryJob}
                onRetryAll={handleRetryAllFailed}
              />
            </div>
          )}

          {/* Raw Data Page */}
          {currentPage === 'raw' && (
            <div style={styles.page}>
              <RawDataViewer data={mockRawData} />
            </div>
          )}

          {/* Stats Page */}
          {currentPage === 'stats' && (
            <div style={styles.placeholderPage}>
              <i className="ti ti-chart-bar" style={styles.placeholderIcon}></i>
              <h3 style={styles.placeholderTitle}>Sync Statistics</h3>
              <p style={styles.placeholderText}>Charts and performance metrics — coming soon</p>
            </div>
          )}

          {/* Settings Page */}
          {currentPage === 'settings' && (
            <div style={styles.placeholderPage}>
              <i className="ti ti-settings" style={styles.placeholderIcon}></i>
              <h3 style={styles.placeholderTitle}>Settings</h3>
              <p style={styles.placeholderText}>System configuration — coming soon</p>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        failedCount={failedCount}
      />

      {/* Add Feed Panel */}
      {showAddPanel && (
        <AddFeedPanel 
          categories={categories}
          onAdd={handleAddFeed}
          onClose={() => setShowAddPanel(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <DeleteDialog 
          feed={feedToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteDialog(false);
            setFeedToDelete(null);
          }}
        />
      )}

      {/* Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}

// Styles
const styles = {
  shell: {
    display: 'flex',
    height: '100vh',
    background: 'var(--bg)',
    maxWidth: '1400px',
    margin: '0 auto',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  content: {
    flex: 1,
    padding: '20px 24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    animation: 'pgIn 0.18s ease',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  placeholderPage: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    gap: '10px',
    padding: '60px 24px',
    textAlign: 'center',
    minHeight: '400px',
  },
  placeholderIcon: {
    fontSize: '36px',
    opacity: 0.3,
  },
  placeholderTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.4)',
  },
  placeholderText: {
    fontSize: '12px',
    color: 'var(--text-dim)',
    fontFamily: 'var(--mono)',
  },
};
