<!--
  PodcastDetailPage Component - Podcast Detail View
  Shows podcast info, episodes, follow/save, and rating
-->

<template>
  <div class="screen active">
    <!-- Mobile Header -->
    <div class="mobile-header">
      <div class="mobile-back" @click="$emit('back')">
        <i class="ti ti-arrow-left"></i>
      </div>
      <div class="mobile-title">Podcast</div>
      <div class="mobile-actions">
        <div class="mobile-action-btn" @click="handleShare">
          <i class="ti ti-share"></i>
        </div>
      </div>
    </div>

    <div class="scroll-area">
      <!-- Podcast Header -->
      <div class="podcast-header">
        <div class="podcast-cover-wrap">
          <div :class="['podcast-cover', podcast?.colorClass]">
            <i :class="['ti', podcast?.icon]"></i>
          </div>
        </div>
        <div class="podcast-info">
          <div class="podcast-title">{{ podcast?.name }}</div>
          <div class="podcast-creator">{{ podcast?.creator }}</div>
          <div class="podcast-meta">
            <span class="podcast-category">{{ podcast?.category }}</span>
            <span class="meta-dot">·</span>
            <span>{{ podcast?.episodeCount || 0 }} episodes</span>
          </div>
          <div class="podcast-tags">
            <span v-for="tag in podcast?.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-row">
        <button 
          :class="['follow-btn', { following: isFollowing, saving: isSaving }]" 
          @click="toggleFollow"
          :disabled="isSaving"
        >
          <i v-if="isSaving" class="ti ti-loader spin"></i>
          <i v-else :class="['ti', isFollowing ? 'ti-heart-filled' : 'ti-heart']"></i>
          {{ isSaving ? 'Saving...' : (isFollowing ? 'Saved' : 'Save') }}
        </button>
        <div class="rating-wrap">
          <div class="rating-stars">
            <i
              v-for="n in 5"
              :key="n"
              :class="['ti', n <= userRating ? 'ti-star-filled' : 'ti-star', { rating: isRating }]"
              @click="setRating(n)"
            ></i>
          </div>
          <div class="rating-info">
            <span class="rating-avg">{{ podcast?.rating?.toFixed(1) || '0.0' }}</span>
            <span class="rating-count">({{ formatCount(podcast?.reviewCount) }})</span>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="description-section">
        <div class="sec-head">
          <span class="sec-title">About</span>
        </div>
        <p class="description-text">{{ podcast?.description }}</p>
      </div>

      <!-- Episodes List -->
      <div class="episodes-section">
        <div class="sec-head">
          <span class="sec-title">Episodes</span>
        </div>
        <div class="episode-list">
          <div
            v-for="episode in podcast?.episodes"
            :key="episode.id"
            class="episode-item"
          >
            <div class="episode-info">
              <div class="episode-title">{{ episode.title }}</div>
              <div class="episode-meta">
                <span>{{ episode.date }}</span>
                <span class="meta-dot">·</span>
                <span>{{ episode.duration }}</span>
              </div>
              <p class="episode-description">{{ episode.description }}</p>
            </div>
            <button class="episode-play-btn" @click="playEpisode(episode)">
              <i class="ti ti-player-play"></i>
            </button>
          </div>
        </div>
      </div>

      <div style="height: 24px;"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { getPodcastDetail, themeColors } from '../../data/mockData';
import * as api from '../../services/api';
import * as auth from '../../services/auth';

// Props
const props = defineProps({
  podcastName: {
    type: String,
    default: '',
  },
  podcastData: {
    type: Object,
    default: null,
  },
});

// Emits
const emit = defineEmits(['playEpisode', 'back', 'toast', 'follow', 'require-auth']);

// Local state
const isFollowing = ref(false);
const userRating = ref(0);
const isSaving = ref(false);
const isRating = ref(false);

// Computed podcast data
const podcast = computed(() => {
  if (props.podcastData) {
    // Merge basic podcast data with detailed data
    const detail = getPodcastDetail(props.podcastData.name);
    return {
      ...detail,
      ...props.podcastData,
    };
  }
  return getPodcastDetail(props.podcastName);
});

// Check if podcast is saved
async function checkSavedStatus() {
  if (!auth.isAuthenticated() || !podcast.value) {
    isFollowing.value = false;
    return;
  }

  try {
    const result = await api.getSavedPodcasts();
    if (result.success && result.data) {
      const podcastId = podcast.value._id || podcast.value.id;
      isFollowing.value = result.data.some(p => (p._id || p.id) === podcastId);
    }
  } catch (error) {
    console.error('Failed to check saved status:', error);
  }
}

// Toggle follow/save
async function toggleFollow() {
  // Check if user is authenticated
  if (!auth.isAuthenticated()) {
    emit('require-auth');
    emit('toast', 'Please sign in to save podcasts');
    return;
  }

  const podcastId = podcast.value._id || podcast.value.id;
  if (!podcastId) {
    emit('toast', 'Unable to save podcast');
    return;
  }

  isSaving.value = true;

  try {
    if (isFollowing.value) {
      // Unsave
      const result = await api.unsavePodcast(podcastId);
      if (result.success) {
        isFollowing.value = false;
        emit('toast', 'Removed from your library');
        emit('follow', { podcast: podcast.value, following: false });
      } else {
        emit('toast', result.error || 'Failed to unsave podcast');
      }
    } else {
      // Save
      const result = await api.savePodcast(podcastId);
      if (result.success) {
        isFollowing.value = true;
        emit('toast', 'Added to your library');
        emit('follow', { podcast: podcast.value, following: true });
      } else {
        emit('toast', result.error || 'Failed to save podcast');
      }
    }
  } catch (error) {
    console.error('Failed to toggle save:', error);
    emit('toast', 'An error occurred');
  } finally {
    isSaving.value = false;
  }
}

// Set rating
async function setRating(n) {
  // Check if user is authenticated
  if (!auth.isAuthenticated()) {
    emit('require-auth');
    emit('toast', 'Please sign in to rate podcasts');
    return;
  }

  const podcastId = podcast.value._id || podcast.value.id;
  if (!podcastId) {
    emit('toast', 'Unable to rate podcast');
    return;
  }

  isRating.value = true;
  userRating.value = n;

  try {
    const result = await api.ratePodcast(podcastId, n);
    if (result.success) {
      emit('toast', `Rated ${n} star${n !== 1 ? 's' : ''}`);
    } else {
      emit('toast', result.error || 'Failed to rate podcast');
      userRating.value = 0; // Reset on failure
    }
  } catch (error) {
    console.error('Failed to rate podcast:', error);
    emit('toast', 'Failed to rate podcast');
    userRating.value = 0; // Reset on failure
  } finally {
    isRating.value = false;
  }
}

// Play episode
function playEpisode(episode) {
  emit('playEpisode', {
    episode,
    podcast: podcast.value,
  });

  // Track listen history if authenticated
  if (auth.isAuthenticated()) {
    trackListenHistory(episode);
  }
}

// Track listen history
async function trackListenHistory(episode) {
  try {
    const episodeId = episode._id || episode.id;
    const podcastId = podcast.value._id || podcast.value.id;
    
    if (episodeId && podcastId) {
      await api.addToHistory(episodeId, podcastId, 0);
    }
  } catch (error) {
    console.error('Failed to track listen history:', error);
  }
}

// Handle share
function handleShare() {
  emit('toast', 'Link copied!');
}

// Format count helper
function formatCount(count) {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count || 0;
}

// Lifecycle
onMounted(() => {
  checkSavedStatus();
});

// Watch for podcast changes
watch(() => podcast.value, () => {
  checkSavedStatus();
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

/* Mobile Header */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 0.5px solid var(--border);
  flex-shrink: 0;
  background: var(--bg);
}

.mobile-back {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text2);
  cursor: pointer;
  font-size: 18px;
  transition: background 0.15s;
}

.mobile-back:active {
  background: rgba(255, 255, 255, 0.08);
}

.mobile-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.mobile-actions {
  display: flex;
  gap: 8px;
}

.mobile-action-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text2);
  font-size: 18px;
  cursor: pointer;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 20px;
}

.podcast-header {
  display: flex;
  gap: 24px;
  padding: 28px;
  align-items: flex-start;
}

.podcast-cover-wrap {
  flex-shrink: 0;
}

.podcast-cover {
  width: 180px;
  height: 180px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72px;
  color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.podcast-info {
  flex: 1;
  min-width: 0;
}

.podcast-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
  line-height: 1.2;
}

.podcast-creator {
  font-size: 14px;
  color: var(--text2);
  margin-bottom: 8px;
}

.podcast-meta {
  font-size: 13px;
  color: var(--text3);
  margin-bottom: 12px;
}

.meta-dot {
  margin: 0 6px;
}

.podcast-category {
  color: var(--accent);
}

.podcast-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  background: var(--bg3);
  border: 0.5px solid var(--border);
  color: var(--text3);
}

.action-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 28px 20px;
}

.follow-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 24px;
  background: var(--accent);
  border: none;
  color: var(--accent-dark);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.follow-btn:hover {
  background: #6ed4b0;
  transform: scale(1.02);
}

.follow-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.follow-btn.saving {
  opacity: 0.8;
}

.follow-btn .spin {
  font-size: 14px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.follow-btn.following {
  background: var(--accent-dim);
  color: var(--accent);
  border: 0.5px solid var(--accent);
}

.follow-btn i {
  font-size: 16px;
}

.rating-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-stars i {
  font-size: 18px;
  color: var(--text3);
  cursor: pointer;
  transition: color 0.15s, transform 0.15s;
}

.rating-stars i:hover {
  transform: scale(1.1);
}

.rating-stars i.rating {
  opacity: 0.5;
  pointer-events: none;
}

.rating-stars i.ti-star-filled {
  color: #ffc107;
}

.rating-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.rating-avg {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.rating-count {
  font-size: 12px;
  color: var(--text3);
}

.description-section,
.episodes-section {
  padding: 0 28px;
}

.sec-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sec-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text3);
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.description-text {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
}

.episode-list {
  display: flex;
  flex-direction: column;
}

.episode-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.05);
}

.episode-item:last-child {
  border-bottom: none;
}

.episode-info {
  flex: 1;
  min-width: 0;
}

.episode-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.episode-meta {
  font-size: 12px;
  color: var(--text3);
  margin-bottom: 8px;
}

.episode-description {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.episode-play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-dim);
  border: 0.5px solid var(--accent);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
  align-self: center;
}

.episode-play-btn:hover {
  background: var(--accent);
  color: var(--accent-dark);
  transform: scale(1.05);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }

  .podcast-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px 18px;
  }

  .podcast-cover {
    width: 140px;
    height: 140px;
    font-size: 56px;
  }

  .podcast-title {
    font-size: 22px;
  }

  .podcast-tags {
    justify-content: center;
  }

  .action-row {
    flex-direction: column;
    gap: 14px;
    padding: 0 18px 20px;
    align-items: stretch;
  }

  .follow-btn {
    justify-content: center;
  }

  .rating-wrap {
    justify-content: center;
  }

  .description-section,
  .episodes-section {
    padding: 0 18px;
  }

  .episode-item {
    padding: 14px 0;
  }
}
</style>
