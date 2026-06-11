<!--
  Sidebar Component - Desktop Navigation
  Left sidebar with logo, navigation, saved podcasts, and user profile
-->

<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      pod<span>wave</span>
    </div>

    <!-- Navigation -->
    <div class="sidebar-section-label">Menu</div>
    <nav class="nav-list">
      <div
        v-for="item in navItems"
        :key="item.id"
        :class="['nav-item', { active: currentPage === item.id }]"
        @click="$emit('navigate', item.id)"
      >
        <i :class="['ti', item.icon]"></i>
        {{ item.label }}
      </div>
    </nav>

    <!-- Divider -->
    <div class="sidebar-divider"></div>

    <!-- Saved Podcasts Section -->
    <div class="sidebar-section-label">Your Library</div>
    <div class="sidebar-scroll">
      <div
        v-for="(podcast, index) in libraryPodcasts"
        :key="index"
        class="sidebar-saved-item"
        @click="$emit('playPodcast', podcast)"
      >
        <div :class="['sidebar-saved-art', podcast.colorClass]"></div>
        <div class="sidebar-saved-info">
          <div class="sidebar-saved-name">{{ podcast.name }}</div>
          <div class="sidebar-saved-sub">{{ podcast.meta }}</div>
        </div>
      </div>
    </div>

    <!-- User Profile / Auth -->
    <div v-if="isAuthenticated" class="sidebar-avatar-row" @click="$emit('navigate', 'profile')">
      <div class="avatar">{{ user.initials || user.username.slice(0, 2).toUpperCase() }}</div>
      <div>
        <div class="sidebar-name">{{ user.username }}</div>
        <div class="sidebar-plan">{{ user.plan || 'Free' }}</div>
      </div>
    </div>
    <div v-else class="sidebar-auth-row">
      <button class="btn-auth-primary" @click="$emit('show-signup')">
        <i class="ti ti-user-plus"></i>
        Sign Up
      </button>
      <button class="btn-auth-outline" @click="$emit('show-login')">
        Sign In
      </button>
    </div>
  </aside>
</template>

<script setup>
import { sidebarLibrary } from '../../data/mockData';

// Props
defineProps({
  currentPage: {
    type: String,
    default: 'home',
  },
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    default: null,
  },
});

// Emits
defineEmits(['navigate', 'playPodcast', 'show-login', 'show-signup']);

// Navigation items
const navItems = [
  { id: 'home', label: 'Home', icon: 'ti-home' },
  { id: 'browse', label: 'Browse', icon: 'ti-compass' },
  { id: 'search', label: 'Search', icon: 'ti-search' },
  { id: 'saved', label: 'Saved', icon: 'ti-heart' },
  { id: 'profile', label: 'Profile', icon: 'ti-user' },
];

// Data
const libraryPodcasts = sidebarLibrary;
</script>

<style scoped>
.sidebar {
  grid-area: sidebar;
  background: var(--bg2);
  border-right: 0.5px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-logo {
  padding: 24px 20px 20px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
  flex-shrink: 0;
}

.sidebar-logo span {
  color: var(--accent);
}

.sidebar-section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text3);
  padding: 14px 20px 6px;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  cursor: pointer;
  border-radius: 0;
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
  position: relative;
}

.nav-item i {
  font-size: 18px;
  flex-shrink: 0;
}

.nav-item:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.04);
}

.nav-item.active {
  color: var(--accent);
  background: var(--accent-dim);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  background: var(--accent);
  border-radius: 0 3px 3px 0;
}

.sidebar-divider {
  height: 0.5px;
  background: var(--border);
  margin: 10px 0;
  flex-shrink: 0;
}

.sidebar-scroll {
  flex: 1;
  overflow-y: auto;
}

.sidebar-saved-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  cursor: pointer;
  transition: background 0.15s;
}

.sidebar-saved-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.sidebar-saved-art {
  width: 34px;
  height: 34px;
  border-radius: 7px;
  flex-shrink: 0;
}

.sidebar-saved-info {
  min-width: 0;
}

.sidebar-saved-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-saved-sub {
  font-size: 10px;
  color: var(--text3);
  margin-top: 1px;
}

.sidebar-avatar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-top: 0.5px solid var(--border);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.sidebar-avatar-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--purple);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #CECBF6;
  flex-shrink: 0;
}

.sidebar-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

.sidebar-plan {
  font-size: 10px;
  color: var(--text3);
}

/* Auth Buttons */
.sidebar-auth-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px;
  border-top: 0.5px solid var(--border);
  flex-shrink: 0;
}

.btn-auth-primary {
  width: 100%;
  padding: 10px 16px;
  background: var(--accent);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-auth-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-auth-primary i {
  font-size: 16px;
}

.btn-auth-outline {
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: 0.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-auth-outline:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
}
</style>
