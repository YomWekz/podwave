<!--
  PodWave Public - Main Application
  Vue 3 + Vite Podcast Directory & Player
  
  Desktop: Sidebar + Main content + Bottom player
  Mobile: Full-screen pages + Bottom nav + Mini player
-->

<template>
  <div id="app" :class="{ 'is-mobile': isMobile }">
    <!-- Desktop Sidebar (hidden on mobile) -->
    <Sidebar
      v-if="!isMobile"
      :current-page="currentPage"
      @navigate="navigateTo"
      @playPodcast="playPodcast"
    />

    <!-- Main Content Area -->
    <main id="main">
      <!-- Topbar -->
      <Topbar
        :current-page="currentPage"
        @search="handleSearch"
        @navigate="handleTopbarNavigation"
        @toast="showToast"
        ref="topbarRef"
      />

      <!-- Page Screens -->
      <HomePage
        v-if="currentPage === 'home'"
        @playPodcast="playPodcast"
        @toast="showToast"
      />
      <BrowsePage
        v-else-if="currentPage === 'browse'"
        @selectCategory="selectCategory"
        @toast="showToast"
      />
      <SearchPage
        v-else-if="currentPage === 'search'"
        :query="searchQuery"
        @playPodcast="playPodcast"
        @update:query="searchQuery = $event"
      />
      <SavedPage
        v-else-if="currentPage === 'saved'"
        @playPodcast="playPodcast"
        @toast="showToast"
        @unsave="handleUnsave"
      />
      <ProfilePage
        v-else-if="currentPage === 'profile'"
        @settingClick="handleSettingClick"
        @toast="showToast"
      />
      <PodcastDetailPage
        v-else-if="currentPage === 'podcast-detail'"
        :podcast-data="selectedPodcast"
        @playEpisode="playEpisode"
        @toast="showToast"
        @back="navigateTo('back')"
      />
    </main>

    <!-- Desktop Player Bar (hidden on mobile) -->
    <PlayerBar
      v-if="!isMobile"
      :current-episode="currentEpisode"
      :current-podcast="currentPodcast"
      @toast="showToast"
      @like="handleLike"
    />

    <!-- Mobile Mini Player (above bottom nav) -->
    <MiniPlayer
      v-if="isMobile && currentEpisode"
      :current-episode="currentEpisode"
      :current-podcast="currentPodcast"
      :show-player="!!currentEpisode"
      @expand="expandPlayer"
      @toast="showToast"
    />

    <!-- Mobile Bottom Navigation (hidden on desktop) -->
    <MobileNav
      v-if="isMobile"
      :current-page="currentPage"
      @navigate="navigateTo"
    />

    <!-- Toast Notification -->
    <Toast
      :message="toastMessage"
      :visible="toastVisible"
      @hide="toastVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Layout Components
import Sidebar from './components/layout/Sidebar.vue';
import Topbar from './components/layout/Topbar.vue';
import PlayerBar from './components/layout/PlayerBar.vue';
import MiniPlayer from './components/layout/MiniPlayer.vue';
import MobileNav from './components/layout/MobileNav.vue';

// Dashboard Components
import HomePage from './components/dashboard/HomePage.vue';
import BrowsePage from './components/dashboard/BrowsePage.vue';
import SearchPage from './components/dashboard/SearchPage.vue';
import SavedPage from './components/dashboard/SavedPage.vue';
import ProfilePage from './components/dashboard/ProfilePage.vue';
import PodcastDetailPage from './components/dashboard/PodcastDetailPage.vue';

// Common Components
import Toast from './components/Toast.vue';

// Mock Data
import { themeColors } from './data/mockData';

// ============================================
// STATE
// ============================================

// Responsive detection
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value <= 768);

// Navigation
const currentPage = ref('home');
const pageHistory = ref(['home']);
const searchQuery = ref('');

// Podcast detail state
const selectedPodcast = ref(null);

// Player state
const currentEpisode = ref(null);
const currentPodcast = ref(null);

// Toast state
const toastMessage = ref('');
const toastVisible = ref(false);

// Refs
const topbarRef = ref(null);

// ============================================
// NAVIGATION
// ============================================

function navigateTo(page) {
  if (page === 'back') {
    if (pageHistory.value.length > 1) {
      pageHistory.value.pop();
      const prevPage = pageHistory.value[pageHistory.value.length - 1];
      // If going back from podcast detail, clear selected podcast
      if (currentPage.value === 'podcast-detail') {
        selectedPodcast.value = null;
      }
      currentPage.value = prevPage;
    }
  } else if (page === 'podcast-detail') {
    // Special handling for podcast detail - push to history but don't update main nav
    if (currentPage.value !== 'podcast-detail') {
      pageHistory.value.push('podcast-detail');
      currentPage.value = 'podcast-detail';
    }
  } else {
    // Clear selected podcast when navigating to main pages
    selectedPodcast.value = null;
    if (page !== currentPage.value) {
      pageHistory.value.push(page);
      currentPage.value = page;
    }
    // Focus search input when navigating to search
    if (page === 'search' && topbarRef.value) {
      setTimeout(() => {
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) searchInput.focus();
      }, 150);
    }
  }
}

function handleTopbarNavigation(page) {
  if (page === 'back') {
    navigateTo('back');
  } else {
    navigateTo(page);
  }
}

function handleSearch(query) {
  searchQuery.value = query;
  if (query && currentPage.value !== 'search') {
    navigateTo('search');
  }
}

// ============================================
// PLAYER
// ============================================

function playPodcast(podcast) {
  // Navigate to podcast detail page
  selectedPodcast.value = podcast;
  navigateTo('podcast-detail');
}

function playEpisode({ episode, podcast }) {
  // Set current podcast
  currentPodcast.value = podcast;
  
  // Set current episode from episode data
  currentEpisode.value = {
    title: episode.title,
    podcast: podcast.name,
    currentTime: 0,
    totalTime: parseDuration(episode.duration),
  };
  
  showToast(`Now playing: ${episode.title}`);
}

// Parse duration string like "52:14" or "1:32:18" to seconds
function parseDuration(duration) {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 300; // Default 5 minutes
}

function handleLike(isLiked) {
  // Handle like/unlike - would update saved state in real app
}

function expandPlayer() {
  // Would open full-screen player overlay
  showToast('Full player coming soon');
}

// ============================================
// CATEGORY SELECTION
// ============================================

function selectCategory(category) {
  showToast(`${category} · ${Math.floor(Math.random() * 1000) + 100} podcasts`);
}

// ============================================
// SAVED/UNSAVE
// ============================================

function handleUnsave(podcast) {
  // Would update saved state in real app
}

// ============================================
// SETTINGS
// ============================================

function handleSettingClick(action) {
  if (action === 'signout') {
    showToast('Signing out…');
  } else {
    showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} settings`);
  }
}

// ============================================
// TOAST
// ============================================

let toastTimer = null;

function showToast(message) {
  toastMessage.value = message;
  toastVisible.value = true;
  
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastVisible.value = false;
  }, 2200);
}

// ============================================
// LIFECYCLE
// ============================================

function handleResize() {
  windowWidth.value = window.innerWidth;
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
  
  // Keyboard shortcuts (desktop only)
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (isMobile.value) return;
    
    if (e.code === 'Space') {
      e.preventDefault();
      // Toggle play would go here
    }
    if (e.code === 'ArrowLeft') {
      // Skip -15s would go here
    }
    if (e.code === 'ArrowRight') {
      // Skip +15s would go here
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style>
/* Main App Layout - Desktop Grid */
#app {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  grid-template-rows: 1fr var(--player-h);
  grid-template-areas:
    "sidebar main"
    "player  player";
  height: 100vh;
}

#main {
  grid-area: main;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
}

/* Mobile Layout */
#app.is-mobile {
  display: flex;
  flex-direction: column;
  grid-template-columns: none;
  grid-template-rows: none;
}

#app.is-mobile #main {
  flex: 1;
  overflow: hidden;
}
</style>
