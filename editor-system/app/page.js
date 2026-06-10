/**
 * PodWave Editor Dashboard
 * Next.js + Supabase PostgreSQL
 * 
 * Main Page Component - Client Component with state
 * Matches editor_desktop.html and editor_mobile.html designs
 * 
 * API Integration: Uses real Supabase backend with mock data fallback
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import MobileNav from './components/layout/MobileNav';
import KPICards from './components/dashboard/KPICards';
import ReviewQueue from './components/dashboard/ReviewQueue';
import AIHighlights from './components/dashboard/AIHighlights';
import Collections from './components/dashboard/Collections';
import Toast from './components/Toast';

import { 
  mockQueue, 
  mockHighlights, 
  mockCollections, 
  mockKPIs,
  pageTitles 
} from './data/mockData';

import * as api from './services/api';

// Panel styles (shared)
const panelStyles = {
  panel: {
    background: 'var(--surface)',
    borderRadius: '10px',
    border: '0.5px solid rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  panelHead: {
    padding: '11px 16px',
    borderBottom: '0.5px solid var(--border2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitle: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--text-muted)',
    fontFamily: 'var(--mono)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  },
};

export default function EditorDashboard() {
  // State
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [queue, setQueue] = useState(mockQueue);
  const [highlights, setHighlights] = useState(mockHighlights);
  const [collections, setCollections] = useState(mockCollections);
  const [stats, setStats] = useState(mockKPIs);
  const [toasts, setToasts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking' | 'connected' | 'mock'
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from API on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  /**
   * Fetch initial data from API
   * Falls back to mock data if API fails
   */
  const fetchInitialData = async () => {
    setIsLoading(true);
    
    try {
      // Check database health
      const healthResult = await api.checkDbHealth();
      const isConnected = healthResult.database === 'connected';
      setConnectionStatus(isConnected ? 'connected' : 'mock');
      
      // Fetch stats
      const statsResult = await api.getStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      }
      
      // Fetch review queue
      const queueResult = await api.getReviewQueue(20);
      if (queueResult.success) {
        // Transform API data to match UI format
        const queueData = queueResult.data.map((item, index) => ({
          id: item.id,
          title: item.title,
          meta: item.meta || `${item.category || 'Uncategorized'}`,
          artClass: item.artClass || `qa${(index % 4) + 1}`,
          status: item.status,
        }));
        setQueue(queueData);
      }
      
      // Fetch highlights
      const highlightsResult = await api.getHighlights('pending', 20);
      if (highlightsResult.success) {
        setHighlights(highlightsResult.data);
      }
      
      // Fetch collections
      const collectionsResult = await api.getCollections();
      if (collectionsResult.success) {
        setCollections(collectionsResult.data);
      }
      
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setConnectionStatus('mock');
      showToast('error', 'Using mock data — API unavailable');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Queue actions
  const handleApproveQueue = async (id) => {
    const item = queue.find(q => q.id === id);
    if (item) {
      // Optimistic update
      setQueue(prev => prev.map(q => 
        q.id === id ? { ...q, status: 'approved' } : q
      ));
      const pendingCount = queue.filter(q => q.status === 'pending' || q.status === 'review').length - 1;
      setStats(prev => ({
        ...prev,
        pendingReview: Math.max(0, pendingCount),
        published: prev.published + 1,
      }));
      showToast('success', `"${item.title}" approved & published`);
      
      // Call API if connected
      if (connectionStatus === 'connected') {
        try {
          await api.approvePodcast(id, 'editor', 'Editor');
        } catch (err) {
          console.error('Approve failed:', err);
        }
      }
    }
  };

  const handleRejectQueue = async (id) => {
    const item = queue.find(q => q.id === id);
    if (item) {
      // Optimistic update
      setQueue(prev => prev.map(q => 
        q.id === id ? { ...q, status: 'rejected' } : q
      ));
      const pendingCount = queue.filter(q => q.status === 'pending' || q.status === 'review').length - 1;
      setStats(prev => ({
        ...prev,
        pendingReview: Math.max(0, pendingCount),
      }));
      showToast('error', `"${item.title}" rejected`);
      
      // Call API if connected
      if (connectionStatus === 'connected') {
        try {
          await api.rejectPodcast(id, 'editor', 'Editor');
        } catch (err) {
          console.error('Reject failed:', err);
        }
      }
    }
  };

  const handleEditQueue = (item) => {
    showToast('info', `Editing "${item.title}"…`);
  };

  const handleApproveAllQueue = async () => {
    const pendingCount = queue.filter(q => q.status === 'pending' || q.status === 'review').length;
    
    // Optimistic update
    setQueue(prev => prev.map(q => 
      q.status === 'pending' || q.status === 'review' ? { ...q, status: 'approved' } : q
    ));
    setStats(prev => ({
      ...prev,
      pendingReview: 0,
      published: prev.published + pendingCount,
    }));
    showToast('success', 'All pending items approved');
    
    // Call API if connected
    if (connectionStatus === 'connected') {
      try {
        await api.approveAllPending('editor', 'Editor');
      } catch (err) {
        console.error('Approve all failed:', err);
      }
    }
  };

  // Highlight actions
  const handleAcceptHighlight = async (id) => {
    // Optimistic update
    setHighlights(prev => prev.filter(h => h.id !== id));
    setStats(prev => ({
      ...prev,
      highlightsPending: Math.max(0, prev.highlightsPending - 1),
    }));
    showToast('success', 'Highlight clip accepted');
    
    // Call API if connected
    if (connectionStatus === 'connected') {
      try {
        await api.acceptHighlight(id, 'editor', 'Editor');
      } catch (err) {
        console.error('Accept highlight failed:', err);
      }
    }
  };

  const handleRejectHighlight = async (id) => {
    // Optimistic update
    setHighlights(prev => prev.filter(h => h.id !== id));
    setStats(prev => ({
      ...prev,
      highlightsPending: Math.max(0, prev.highlightsPending - 1),
    }));
    showToast('error', 'Highlight clip rejected');
    
    // Call API if connected
    if (connectionStatus === 'connected') {
      try {
        await api.rejectHighlight(id, 'editor', 'Editor');
      } catch (err) {
        console.error('Reject highlight failed:', err);
      }
    }
  };

  const handleTrimHighlight = (item) => {
    showToast('info', `Trimming "${item.title}"…`);
  };

  const handleTagHighlight = (item) => {
    showToast('info', `Tagging "${item.title}"…`);
  };

  // Collection actions
  const handleEditCollection = (col) => {
    showToast('info', `Editing "${col.title}"…`);
    // TODO: Open edit modal
  };

  const handleNewCollection = async () => {
    showToast('info', 'Creating new collection…');
    
    // Call API if connected
    if (connectionStatus === 'connected') {
      try {
        const result = await api.createCollection({
          name: 'New Collection',
          description: 'Edit this description',
          status: 'draft',
          created_by: 'editor',
        });
        
        if (result.success) {
          // Refresh collections
          const collectionsResult = await api.getCollections();
          if (collectionsResult.success) {
            setCollections(collectionsResult.data);
          }
          showToast('success', 'Collection created');
        }
      } catch (err) {
        console.error('Create collection failed:', err);
      }
    }
  };

  // Get current page title
  const pageTitle = pageTitles[currentPage] || { title: 'Dashboard', sub: '' };

  // Calculate counts
  const queueCount = queue.filter(q => q.status === 'pending' || q.status === 'review').length;
  const highlightsCount = highlights.length;

  return (
    <div style={styles.shell}>
      {/* Sidebar (desktop) */}
      <Sidebar 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        queueCount={queueCount}
        highlightsCount={highlightsCount}
      />

      {/* Main content */}
      <main style={styles.main}>
        <Topbar 
          title={pageTitle.title} 
          subtitle={pageTitle.sub} 
          connectionStatus={connectionStatus} 
        />
        
        <div style={styles.content}>
          {/* Dashboard Page */}
          {currentPage === 'dashboard' && (
            <div style={styles.page}>
              <KPICards stats={stats} />
              
              <ReviewQueue 
                items={queue.slice(0, 3)}
                onApprove={handleApproveQueue}
                onReject={handleRejectQueue}
                onEdit={handleEditQueue}
                onViewAll={() => handleNavigate('queue')}
              />

              <div style={styles.twoCol}>
                <AIHighlights 
                  items={highlights.slice(0, 2)}
                  onAccept={handleAcceptHighlight}
                  onReject={handleRejectHighlight}
                  onTrim={handleTrimHighlight}
                  onTag={handleTagHighlight}
                  onViewAll={() => handleNavigate('highlights')}
                />
                <Collections 
                  items={collections}
                  onEdit={handleEditCollection}
                  onNew={handleNewCollection}
                />
              </div>
            </div>
          )}

          {/* Queue Page */}
          {currentPage === 'queue' && (
            <div style={styles.page}>
              <div style={panelStyles.panel}>
                <div style={panelStyles.panelHead}>
                  <span style={panelStyles.panelTitle}>Review queue</span>
                  <span style={styles.panelAction} onClick={handleApproveAllQueue}>
                    Approve all pending
                  </span>
                </div>
                <ReviewQueue 
                  items={queue}
                  onApprove={handleApproveQueue}
                  onReject={handleRejectQueue}
                  onEdit={handleEditQueue}
                  onViewAll={() => {}}
                  showViewAll={false}
                />
              </div>
            </div>
          )}

          {/* Highlights Page */}
          {currentPage === 'highlights' && (
            <div style={styles.page}>
              <div style={panelStyles.panel}>
                <div style={panelStyles.panelHead}>
                  <span style={panelStyles.panelTitle}>AI highlight clips</span>
                  <span style={styles.panelActionSub}>Generated by AI</span>
                </div>
                <AIHighlights 
                  items={highlights}
                  onAccept={handleAcceptHighlight}
                  onReject={handleRejectHighlight}
                  onTrim={handleTrimHighlight}
                  onTag={handleTagHighlight}
                  onViewAll={() => {}}
                  showViewAll={false}
                />
              </div>
            </div>
          )}

          {/* Collections Page */}
          {currentPage === 'collections' && (
            <div style={styles.page}>
              <div style={panelStyles.panel}>
                <div style={panelStyles.panelHead}>
                  <span style={panelStyles.panelTitle}>Collections</span>
                  <span style={styles.panelAction} onClick={handleNewCollection}>
                    + New collection
                  </span>
                </div>
                <Collections 
                  items={collections}
                  onEdit={handleEditCollection}
                  onNew={handleNewCollection}
                />
              </div>
            </div>
          )}

          {/* Placeholder Pages */}
          {currentPage === 'episodes' && (
            <div style={styles.placeholderPage}>
              <i className="ti ti-microphone" style={styles.placeholderIcon}></i>
              <h3 style={styles.placeholderTitle}>Episodes</h3>
              <p style={styles.placeholderText}>Browse all ingested episodes — coming soon</p>
            </div>
          )}

          {currentPage === 'published' && (
            <div style={styles.placeholderPage}>
              <i className="ti ti-circle-check" style={styles.placeholderIcon}></i>
              <h3 style={styles.placeholderTitle}>Published</h3>
              <p style={styles.placeholderText}>All published podcasts — coming soon</p>
            </div>
          )}

          {currentPage === 'settings' && (
            <div style={styles.placeholderPage}>
              <i className="ti ti-settings" style={styles.placeholderIcon}></i>
              <h3 style={styles.placeholderTitle}>Settings</h3>
              <p style={styles.placeholderText}>Editor preferences — coming soon</p>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        queueCount={queueCount}
        highlightsCount={highlightsCount}
      />

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
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '14px',
  },
  panelAction: {
    fontSize: '11px',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontFamily: 'var(--mono)',
  },
  panelActionSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--mono)',
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
