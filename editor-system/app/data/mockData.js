/**
 * Mock Data for PodWave Editor Dashboard
 * This data simulates what would come from Supabase/PostgreSQL
 */

// Podcast review queue
export const mockQueue = [
  { id: 1, title: 'The Knowledge Project', meta: 'Business · 89 eps · ingested 2h ago', artClass: 'qa1', status: 'pending' },
  { id: 2, title: 'Acquired', meta: 'Business · 122 eps · ingested 5h ago', artClass: 'qa2', status: 'review' },
  { id: 3, title: 'My First Million', meta: 'Business · 510 eps · ingested 1d ago', artClass: 'qa3', status: 'pending' },
  { id: 4, title: 'Darknet Diaries', meta: 'Technology · 148 eps · ingested 6h ago', artClass: 'qa4', status: 'pending' },
  { id: 5, title: 'Lex Fridman Podcast', meta: 'Technology · 428 eps · ingested 3h ago', artClass: 'qa2', status: 'pending' },
];

// AI Highlights
export const mockHighlights = [
  { 
    id: 1, 
    title: 'Hard Fork · Ep. 142 — "The model is already smarter than us"', 
    snippet: 'Key segment: speaker discusses AGI timeline — high engagement markers detected', 
    timeRange: '12:14 – 14:48', 
    total: '56:10', 
    clipLeft: '20%', 
    clipWidth: '16%' 
  },
  { 
    id: 2, 
    title: 'Lex Fridman · Ep. 398 — "The nature of consciousness"', 
    snippet: 'Key segment: debate on hard problem of consciousness — sentiment peak detected', 
    timeRange: '41:05 – 42:55', 
    total: '2:18:44', 
    clipLeft: '35%', 
    clipWidth: '12%' 
  },
  { 
    id: 3, 
    title: 'Huberman Lab · Ep. 71 — "Controlling dopamine"', 
    snippet: 'Key segment: protocol for dopamine regulation — listener retention spike', 
    timeRange: '28:00 – 31:10', 
    total: '1:45:22', 
    clipLeft: '27%', 
    clipWidth: '10%' 
  },
];

// Collections
export const mockCollections = [
  { id: 1, title: 'Staff picks — June', meta: '8 podcasts', status: 'published', iconClass: 'c1', icon: 'ti-trending-up' },
  { id: 2, title: 'AI & technology deep dives', meta: '12 podcasts', status: 'published', iconClass: 'c2', icon: 'ti-brain' },
  { id: 3, title: 'True crime essentials', meta: '6 podcasts', status: 'draft', iconClass: 'c3', icon: 'ti-flame' },
  { id: 4, title: 'Best for beginners', meta: '5 podcasts', status: 'draft', iconClass: 'c1', icon: 'ti-heart' },
];

// KPI Stats
export const mockKPIs = {
  pendingReview: 12,
  drafts: 7,
  published: 284,
  highlightsPending: 5,
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
    section: 'Content', 
    items: [
      { id: 'queue', label: 'Review queue', icon: 'ti-clock', badge: 'queueCount' },
      { id: 'highlights', label: 'AI highlights', icon: 'ti-scissors', badge: 'highlightsCount' },
      { id: 'collections', label: 'Collections', icon: 'ti-books' },
      { id: 'episodes', label: 'Episodes', icon: 'ti-microphone' },
      { id: 'published', label: 'Published', icon: 'ti-circle-check' },
    ]
  },
  { 
    section: 'System', 
    items: [
      { id: 'settings', label: 'Settings', icon: 'ti-settings' }
    ]
  },
];

// Page titles
export const pageTitles = {
  dashboard: { title: 'Editorial dashboard', sub: '3 items need your attention' },
  queue: { title: 'Review queue', sub: 'Podcasts waiting for review' },
  highlights: { title: 'AI highlights', sub: 'Generated highlight clips' },
  collections: { title: 'Collections', sub: 'Curated podcast collections' },
  episodes: { title: 'Episodes', sub: 'All ingested episodes' },
  published: { title: 'Published', sub: 'All published podcasts' },
  settings: { title: 'Settings', sub: 'Editor preferences' },
};

// Tags for highlight clips
export const TAGS = ['AI', 'Technology', 'Business', 'Science', 'Health', 'True Crime', 'Finance', 'Interview', 'Deep dive', 'Motivational', 'Educational', 'Must listen'];
