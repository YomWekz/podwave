<!--
  MobileNav Component - Bottom Navigation for Mobile
  Bottom tab bar for mobile navigation
-->

<template>
  <nav class="bottom-nav">
    <div
      v-for="item in navItems"
      :key="item.id"
      :class="['bnav-item', { active: currentPage === item.id }]"
      @click="$emit('navigate', item.id)"
    >
      <i :class="['ti', item.icon]"></i>
      <span>{{ item.label }}</span>
    </div>
  </nav>
</template>

<script setup>
// Props
defineProps({
  currentPage: {
    type: String,
    default: 'home',
  },
});

// Emits
defineEmits(['navigate']);

// Navigation items
const navItems = [
  { id: 'home', label: 'Home', icon: 'ti-home' },
  { id: 'browse', label: 'Browse', icon: 'ti-compass' },
  { id: 'search', label: 'Search', icon: 'ti-search' },
  { id: 'saved', label: 'Saved', icon: 'ti-heart' },
  { id: 'profile', label: 'Profile', icon: 'ti-user' },
];
</script>

<style scoped>
.bottom-nav {
  display: flex;
  justify-content: space-around;
  padding: 8px 0 max(12px, env(safe-area-inset-bottom));
  border-top: 0.5px solid var(--border);
  background: var(--bg);
  flex-shrink: 0;
}

.bnav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--text3);
  cursor: pointer;
  padding: 2px 16px;
  transition: color 0.15s;
  font-weight: 500;
  min-width: 0;
}

.bnav-item i {
  font-size: 22px;
  transition: transform 0.15s;
}

.bnav-item.active {
  color: var(--accent);
}

.bnav-item:active i {
  transform: scale(0.88);
}
</style>
