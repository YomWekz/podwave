<!--
  SavedPage Component - Saved Podcasts
  List of user's saved/followed podcasts
-->

<template>
  <div class="screen active">
    <div class="scroll-area">
      <div class="sec-head" style="padding-top: 28px;">
        <span class="sec-title">Saved Podcasts</span>
      </div>
      <div class="saved-list">
        <div
          v-for="podcast in savedPodcasts"
          :key="podcast.id"
          class="saved-item"
          @click="$emit('playPodcast', podcast)"
        >
          <div :style="{ background: themeColors[podcast.colorClass] || '#534AB7' }" style="width: 54px; height: 54px; border-radius: 10px; flex-shrink: 0;"></div>
          <div class="saved-info">
            <div class="saved-title">{{ podcast.name }}</div>
            <div class="saved-sub">{{ podcast.meta }}</div>
            <div class="saved-eps">{{ podcast.episodes || 'N/A' }} episodes</div>
          </div>
          <div class="heart-btn" @click.stop="handleUnsave(podcast)">
            <i class="ti ti-heart-filled"></i>
          </div>
        </div>
      </div>
      <div v-if="savedPodcasts.length === 0" class="no-saved">
        No saved podcasts yet
      </div>
      <div style="height: 24px;"></div>
    </div>
  </div>
</template>

<script setup>
import { savedPodcasts, themeColors } from '../../data/mockData';

// Emits
const emit = defineEmits(['playPodcast', 'toast', 'unsave']);

// Handle unsave
function handleUnsave(podcast) {
  emit('toast', 'Removed from saved');
  emit('unsave', podcast);
}
</script>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.screen.active {
  display: flex;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 20px;
}

.sec-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px 12px;
}

.sec-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text3);
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.saved-list {
  padding: 0 28px;
}

.saved-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 12px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
}

.saved-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.saved-info {
  flex: 1;
  min-width: 0;
}

.saved-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.saved-sub {
  font-size: 11px;
  color: var(--text3);
  margin-top: 3px;
}

.saved-eps {
  font-size: 11px;
  color: var(--accent);
  margin-top: 3px;
}

.heart-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 20px;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.15s;
}

.heart-btn:hover {
  transform: scale(1.15);
}

.no-saved {
  padding: 48px 28px;
  text-align: center;
  color: var(--text3);
  font-size: 13px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sec-head {
    padding: 18px 18px 12px;
  }

  .saved-list {
    padding: 0 18px;
  }
}
</style>
