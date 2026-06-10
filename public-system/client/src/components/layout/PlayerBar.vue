<!--
  PlayerBar Component - Desktop Bottom Audio Player
  Persistent audio player at the bottom of the screen
-->

<template>
  <div class="playerbar">
    <!-- Track Info -->
    <div class="player-track">
      <div :class="['player-art', currentPodcast?.colorClass]" @click="$emit('expand')">
        <i :class="['ti', currentPodcast?.icon || 'ti-radio']"></i>
      </div>
      <div class="player-info">
        <div class="player-title">{{ currentEpisode?.title || 'Select a podcast' }}</div>
        <div class="player-pod">{{ currentEpisode?.podcast || '' }}</div>
      </div>
      <div :class="['player-like', { liked: isLiked }]" @click="toggleLike" title="Save">
        <i :class="['ti', isLiked ? 'ti-heart-filled' : 'ti-heart']"></i>
      </div>
    </div>

    <!-- Center Controls + Progress -->
    <div class="player-center">
      <div class="player-controls">
        <div class="ctrl-btn sm" @click="handleShuffle" title="Shuffle">
          <i class="ti ti-arrows-shuffle"></i>
        </div>
        <div class="ctrl-btn" @click="skip(-15)" title="-15s">
          <i class="ti ti-rewind-15"></i>
        </div>
        <div class="play-pause" @click="togglePlay">
          <i :class="['ti', isPlaying ? 'ti-player-pause' : 'ti-player-play']"></i>
        </div>
        <div class="ctrl-btn" @click="skip(15)" title="+15s">
          <i class="ti ti-forward-15"></i>
        </div>
        <div class="ctrl-btn sm" @click="handleRepeat" title="Repeat">
          <i class="ti ti-repeat"></i>
        </div>
      </div>
      <div class="player-progress-wrap">
        <span class="player-time">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="seekTo">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="player-time right">{{ formatTime(totalTime) }}</span>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="player-right">
      <div class="ctrl-btn sm" @click="handleSpeed" title="Playback speed">
        <i class="ti ti-gauge"></i>
      </div>
      <div class="ctrl-btn sm" @click="handleSleep" title="Sleep timer">
        <i class="ti ti-moon"></i>
      </div>
      <div class="ctrl-btn sm" @click="handleQueue" title="Queue">
        <i class="ti ti-playlist-add"></i>
      </div>
      <div class="ctrl-btn sm" @click="handleDownload" title="Download">
        <i class="ti ti-download"></i>
      </div>
      <div class="vol-wrap">
        <div class="ctrl-btn sm" @click="toggleMute" title="Mute">
          <i :class="['ti', isMuted ? 'ti-volume-off' : (volume < 40 ? 'ti-volume-2' : 'ti-volume')]"></i>
        </div>
        <input
          type="range"
          class="vol-slider"
          min="0"
          max="100"
          :value="isMuted ? 0 : volume"
          @input="setVolume"
        />
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
});

// Emits
const emit = defineEmits(['toast', 'like', 'expand']);

// Local state
const isPlaying = ref(false);
const isLiked = ref(false);
const isMuted = ref(false);
const volume = ref(80);
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

// Format time helper
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

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

// Seek to position
function seekTo(event) {
  const bar = event.currentTarget;
  const rect = bar.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  currentTime.value = Math.floor(ratio * totalTime.value);
}

// Toggle like
function toggleLike() {
  isLiked.value = !isLiked.value;
  emit('toast', isLiked.value ? 'Added to saved' : 'Removed from saved');
  emit('like', isLiked.value);
}

// Toggle mute
function toggleMute() {
  isMuted.value = !isMuted.value;
  emit('toast', isMuted.value ? 'Muted' : 'Unmuted');
}

// Set volume
function setVolume(event) {
  volume.value = parseInt(event.target.value);
  isMuted.value = volume.value === 0;
}

// Handler functions
function handleShuffle() {
  emit('toast', 'Shuffle on');
}

function handleRepeat() {
  emit('toast', 'Repeat: one');
}

function handleSpeed() {
  emit('toast', 'Speed: 1.5×');
}

function handleSleep() {
  emit('toast', 'Sleep timer: 30 min');
}

function handleQueue() {
  emit('toast', 'Added to queue');
}

function handleDownload() {
  emit('toast', 'Downloading…');
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
.playerbar {
  grid-area: player;
  background: var(--bg2);
  border-top: 0.5px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 20px;
  position: relative;
  z-index: 20;
}

.player-track {
  display: flex;
  align-items: center;
  gap: 13px;
  width: 280px;
  flex-shrink: 0;
}

.player-art {
  width: 50px;
  height: 50px;
  border-radius: 9px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: opacity 0.15s;
}

.player-art:hover {
  opacity: 0.8;
}

.player-info {
  min-width: 0;
  flex: 1;
}

.player-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-pod {
  font-size: 11px;
  color: var(--text3);
  margin-top: 2px;
}

.player-like {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text3);
  cursor: pointer;
  transition: color 0.15s;
  flex-shrink: 0;
}

.player-like:hover {
  color: var(--accent);
}

.player-like.liked {
  color: var(--accent);
}

.player-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ctrl-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--text2);
  cursor: pointer;
  border-radius: 50%;
  transition: color 0.15s, background 0.15s;
}

.ctrl-btn:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
}

.ctrl-btn.sm {
  font-size: 17px;
}

.play-pause {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  color: var(--accent-dark);
  cursor: pointer;
  transition: transform 0.12s, background 0.15s;
  flex-shrink: 0;
}

.play-pause:hover {
  transform: scale(1.06);
  background: #6ed4b0;
}

.play-pause:active {
  transform: scale(0.94);
}

.player-progress-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 520px;
}

.player-time {
  font-size: 11px;
  color: var(--text3);
  font-family: 'DM Mono', monospace;
  flex-shrink: 0;
  min-width: 36px;
}

.player-time.right {
  text-align: right;
}

.progress-bar {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.progress-bar:hover {
  height: 5px;
  margin: -1px 0;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.1s linear;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.15s;
}

.progress-bar:hover .progress-fill::after {
  opacity: 1;
}

.player-right {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 200px;
  justify-content: flex-end;
  flex-shrink: 0;
}

.vol-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vol-slider {
  -webkit-appearance: none;
  width: 80px;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.15);
  outline: none;
  cursor: pointer;
}

.vol-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text);
  cursor: pointer;
}
</style>
