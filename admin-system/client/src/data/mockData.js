/**
 * Mock Data for PodWave Admin Dashboard
 * This data simulates what would come from the backend API
 */

// RSS Feeds data
export const mockFeeds = [
  { id: 1, url: 'feeds.simplecast.com/54nAGcIl', tag: 'Tech', eps: '142 eps', status: 'ok' },
  { id: 2, url: 'rss.art19.com/crime-junkie', tag: 'Crime', eps: '310 eps', status: 'fail' },
  { id: 3, url: 'anchor.fm/s/huberman-lab/rss', tag: 'Health', eps: '—', status: 'pend' },
  { id: 4, url: 'feeds.megaphone.fm/the-daily', tag: 'News', eps: '1,203 eps', status: 'ok' },
  { id: 5, url: 'pod.link/lex-fridman', tag: 'Tech', eps: '428 eps', status: 'ok' },
  { id: 6, url: 'feeds.acquired.fm/rss', tag: 'Business', eps: '—', status: 'fail' },
];

// Ingestion job logs
export const mockLogs = [
  { id: 1, status: 's', name: 'Hard Fork — full sync', eps: '142 eps ingested', time: '4 min ago' },
  { id: 2, status: 'r', name: 'Huberman Lab — initial fetch', eps: 'fetching...', time: 'just now' },
  { id: 3, status: 'e', name: 'Crime Junkie — feed timeout', eps: '0 eps ingested', time: '2h ago' },
  { id: 4, status: 's', name: 'The Daily — incremental sync', eps: '3 new eps', time: '1h ago' },
  { id: 5, status: 'e', name: 'Acquired — SSL cert invalid', eps: '0 eps ingested', time: '3h ago' },
  { id: 6, status: 's', name: 'Lex Fridman — full sync', eps: '428 eps ingested', time: '5h ago' },
];

// Failed jobs
export const mockFailedJobs = [
  { 
    id: 1, 
    name: 'Crime Junkie', 
    reason: 'ERR: feed timeout after 30s', 
    meta: 'rss.art19.com/crime-junkie · Failed 2h ago · 3 retries' 
  },
  { 
    id: 2, 
    name: 'Acquired Podcast', 
    reason: 'ERR: SSL certificate invalid', 
    meta: 'feeds.acquired.fm/rss · Failed 3h ago · 1 retry' 
  },
  { 
    id: 3, 
    name: 'Darknet Diaries', 
    reason: 'ERR: HTTP 404 not found', 
    meta: 'feeds.darknetdiaries.com/rss · Failed 5h ago · 0 retries' 
  },
];

// Raw podcast data sample
export const mockRawData = [
  {
    id: 1,
    title: 'Hard Fork',
    description: 'A show about the rapidly changing world of technology',
    author: 'The New York Times',
    category: 'Tech',
    episodeCount: 142,
    feedUrl: 'feeds.simplecast.com/54nAGcIl',
    lastSync: '2026-06-01T12:00:00Z',
    status: 'active'
  },
  {
    id: 2,
    title: 'The Daily',
    description: 'This is what the news should sound like',
    author: 'The New York Times',
    category: 'News',
    episodeCount: 1203,
    feedUrl: 'feeds.megaphone.fm/the-daily',
    lastSync: '2026-06-01T11:30:00Z',
    status: 'active'
  },
];

// Categories for the dropdown
export const categories = [
  'Tech',
  'Business',
  'Crime',
  'Science',
  'Health',
  'Comedy',
  'News',
];

// KPI Stats
export const mockKPIs = {
  totalPodcasts: 1284,
  totalEpisodes: 48920,
  failedJobs: 3,
  activeFeeds: 24,
  pendingFeeds: 3,
  failedFeeds: 3,
};

// Navigation items
export const navItems = [
  { 
    section: 'Overview', 
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' }
    ]
  },
  { 
    section: 'Feeds & Jobs', 
    items: [
      { id: 'rss', label: 'RSS Feeds', icon: 'ti-rss' },
      { id: 'logs', label: 'Job Logs', icon: 'ti-list-check' },
      { id: 'failed', label: 'Failed Jobs', icon: 'ti-alert-triangle', badge: 'failedCount' }
    ]
  },
  { 
    section: 'Data', 
    items: [
      { id: 'raw', label: 'Raw Data', icon: 'ti-database' },
      { id: 'stats', label: 'Sync Stats', icon: 'ti-chart-bar' }
    ]
  },
  { 
    section: 'System', 
    items: [
      { id: 'settings', label: 'Settings', icon: 'ti-settings' }
    ]
  },
];
