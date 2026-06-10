/**
 * Mock User Data for Public System
 * Used when MongoDB is not connected
 */

const profile = {
  id: 'user-1',
  name: 'Jamie Dela Cruz',
  email: 'jamie@example.com',
  initials: 'JD',
  plan: 'Free plan',
  stats: {
    saved: 47,
    listened: 312,
    reviews: 8
  }
};

const savedPodcasts = [
  {
    id: '2',
    name: 'Lex Fridman Podcast',
    meta: 'Science & Technology',
    category: 'Science',
    colorClass: 't2',
    iconClass: 'ti-brain',
    saved: true
  },
  {
    id: '10',
    name: 'How I Built This',
    meta: 'Business · NPR',
    category: 'Business',
    colorClass: 't-a1',
    iconClass: 'ti-building',
    saved: true
  },
  {
    id: '13',
    name: 'Huberman Lab',
    meta: 'Health · Stanford',
    category: 'Health',
    colorClass: 't-a4',
    iconClass: 'ti-activity',
    saved: true
  },
  {
    id: '6',
    name: 'Darknet Diaries',
    meta: 'Technology',
    category: 'Technology',
    colorClass: 't-a3',
    iconClass: 'ti-skull',
    saved: true
  },
  {
    id: '3',
    name: 'Crime Junkie',
    meta: 'True Crime',
    category: 'True Crime',
    colorClass: 't3',
    iconClass: 'ti-flame',
    saved: true
  },
  {
    id: '1',
    name: 'Hard Fork',
    meta: 'Technology · NYT',
    category: 'Technology',
    colorClass: 't1',
    iconClass: 'ti-radio',
    saved: true
  },
  {
    id: '5',
    name: 'The Daily',
    meta: 'News · NYT',
    category: 'News',
    colorClass: 't-a2',
    iconClass: 'ti-news',
    saved: true
  }
];

const listenHistory = [
  {
    episodeId: '101',
    podcastId: '1',
    podcastName: 'Hard Fork',
    episodeTitle: 'The AI Episode — What comes next?',
    progress: 1112,
    totalTime: 3134,
    listenedAt: new Date(Date.now() - 3600000)
  },
  {
    episodeId: '201',
    podcastId: '2',
    podcastName: 'Lex Fridman Podcast',
    episodeTitle: 'Sam Altman: OpenAI CEO on GPT-5 and AGI',
    progress: 4500,
    totalTime: 9258,
    listenedAt: new Date(Date.now() - 86400000)
  }
];

const currentEpisode = {
  episodeId: '101',
  title: 'The AI Episode — What comes next?',
  podcast: 'Hard Fork',
  podcastId: '1',
  currentTime: 1112,
  totalTime: 3134,
  progress: 35,
  playbackRate: 1.0
};

module.exports = {
  profile,
  savedPodcasts,
  listenHistory,
  currentEpisode
};
