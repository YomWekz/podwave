/**
 * Mock Podcast Data for Public System
 * Used when MongoDB is not connected
 */

const allPodcasts = [
  {
    id: '1',
    name: 'Hard Fork',
    meta: 'Technology · 142 eps',
    category: 'Technology',
    colorClass: 't1',
    iconClass: 'ti-radio',
    saved: false,
    episodes: 142
  },
  {
    id: '2',
    name: 'Lex Fridman Podcast',
    meta: 'Science · 420 eps',
    category: 'Science',
    colorClass: 't2',
    iconClass: 'ti-brain',
    saved: false,
    episodes: 420
  },
  {
    id: '3',
    name: 'Crime Junkie',
    meta: 'True Crime · 310 eps',
    category: 'True Crime',
    colorClass: 't3',
    iconClass: 'ti-flame',
    saved: false,
    episodes: 310
  },
  {
    id: '4',
    name: 'Planet Money',
    meta: 'Economics · NPR',
    category: 'Economics',
    colorClass: 't-a4',
    iconClass: 'ti-coin',
    saved: false,
    episodes: 890
  },
  {
    id: '5',
    name: 'The Daily',
    meta: 'News · NYT',
    category: 'News',
    colorClass: 't-a2',
    iconClass: 'ti-news',
    saved: false,
    episodes: 1560
  },
  {
    id: '6',
    name: 'Darknet Diaries',
    meta: 'Technology · Indie',
    category: 'Technology',
    colorClass: 't-a3',
    iconClass: 'ti-skull',
    saved: false,
    episodes: 155
  },
  {
    id: '10',
    name: 'How I Built This',
    meta: 'Business · NPR',
    category: 'Business',
    colorClass: 't-a1',
    iconClass: 'ti-building',
    saved: true,
    episodes: 212
  },
  {
    id: '13',
    name: 'Huberman Lab',
    meta: 'Health · Stanford',
    category: 'Health',
    colorClass: 't-a4',
    iconClass: 'ti-activity',
    saved: true,
    episodes: 198
  },
  {
    id: '14',
    name: "Conan O'Brien Needs a Friend",
    meta: 'Comedy · Independent',
    category: 'Comedy',
    colorClass: 't2',
    iconClass: 'ti-mood-smile',
    saved: false,
    episodes: 380
  }
];

const featured = [
  {
    id: '1',
    name: 'Hard Fork',
    meta: 'Technology · 142 eps',
    category: 'Technology',
    colorClass: 't1',
    iconClass: 'ti-radio',
    featured: true
  },
  {
    id: '2',
    name: 'Lex Fridman',
    meta: 'Science · 420 eps',
    category: 'Science',
    colorClass: 't2',
    iconClass: 'ti-brain',
    featured: false
  },
  {
    id: '3',
    name: 'Crime Junkie',
    meta: 'True Crime · 310 eps',
    category: 'True Crime',
    colorClass: 't3',
    iconClass: 'ti-flame',
    featured: false
  }
];

const trending = [
  {
    id: '10',
    rank: 1,
    name: 'How I Built This',
    meta: 'Business · NPR',
    category: 'Business',
    colorClass: 't-a1',
    iconClass: 'ti-building'
  },
  {
    id: '5',
    rank: 2,
    name: 'The Daily',
    meta: 'News · NYT',
    category: 'News',
    colorClass: 't-a2',
    iconClass: 'ti-news'
  },
  {
    id: '6',
    rank: 3,
    name: 'Darknet Diaries',
    meta: 'Technology · Independent',
    category: 'Technology',
    colorClass: 't-a3',
    iconClass: 'ti-skull'
  },
  {
    id: '13',
    rank: 4,
    name: 'Huberman Lab',
    meta: 'Health · Stanford',
    category: 'Health',
    colorClass: 't-a4',
    iconClass: 'ti-activity'
  },
  {
    id: '14',
    rank: 5,
    name: "Conan O'Brien Needs a Friend",
    meta: 'Comedy · Independent',
    category: 'Comedy',
    colorClass: 't2',
    iconClass: 'ti-mood-smile'
  },
  {
    id: '1',
    rank: 6,
    name: 'Hard Fork',
    meta: 'Technology · NYT',
    category: 'Technology',
    colorClass: 't1',
    iconClass: 'ti-radio'
  }
];

const categories = [
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
  'Arts'
];

const trendingSearches = [
  'Lex Fridman',
  'True Crime',
  'AI Podcast',
  'The Daily',
  'Business Tips',
  'Huberman'
];

const details = {
  'Hard Fork': {
    id: '1',
    name: 'Hard Fork',
    creator: 'The New York Times',
    category: 'Technology',
    tags: ['Technology', 'AI', 'Startups', 'Culture'],
    description: 'A podcast from The New York Times hosted by Kevin Roose and Casey Newton. They decode the rapidly changing world of technology, from AI to social media to crypto. Every week, they break down the biggest tech stories and what they mean for you.',
    colorClass: 't1',
    iconClass: 'ti-radio',
    rating: 4.8,
    reviewCount: 2847,
    episodeCount: 142,
    episodes: [
      { id: '101', title: 'The AI Episode — What comes next?', duration: '52:14', date: 'Jun 8, 2026', description: 'Kevin and Casey discuss the latest developments in AI and what they mean for the future of work and creativity.' },
      { id: '102', title: "Big Tech's Antitrust Moment", duration: '48:32', date: 'Jun 1, 2026', description: "The government is coming for Big Tech. What does it mean for the industry?" },
      { id: '103', title: 'The Rise of Virtual Influencers', duration: '45:18', date: 'May 25, 2026', description: 'AI-generated influencers are taking over social media. Are real influencers in trouble?' },
      { id: '104', title: "Inside Apple's Vision Pro", duration: '51:45', date: 'May 18, 2026', description: "We spent a week with Apple's spatial computer. Here's what we think." },
      { id: '105', title: 'The Twitter Files Revisited', duration: '47:22', date: 'May 11, 2026', description: 'A year later, what did the Twitter Files actually reveal?' }
    ]
  },
  'Lex Fridman Podcast': {
    id: '2',
    name: 'Lex Fridman Podcast',
    creator: 'Lex Fridman',
    category: 'Science',
    tags: ['Science', 'Technology', 'AI', 'Philosophy'],
    description: 'Conversations about the nature of intelligence, consciousness, love, and power. Lex Fridman interviews scientists, engineers, philosophers, and artists from around the world.',
    colorClass: 't2',
    iconClass: 'ti-brain',
    rating: 4.9,
    reviewCount: 15234,
    episodeCount: 420,
    episodes: [
      { id: '201', title: 'Sam Altman: OpenAI CEO on GPT-5 and AGI', duration: '2:34:18', date: 'Jun 5, 2026', description: 'A wide-ranging conversation about the future of AI and humanity.' },
      { id: '202', title: 'Elon Musk: Mars, Tesla, and the Future', duration: '3:12:45', date: 'May 28, 2026', description: "Elon Musk discusses his vision for humanity's multi-planetary future." },
      { id: '203', title: 'Andrew Huberman: The Science of Focus', duration: '2:45:32', date: 'May 20, 2026', description: 'How to optimize your brain for peak performance and focus.' },
      { id: '204', title: 'Yann LeCun: The Future of AI', duration: '2:18:22', date: 'May 12, 2026', description: "Meta's chief AI scientist on where AI is headed next." }
    ]
  },
  'Crime Junkie': {
    id: '3',
    name: 'Crime Junkie',
    creator: 'Audiochuck',
    category: 'True Crime',
    tags: ['True Crime', 'Mystery', 'Investigative'],
    description: "If you can never get enough true crime... You're a Crime Junkie. Hosted by Ashley Flowers and Brit Prawat, Crime Junkie tells compelling stories of murder, missing persons, and mysteries.",
    colorClass: 't3',
    iconClass: 'ti-flame',
    rating: 4.7,
    reviewCount: 8942,
    episodeCount: 310,
    episodes: [
      { id: '301', title: 'MURDERED: Jane Doe', duration: '42:15', date: 'Jun 7, 2026', description: 'An unidentified woman found in 1985. Who was she?' },
      { id: '302', title: 'MISSING: The Disappearance', duration: '38:42', date: 'Jun 3, 2026', description: "A family's desperate search for answers." },
      { id: '303', title: 'SOLVED: Cold Case Justice', duration: '45:18', date: 'May 27, 2026', description: 'After 30 years, a breakthrough in a cold case.' }
    ]
  },
  'How I Built This': {
    id: '10',
    name: 'How I Built This',
    creator: 'NPR',
    category: 'Business',
    tags: ['Business', 'Entrepreneurship', 'Startups'],
    description: "Guy Raz dives into the stories behind some of the world's best known companies. How I Built This weaves a narrative journey about innovators, entrepreneurs and idealists—and the movements they built.",
    colorClass: 't-a1',
    iconClass: 'ti-building',
    rating: 4.8,
    reviewCount: 6723,
    episodeCount: 212,
    episodes: [
      { id: '401', title: 'Airbnb: Brian Chesky', duration: '58:32', date: 'Jun 6, 2026', description: 'How a couple of air mattresses became a billion-dollar company.' },
      { id: '402', title: 'Stripe: Patrick Collison', duration: '52:18', date: 'May 30, 2026', description: 'Two brothers from Ireland build the payments infrastructure of the internet.' },
      { id: '403', title: 'Spotify: Daniel Ek', duration: '55:45', date: 'May 23, 2026', description: 'How a Swedish startup changed how the world listens to music.' }
    ]
  },
  'The Daily': {
    id: '5',
    name: 'The Daily',
    creator: 'The New York Times',
    category: 'News',
    tags: ['News', 'Politics', 'Current Events'],
    description: "This is what the news should sound like. Twenty minutes a day, five days a week, hosted by Michael Barbaro and Sabrina Tavernise. The biggest stories of our time, told by the best journalists in the world.",
    colorClass: 't-a2',
    iconClass: 'ti-news',
    rating: 4.6,
    reviewCount: 12847,
    episodeCount: 1560,
    episodes: [
      { id: '501', title: "The Supreme Court's Landmark Decision", duration: '22:15', date: 'Jun 9, 2026', description: "Breaking down today's historic ruling." },
      { id: '502', title: 'Inside the Climate Negotiations', duration: '24:32', date: 'Jun 8, 2026', description: 'What really happens behind closed doors at climate summits.' },
      { id: '503', title: "The Economy's Next Chapter", duration: '21:45', date: 'Jun 7, 2026', description: 'What the latest jobs report tells us about the economy.' }
    ]
  },
  'Darknet Diaries': {
    id: '6',
    name: 'Darknet Diaries',
    creator: 'Jack Rhysider',
    category: 'Technology',
    tags: ['Technology', 'Cybersecurity', 'Hacking', 'True Crime'],
    description: 'True stories from the dark side of the internet. Darknet Diaries is a podcast about hackers, breaches, shadow government activity, hacktivism, cybercrime, and all the things that dwell on the hidden parts of the network.',
    colorClass: 't-a3',
    iconClass: 'ti-skull',
    rating: 4.9,
    reviewCount: 9823,
    episodeCount: 155,
    episodes: [
      { id: '601', title: 'The Hospital Hack', duration: '47:32', date: 'Jun 4, 2026', description: 'When ransomware shuts down a hospital, lives are at stake.' },
      { id: '602', title: 'Operation: Trapdoor', duration: '52:18', date: 'May 28, 2026', description: 'How the FBI caught one of the most elusive hackers.' },
      { id: '603', title: 'The Cryptocurrency Heist', duration: '48:45', date: 'May 21, 2026', description: 'A $500 million theft that shocked the crypto world.' }
    ]
  },
  'Huberman Lab': {
    id: '13',
    name: 'Huberman Lab',
    creator: 'Dr. Andrew Huberman',
    category: 'Health',
    tags: ['Health', 'Science', 'Neuroscience', 'Wellness'],
    description: 'Andrew Huberman, a neuroscientist at Stanford University, discusses neuroscience: how our brain and its connections with the organs of our body control our behaviors and health.',
    colorClass: 't-a4',
    iconClass: 'ti-activity',
    rating: 4.9,
    reviewCount: 18234,
    episodeCount: 198,
    episodes: [
      { id: '701', title: 'The Science of Sleep', duration: '1:45:32', date: 'Jun 5, 2026', description: 'How to optimize your sleep for better health and performance.' },
      { id: '702', title: 'Dopamine: The Molecule of Motivation', duration: '1:32:18', date: 'May 29, 2026', description: 'Understanding the science behind motivation and reward.' },
      { id: '703', title: 'Cold Exposure Benefits', duration: '1:28:45', date: 'May 22, 2026', description: 'The science-backed benefits of deliberate cold exposure.' }
    ]
  }
};

module.exports = {
  all: allPodcasts,
  featured,
  trending,
  categories,
  trendingSearches,
  details
};
