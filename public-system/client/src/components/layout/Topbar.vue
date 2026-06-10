<!--
  Topbar Component - Desktop Header
  Search bar and action buttons at the top of the main content area
-->

<template>
  <header class="topbar">
    <!-- Back Button -->
    <div class="topbar-back" @click="handleBack" title="Back">
      <i class="ti ti-arrow-left"></i>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <i class="ti ti-search"></i>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search podcasts & episodes…"
        @input="handleSearch"
        @focus="handleFocus"
      />
      <i
        v-if="searchQuery"
        class="ti ti-x"
        style="font-size: 15px; color: var(--text3); cursor: pointer;"
        @click="clearSearch"
      ></i>
    </div>

    <!-- Spacer -->
    <div class="topbar-spacer"></div>

    <!-- Action Buttons -->
    <div class="topbar-btn" title="Notifications" @click="handleNotification">
      <i class="ti ti-bell"></i>
    </div>
    <div class="topbar-btn" title="Settings" @click="handleSettings">
      <i class="ti ti-settings"></i>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';

// Props
defineProps({
  currentPage: {
    type: String,
    default: 'home',
  },
});

// Emits
const emit = defineEmits(['search', 'navigate', 'toast']);

// Local state
const searchQuery = ref('');

// Handle search input
function handleSearch() {
  emit('search', searchQuery.value);
}

// Handle focus on search
function handleFocus() {
  emit('navigate', 'search');
}

// Clear search
function clearSearch() {
  searchQuery.value = '';
  emit('search', '');
}

// Handle back button
function handleBack() {
  emit('navigate', 'back');
}

// Handle notification click
function handleNotification() {
  emit('toast', 'No new notifications');
}

// Handle settings click
function handleSettings() {
  emit('toast', 'Settings');
}

// Expose clear method for parent
defineExpose({ clearSearch });
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 28px;
  border-bottom: 0.5px solid var(--border);
  flex-shrink: 0;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar-back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text2);
  cursor: pointer;
  font-size: 18px;
  transition: background 0.15s;
  flex-shrink: 0;
}

.topbar-back:hover {
  background: rgba(255, 255, 255, 0.07);
}

.search-bar {
  flex: 1;
  max-width: 460px;
  background: var(--bg3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 14px;
  border: 0.5px solid var(--border);
  transition: border-color 0.15s;
}

.search-bar:focus-within {
  border-color: var(--border2);
}

.search-bar i {
  font-size: 15px;
  color: var(--text3);
  flex-shrink: 0;
}

.search-bar input {
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 13px;
  width: 100%;
  font-family: inherit;
}

.search-bar input::placeholder {
  color: var(--text3);
}

.topbar-spacer {
  flex: 1;
}

.topbar-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text2);
  cursor: pointer;
  font-size: 19px;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.topbar-btn:hover {
  background: rgba(255, 255, 255, 0.07);
  color: var(--text);
}
</style>
