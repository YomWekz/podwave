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

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="ti ti-loader spin"></i>
        <span>Loading saved podcasts...</span>
      </div>

      <!-- Saved List -->
      <div v-else-if="savedPodcasts.length > 0" class="saved-list">
        <div
          v-for="podcast in savedPodcasts"
          :key="podcast.id || podcast._id"
          class="saved-item"
          @click="$emit('playPodcast', podcast)"
        >
          <div :style="{ background: getThemeColor(podcast.colorClass) }" style="width: 54px; height: 54px; border-radius: 10px; flex-shrink: 0;"></div>
          <div class="saved-info">
            <div class="saved-title">{{ podcast.title || podcast.name }}</div>
            <div class="saved-sub">{{ podcast.author || podcast.creator || podcast.meta }}</div>
            <div class="saved-eps">{{ podcast.episodeCount || podcast.episodes || 0 }} episodes</div>
          </div>
          <div 
            class="heart-btn" 
            @click.stop="handleUnsave(podcast)"
            :class="{ unsaving: unsavingId === (podcast.id || podcast._id) }"
          >
            <i v-if="unsavingId === (podcast.id || podcast._id)" class="ti ti-loader spin"></i>
            <i v-else class="ti ti-heart-filled"></i>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="no-saved">
        <i class="ti ti-heart"></i>
        <div>No saved podcasts yet</div>
        <p>Start exploring and save your favorite podcasts</p>
      </div>

      <div style="height: 24px;"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as api from '../../services/api';
import * as auth from '../../services/auth';
import { themeColors } from '../../data/mockData';

// Emits
const emit = defineEmits(['playPodcast', 'toast', 'unsave']);

// State
const savedPodcasts = ref([]);
const loading = ref(true);
const unsavingId = ref(null);

// Get theme color
function getThemeColor(colorClass) {
  return themeColors[colorClass] || '#534AB7';
}

// Fetch saved podcasts
async function fetchSavedPodcasts() {
  if (!auth.isAuthenticated()) {
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    const result = await api.getSavedPodcasts();
    
    if (result.success) {
      savedPodcasts.value = result.data || [];
    } else {
      emit('toast', 'Failed to load saved podcasts');
    }
  } catch (error) {
    console.error('Failed to fetch saved podcasts:', error);
    emit('toast', 'Failed to load saved podcasts');
  } finally {
    loading.value = false;
  }
}

// Handle unsave
async function handleUnsave(podcast) {
  const podcastId = podcast._id || podcast.id;
  
  if (!auth.isAuthenticated()) {
    emit('toast', 'Please sign in to manage saved podcasts');
    return;
  }

  unsavingId.value = podcastId;

  try {
    const result = await api.unsavePodcast(podcastId);
    
    if (result.success) {
      // Remove from local list
      savedPodcasts.value = savedPodcasts.value.filter(p => (p._id || p.id) !== podcastId);
      emit('toast', 'Removed from saved');
      emit('unsave', podcast);
    } else {
      emit('toast', result.error || 'Failed to unsave podcast');
    }
  } catch (error) {
    console.error('Failed to unsave podcast:', error);
    emit('toast', 'Failed to unsave podcast');
  } finally {
    unsavingId.value = null;
  }
}

// Lifecycle
onMounted(() => {
  fetchSavedPodcasts();
});
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 28px;
  gap: 12px;
  color: var(--text-muted);
  font-size: 13px;
}

.loading-state i {
  font-size: 32px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

.heart-btn:hover:not(.unsaving) {
  transform: scale(1.15);
}

.heart-btn.unsaving {
  opacity: 0.6;
  cursor: not-allowed;
}

.heart-btn .spin {
  font-size: 18px;
}

.no-saved {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 28px;
  gap: 12px;
  color: var(--text3);
  text-align: center;
}

.no-saved i {
  font-size: 48px;
  opacity: 0.3;
}

.no-saved div {
  font-size: 15px;
  font-weight: 500;
}

.no-saved p {
  font-size: 12px;
  margin: 0;
  opacity: 0.7;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sec-head {
    padding: 18px 18px 12px;
  }

  .saved-list {
    padding: 0 18px;
  }

  .loading-state, .no-saved {
    padding: 60px 18px;
  }
}
</style>
