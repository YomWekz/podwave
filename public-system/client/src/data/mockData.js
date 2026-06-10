/**
 * PodWave Public System - Mock Data
 * Contains sample podcasts, episodes, and categories for the public discover interface
 */

// Category colors for browse cards
export const categoryColors = {
  Technology: { bg: '#185FA5', gradient: 'linear-gradient(135deg,#185FA5,#0a3a6e)', icon: 'ti-cpu', count: 1240 },
  Business: { bg: '#854F0B', gradient: 'linear-gradient(135deg,#854F0B,#4a2c06)', icon: 'ti-briefcase', count: 980 },
  'True Crime': { bg: '#993C1D', gradient: 'linear-gradient(135deg,#993C1D,#5a2210)', icon: 'ti-shield', count: 760 },
  Science: { bg: '#0F6E56', gradient: 'linear-gradient(135deg,#0F6E56,#073d30)', icon: 'ti-flask', count: 850 },
  Health: { bg: '#534AB7', gradient: 'linear-gradient(135deg,#534AB7,#2e286e)', icon: 'ti-heart', count: 620 },
  Education: { bg: '#3B6D11', gradient: 'linear-gradient(135deg,#3B6D11,#1e3a08)', icon: 'ti-school', count: 540 },
  Comedy: { bg: '#993356', gradient: 'linear-gradient(135deg,#993356,#5a1e33)', icon: 'ti-mood-smile', count: 430 },
  News: { bg: '#5F5E5A', gradient: 'linear-gradient(135deg,#5F5E5A,#2c2c2a)', icon: 'ti-news', count: 700 },
  Society: { bg: '#1D9E75', gradient: 'linear-gradient(135deg,#1D9E75,#0a5a42)', icon: 'ti-users', count: 390 },
  Arts: { bg: '#6B3FA0', gradient: 'linear-gradient(135deg,#6B3FA0,#3d2260)', icon: 'ti-palette', count: 310 },
  Economics: { bg: '#0F6E56', gradient: 'linear-gradient(135deg,#0F6E56,#073d30)', icon: 'ti-coin', count: 420 },
};

// Theme color classes mapping
export const themeColors = {
  t1: '#1D9E75',
  t2: '#534AB7',
  t3: '#993C1D',
  't-a1': '#185FA5',
  't-a2': '#854F0B',
  't-a3': '#3C3489',
  't-a4': '#0F6E56',
  't-a5': '#5F5E5A',
  't-a6': '#993356',
  't-a7': '#3B6D11',
};

// Featured podcasts for the home page
export const featuredPodcasts = [
  {
    id: 1,
    name: 'Hard Fork',
    meta: 'Technology · 142 eps',
    category: 'Technology',
    colorClass: 't1',
    icon: 'ti-radio',
    featured: true,
  },
  {
    id: 2,
    name: 'Lex Fridman',
    meta: 'Science · 420 eps',
    category: 'Science',
    colorClass: 't2',
    icon: 'ti-brain',
    featured: false,
  },
  {
    id: 3,
    name: 'Crime Junkie',
    meta: 'True Crime · 310 eps',
    category: 'True Crime',
    colorClass: 't3',
    icon: 'ti-flame',
    featured: false,
  },
  {
    id: 4,
    name: 'Planet Money',
    meta: 'Economics · NPR',
    category: 'Economics',
    colorClass: 't-a4',
    icon: 'ti-coin',
    featured: false,
  },
  {
    id: 5,
    name: 'The Daily',
    meta: 'News · NYT',
    category: 'News',
    colorClass: 't-a2',
    icon: 'ti-news',
    featured: false,
  },
  {
    id: 6,
    name: 'Darknet Diaries',
    meta: 'Technology · Indie',
    category: 'Technology',
    colorClass: 't-a3',
    icon: 'ti-skull',
    featured: false,
  },
];

// Trending podcasts for the home page
export const trendingPodcasts = [
  {
    id: 10,
    rank: 1,
    name: 'How I Built This',
    meta: 'Business · NPR',
    category: 'Business',
    colorClass: 't-a1',
    icon: 'ti-building',
  },
  {
    id: 11,
    rank: 2,
    name: 'The Daily',
    meta: 'News · NYT',
    category: 'News',
    colorClass: 't-a2',
    icon: 'ti-news',
  },
  {
    id: 12,
    rank: 3,
    name: 'Darknet Diaries',
    meta: 'Technology · Independent',
    category: 'Technology',
    colorClass: 't-a3',
    icon: 'ti-skull',
  },
  {
    id: 13,
    rank: 4,
    name: 'Huberman Lab',
    meta: 'Health · Stanford',
    category: 'Health',
    colorClass: 't-a4',
    icon: 'ti-activity',
  },
  {
    id: 14,
    rank: 5,
    name: "Conan O'Brien Needs a Friend",
    meta: 'Comedy · Independent',
    category: 'Comedy',
    colorClass: 't2',
    icon: 'ti-mood-smile',
  },
  {
    id: 15,
    rank: 6,
    name: 'Hard Fork',
    meta: 'Technology · NYT',
    category: 'Technology',
    colorClass: 't1',
    icon: 'ti-radio',
  },
];

// All podcasts for search and filtering
export const allPodcasts = [
  ...featuredPodcasts,
  ...trendingPodcasts,
  {
    id: 20,
    name: 'Lex Fridman Podcast',
    meta: 'Science & Technology',
    category: 'Science',
    colorClass: 't2',
    icon: 'ti-brain',
    saved: true,
    episodes: 420,
  },
  {
    id: 21,
    name: 'How I Built This',
    meta: 'Business · NPR',
    category: 'Business',
    colorClass: 't-a1',
    icon: 'ti-building',
    saved: true,
    episodes: 212,
  },
  {
    id: 22,
    name: 'Huberman Lab',
    meta: 'Health · Stanford',
    category: 'Health',
    colorClass: 't-a4',
    icon: 'ti-activity',
    saved: true,
    episodes: 198,
  },
  {
    id: 23,
    name: 'Darknet Diaries',
    meta: 'Technology · Independent',
    category: 'Technology',
    colorClass: 't-a3',
    icon: 'ti-skull',
    saved: true,
    episodes: 155,
  },
  {
    id: 24,
    name: 'Crime Junkie',
    meta: 'True Crime',
    category: 'True Crime',
    colorClass: 't3',
    icon: 'ti-flame',
    saved: true,
    episodes: 310,
  },
  {
    id: 25,
    name: 'Hard Fork',
    meta: 'Technology · NYT',
    category: 'Technology',
    colorClass: 't1',
    icon: 'ti-radio',
    saved: true,
    episodes: 142,
  },
];

// Saved podcasts (subset)
export const savedPodcasts = allPodcasts.filter(p => p.saved);

// Sidebar library items
export const sidebarLibrary = [
  { name: 'Lex Fridman Podcast', meta: 'Science & Technology', colorClass: 't2' },
  { name: 'How I Built This', meta: 'Business · NPR', colorClass: 't-a1' },
  { name: 'Huberman Lab', meta: 'Health & Science', colorClass: 't-a4' },
  { name: 'Darknet Diaries', meta: 'Technology', colorClass: 't-a3' },
  { name: 'Hard Fork', meta: 'Technology · NYT', colorClass: 't1' },
  { name: 'Crime Junkie', meta: 'True Crime', colorClass: 't3' },
  { name: 'The Daily', meta: 'News · NYT', colorClass: 't-a2' },
];

// Trending searches
export const trendingSearches = [
  'Lex Fridman',
  'True Crime',
  'AI Podcast',
  'The Daily',
  'Business Tips',
  'Huberman',
];

// Category list
export const categories = [
  'All',
  'Technology',
  'Business',
  'True Crime',
  'Science',
  'Health',
  'Comedy',
  'News',
  'Education',
  'Society',
  'Arts',
];

// User profile data
export const userProfile = {
  name: 'Jamie Dela Cruz',
  email: 'jamie@example.com',
  initials: 'JD',
  plan: 'Free plan',
  stats: {
    saved: 47,
    listened: 312,
    reviews: 8,
  },
};

// Current episode playing
export const currentEpisode = {
  title: 'The AI Episode — What comes next?',
  podcast: 'Hard Fork',
  currentTime: 1112, // seconds
  totalTime: 3134, // seconds
  progress: 35, // percentage
};

// Podcast details with episodes
export const podcastDetails = {
  'Hard Fork': {
    id: 1,
    name: 'Hard Fork',
    creator: 'The New York Times',
    category: 'Technology',
    tags: ['Technology', 'AI', 'Startups', 'Culture'],
    description: 'A podcast from The New York Times hosted by Kevin Roose and Casey Newton. They decode the rapidly changing world of technology, from AI to social media to crypto. Every week, they break down the biggest tech stories and what they mean for you.',
    colorClass: 't1',
    icon: 'ti-radio',
    rating: 4.8,
    reviewCount: 2847,
    episodeCount: 142,
    episodes: [
      { id: 101, title: 'The AI Episode — What comes next?', duration: '52:14', date: 'Jun 8, 2026', description: 'Kevin and Casey discuss the latest developments in AI and what they mean for the future of work and creativity.' },
      { id: 102, title: 'Big Tech\'s Antitrust Moment', duration: '48:32', date: 'Jun 1, 2026', description: 'The government is coming for Big Tech. What does it mean for the industry?' },
      { id: 103, title: 'The Rise of Virtual Influencers', duration: '45:18', date: 'May 25, 2026', description: 'AI-generated influencers are taking over social media. Are real influencers in trouble?' },
      { id: 104, title: 'Inside Apple\'s Vision Pro', duration: '51:45', date: 'May 18, 2026', description: 'We spent a week with Apple\'s spatial computer. Here\'s what we think.' },
      { id: 105, title: 'The Twitter Files Revisited', duration: '47:22', date: 'May 11, 2026', description: 'A year later, what did the Twitter Files actually reveal?' },
    ],
  },
  'Lex Fridman': {
    id: 2,
    name: 'Lex Fridman Podcast',
    creator: 'Lex Fridman',
    category: 'Science',
    tags: ['Science', 'Technology', 'AI', 'Philosophy'],
    description: 'Conversations about the nature of intelligence, consciousness, love, and power. Lex Fridman interviews scientists, engineers, philosophers, and artists from around the world.',
    colorClass: 't2',
    icon: 'ti-brain',
    rating: 4.9,
    reviewCount: 15234,
    episodeCount: 420,
    episodes: [
      { id: 201, title: 'Sam Altman: OpenAI CEO on GPT-5 and AGI', duration: '2:34:18', date: 'Jun 5, 2026', description: 'A wide-ranging conversation about the future of AI and humanity.' },
      { id: 202, title: 'Elon Musk: Mars, Tesla, and the Future', duration: '3:12:45', date: 'May 28, 2026', description: 'Elon Musk discusses his vision for humanity\'s multi-planetary future.' },
      { id: 203, title: 'Andrew Huberman: The Science of Focus', duration: '2:45:32', date: 'May 20, 2026', description: 'How to optimize your brain for peak performance and focus.' },
      { id: 204, title: 'Yann LeCun: The Future of AI', duration: '2:18:22', date: 'May 12, 2026', description: 'Meta\'s chief AI scientist on where AI is headed next.' },
    ],
  },
  'Crime Junkie': {
    id: 3,
    name: 'Crime Junkie',
    creator: 'Audiochuck',
    category: 'True Crime',
    tags: ['True Crime', 'Mystery', 'Investigative'],
    description: 'If you can never get enough true crime... You\'re a Crime Junkie. Hosted by Ashley Flowers and Brit Prawat, Crime Junkie tells compelling stories of murder, missing persons, and mysteries.',
    colorClass: 't3',
    icon: 'ti-flame',
    rating: 4.7,
    reviewCount: 8942,
    episodeCount: 310,
    episodes: [
      { id: 301, title: 'MURDERED: Jane Doe', duration: '42:15', date: 'Jun 7, 2026', description: 'An unidentified woman found in 1985. Who was she?' },
      { id: 302, title: 'MISSING: The Disappearance', duration: '38:42', date: 'Jun 3, 2026', description: 'A family\'s desperate search for answers.' },
      { id: 303, title: 'SOLVED: Cold Case Justice', duration: '45:18', date: 'May 27, 2026', description: 'After 30 years, a breakthrough in a cold case.' },
    ],
  },
  'How I Built This': {
    id: 10,
    name: 'How I Built This',
    creator: 'NPR',
    category: 'Business',
    tags: ['Business', 'Entrepreneurship', 'Startups'],
    description: 'Guy Raz dives into the stories behind some of the world\'s best known companies. How I Built This weaves a narrative journey about innovators, entrepreneurs and idealists—and the movements they built.',
    colorClass: 't-a1',
    icon: 'ti-building',
    rating: 4.8,
    reviewCount: 6723,
    episodeCount: 212,
    episodes: [
      { id: 401, title: 'Airbnb: Brian Chesky', duration: '58:32', date: 'Jun 6, 2026', description: 'How a couple of air mattresses became a billion-dollar company.' },
      { id: 402, title: 'Stripe: Patrick Collison', duration: '52:18', date: 'May 30, 2026', description: 'Two brothers from Ireland build the payments infrastructure of the internet.' },
      { id: 403, title: 'Spotify: Daniel Ek', duration: '55:45', date: 'May 23, 2026', description: 'How a Swedish startup changed how the world listens to music.' },
    ],
  },
  'The Daily': {
    id: 5,
    name: 'The Daily',
    creator: 'The New York Times',
    category: 'News',
    tags: ['News', 'Politics', 'Current Events'],
    description: 'This is what the news should sound like. Twenty minutes a day, five days a week, hosted by Michael Barbaro and Sabrina Tavernise. The biggest stories of our time, told by the best journalists in the world.',
    colorClass: 't-a2',
    icon: 'ti-news',
    rating: 4.6,
    reviewCount: 12847,
    episodeCount: 1560,
    episodes: [
      { id: 501, title: 'The Supreme Court\'s Landmark Decision', duration: '22:15', date: 'Jun 9, 2026', description: 'Breaking down today\'s historic ruling.' },
      { id: 502, title: 'Inside the Climate Negotiations', duration: '24:32', date: 'Jun 8, 2026', description: 'What really happens behind closed doors at climate summits.' },
      { id: 503, title: 'The Economy\'s Next Chapter', duration: '21:45', date: 'Jun 7, 2026', description: 'What the latest jobs report tells us about the economy.' },
    ],
  },
  'Darknet Diaries': {
    id: 6,
    name: 'Darknet Diaries',
    creator: 'Jack Rhysider',
    category: 'Technology',
    tags: ['Technology', 'Cybersecurity', 'Hacking', 'True Crime'],
    description: 'True stories from the dark side of the internet. Darknet Diaries is a podcast about hackers, breaches, shadow government activity, hacktivism, cybercrime, and all the things that dwell on the hidden parts of the network.',
    colorClass: 't-a3',
    icon: 'ti-skull',
    rating: 4.9,
    reviewCount: 9823,
    episodeCount: 155,
    episodes: [
      { id: 601, title: 'The Hospital Hack', duration: '47:32', date: 'Jun 4, 2026', description: 'When ransomware shuts down a hospital, lives are at stake.' },
      { id: 602, title: 'Operation: Trapdoor', duration: '52:18', date: 'May 28, 2026', description: 'How the FBI caught one of the most elusive hackers.' },
      { id: 603, title: 'The Cryptocurrency Heist', duration: '48:45', date: 'May 21, 2026', description: 'A $500 million theft that shocked the crypto world.' },
    ],
  },
  'Huberman Lab': {
    id: 13,
    name: 'Huberman Lab',
    creator: 'Dr. Andrew Huberman',
    category: 'Health',
    tags: ['Health', 'Science', 'Neuroscience', 'Wellness'],
    description: 'Andrew Huberman, a neuroscientist at Stanford University, discusses neuroscience: how our brain and its connections with the organs of our body control our behaviors and health.',
    colorClass: 't-a4',
    icon: 'ti-activity',
    rating: 4.9,
    reviewCount: 18234,
    episodeCount: 198,
    episodes: [
      { id: 701, title: 'The Science of Sleep', duration: '1:45:32', date: 'Jun 5, 2026', description: 'How to optimize your sleep for better health and performance.' },
      { id: 702, title: 'Dopamine: The Molecule of Motivation', duration: '1:32:18', date: 'May 29, 2026', description: 'Understanding the science behind motivation and reward.' },
      { id: 703, title: 'Cold Exposure Benefits', duration: '1:28:45', date: 'May 22, 2026', description: 'The science-backed benefits of deliberate cold exposure.' },
    ],
  },
  'Planet Money': {
    id: 4,
    name: 'Planet Money',
    creator: 'NPR',
    category: 'Economics',
    tags: ['Economics', 'Business', 'Finance'],
    description: 'The economy explained. Imagine you could call up a friend and say, "Meet me at the bar and tell me what\'s going on with the economy." Now imagine that\'s actually a fun evening.',
    colorClass: 't-a4',
    icon: 'ti-coin',
    rating: 4.7,
    reviewCount: 7823,
    episodeCount: 890,
    episodes: [
      { id: 801, title: 'The Inflation Puzzle', duration: '24:15', date: 'Jun 8, 2026', description: 'Why economists got inflation so wrong.' },
      { id: 802, title: 'The Billion Dollar Button', duration: '22:32', date: 'Jun 5, 2026', description: 'A small design change that made billions.' },
      { id: 803, title: 'The Economics of Dating Apps', duration: '26:45', date: 'May 29, 2026', description: 'How dating apps changed the market for love.' },
    ],
  },
  "Conan O'Brien Needs a Friend": {
    id: 14,
    name: "Conan O'Brien Needs a Friend",
    creator: 'Team Coco',
    category: 'Comedy',
    tags: ['Comedy', 'Entertainment', 'Interviews'],
    description: 'Conan O\'Brien needs a friend. We all do. Each week Conan sits down with a famous or interesting person for a long-form interview that usually ends up being funny.',
    colorClass: 't2',
    icon: 'ti-mood-smile',
    rating: 4.8,
    reviewCount: 12456,
    episodeCount: 380,
    episodes: [
      { id: 901, title: 'Tom Hanks Needs a Friend', duration: '1:22:15', date: 'Jun 6, 2026', description: 'Conan catches up with his old friend Tom Hanks.' },
      { id: 902, title: 'Stephen Colbert Needs a Friend', duration: '1:18:32', date: 'May 30, 2026', description: 'Two late night legends catch up.' },
    ],
  },
};

// Get podcast detail by name
export function getPodcastDetail(name) {
  return podcastDetails[name] || podcastDetails['Hard Fork'];
}
