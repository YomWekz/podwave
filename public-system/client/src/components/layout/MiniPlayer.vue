<!--
  MiniPlayer Component - Mobile Mini Player
  Persistent mini audio player above bottom navigation on mobile
-->

<template>
  <div v-if="currentEpisode" :class="['miniplayer', { visible: showPlayer }]" @click="$emit('expand')">
    <div class="mini-inner">
      <div :class="['mini-art', currentPodcast?.colorClass]"></div>
      <div class="mini-info">
        <div class="mini-title">{{ currentEpisode?.title || 'Select a podcast' }}</div>
        <div class="mini-pod">{{ currentEpisode?.podcast || '' }}</div>
        <div class="mini-bar">
          <div class="mini-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
      <div class="mini-controls">
        <div class="mini-ctrl-btn" @click.stop="skip(-15)">
          <i class="ti ti-rewind"></i>
        </div>
        <div class="mini-play" @click.stop="togglePlay">
          <i :class="['ti', isPlaying ? 'ti-player-pause' : 'ti-player-play']"></i>
        </div>
        <div class="mini-ctrl-btn" @click.stop="skip(15)">
          <i class="ti ti-forward"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

// Props
const props = defineProps({
  currentEpisode: {
    type: Object,
    default: null,
  },
  currentPodcast: {
    type: Object,
    default: null,
  },
  showPlayer: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(['expand', 'toast']);

// Local state
const isPlaying = ref(false);
const currentTime = ref(0);
const totalTime = ref(300);
const progressPercent = computed(() => (currentTime.value / totalTime.value) * 100);

// Progress interval
let playInterval = null;

// Watch for episode changes
watch(() => props.currentEpisode, (newEpisode) => {
  if (newEpisode) {
    currentTime.value = newEpisode.currentTime || 0;
    totalTime.value = newEpisode.totalTime || 300;
    isPlaying.value = true;
    startProgress();
  }
});

// Toggle play/pause
function togglePlay() {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    startProgress();
  } else {
    stopProgress();
  }
}

// Start progress
function startProgress() {
  stopProgress();
  playInterval = setInterval(() => {
    if (currentTime.value < totalTime.value) {
      currentTime.value++;
    } else {
      stopProgress();
    }
  }, 1000);
}

// Stop progress
function stopProgress() {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
}

// Skip forward/backward
function skip(seconds) {
  currentTime.value = Math.max(0, Math.min(totalTime.value, currentTime.value + seconds));
  emit('toast', seconds > 0 ? `+${seconds}s` : `${seconds}s`);
}

// Lifecycle
onMounted(() => {
  if (props.currentEpisode) {
    currentTime.value = props.currentEpisode.currentTime || 0;
    totalTime.value = props.currentEpisode.totalTime || 300;
  }
});

onUnmounted(() => {
  stopProgress();
});
</script>

<style scoped>
.miniplayer {
  background: var(--bg2);
  border-top: 0.5px solid var(--border);
  padding: 10px 18px 12px;
  flex-shrink: 0;
  cursor: pointer;
  display: none;
}

.miniplayer.visible {
  display: block;
}

.mini-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-art {
  width: 38px;
  height: 38px;
  border-radius: 7px;
  flex-shrink: 0;
}

.mini-info {
  flex: 1;
  min-width: 0;
}

.mini-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-pod {
  font-size: 10px;
  color: var(--text3);
  margin-top: 1px;
}

.mini-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.mini-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.5s linear;
}

.mini-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.mini-ctrl-btn {
  color: var(--text3);
  font-size: 17px;
  cursor: pointer;
  transition: color 0.15s;
  display: flex;
  align-items: center;
}

.mini-ctrl-btn:active {
  color: var(--text);
}

.mini-play {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--accent-dark);
  cursor: pointer;
  transition: transform 0.1s;
  flex-shrink: 0;
}

.mini-play:active {
  transform: scale(0.93);
}
</style>
