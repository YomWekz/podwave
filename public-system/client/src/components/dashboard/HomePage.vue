<!--
  HomePage Component - Discover/Home Page
  Main landing page with greeting, category pills, featured grid, and trending list
-->

<template>
  <div class="screen active">
    <div class="scroll-area">
      <!-- Hero Section -->
      <div class="home-hero">
        <div>
          <div class="home-greeting">{{ greeting }}, {{ userName }} 👋</div>
          <div class="home-sub">Here's what's on today</div>
        </div>
      </div>

      <!-- Category Pills -->
      <div class="cats-row">
        <button
          v-for="cat in categories"
          :key="cat"
          :class="['cat-pill', { active: selectedCategory === cat }]"
          @click="selectCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Featured Section -->
      <div class="sec-head">
        <span class="sec-title">Featured</span>
        <span class="sec-more" @click="handleSeeAll('featured')">See all</span>
      </div>
      <div class="feat-grid">
        <div
          v-for="podcast in filteredFeatured"
          :key="podcast.id"
          class="feat-card"
          @click="$emit('playPodcast', podcast)"
        >
          <div :class="['feat-thumb', podcast.colorClass]">
            <i :class="['ti', podcast.icon]"></i>
            <span v-if="podcast.featured" class="feat-badge">Featured</span>
            <div class="feat-play-overlay">
              <i class="ti ti-player-play-filled"></i>
            </div>
          </div>
          <div class="feat-body">
            <div class="feat-name">{{ podcast.name }}</div>
            <div class="feat-meta">{{ podcast.meta }}</div>
          </div>
        </div>
      </div>

      <!-- Trending Section -->
      <div class="sec-head">
        <span class="sec-title">Trending</span>
        <span class="sec-more" @click="handleSeeAll('trending')">See all</span>
      </div>
      <div class="trending-grid">
        <div
          v-for="podcast in filteredTrending"
          :key="podcast.id"
          class="trend-item"
          @click="$emit('playPodcast', podcast)"
        >
          <div class="trend-num">{{ podcast.rank }}</div>
          <div :class="['trend-art', podcast.colorClass]"></div>
          <div class="trend-info">
            <div class="trend-title">{{ podcast.name }}</div>
            <div class="trend-sub">{{ podcast.meta }}</div>
          </div>
          <div class="trend-play">
            <i class="ti ti-player-play"></i>
          </div>
        </div>
      </div>
      <div style="height: 24px;"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { featuredPodcasts, trendingPodcasts, categories } from '../../data/mockData';

// Emits
defineEmits(['playPodcast', 'toast']);

// Local state
const selectedCategory = ref('All');
const userName = 'Jamie';

// Computed
const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
});

// Filter featured podcasts by category
const filteredFeatured = computed(() => {
  if (selectedCategory.value === 'All') return featuredPodcasts;
  return featuredPodcasts.filter(p => p.category === selectedCategory.value);
});

// Filter trending podcasts by category
const filteredTrending = computed(() => {
  if (selectedCategory.value === 'All') return trendingPodcasts;
  return trendingPodcasts.filter(p => p.category === selectedCategory.value);
});

// Select category
function selectCategory(cat) {
  selectedCategory.value = cat;
}

// Handle "See all" click
function handleSeeAll(section) {
  // For now, just show toast
  emit('toast', `Loading ${section}…`);
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

.home-hero {
  padding: 28px 28px 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.home-greeting {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}

.home-sub {
  font-size: 13px;
  color: var(--text3);
}

.cats-row {
  display: flex;
  gap: 8px;
  padding: 20px 28px 0;
  flex-wrap: wrap;
}

.cat-pill {
  font-size: 12px;
  font-weight: 500;
  padding: 6px 16px;
  border-radius: 20px;
  border: 0.5px solid var(--border);
  color: var(--text3);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  font-family: inherit;
  background: none;
}

.cat-pill:hover {
  border-color: var(--border2);
  color: var(--text2);
}

.cat-pill.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-dark);
  font-weight: 600;
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

.sec-more {
  font-size: 12px;
  color: var(--accent);
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.15s;
}

.sec-more:hover {
  opacity: 0.75;
}

.feat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  padding: 0 28px;
}

.feat-card {
  background: var(--bg2);
  border-radius: var(--radius);
  overflow: hidden;
  border: 0.5px solid var(--border);
  cursor: pointer;
  transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
}

.feat-card:hover {
  transform: translateY(-3px);
  border-color: var(--border2);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.feat-thumb {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.feat-thumb i {
  font-size: 34px;
  color: rgba(255, 255, 255, 0.22);
}

.feat-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 9px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 5px;
  background: var(--accent-dim);
  color: var(--accent);
  letter-spacing: 0.05em;
}

.feat-play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  opacity: 0;
  transition: opacity 0.18s;
}

.feat-card:hover .feat-play-overlay {
  opacity: 1;
}

.feat-play-overlay i {
  font-size: 28px;
  color: #fff;
}

.feat-body {
  padding: 10px 12px 13px;
}

.feat-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 3px;
}

.feat-meta {
  font-size: 10px;
  color: var(--text3);
}

.trending-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 0 28px;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
}

.trend-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.trend-num {
  font-size: 12px;
  font-weight: 700;
  color: var(--text3);
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.trend-art {
  width: 46px;
  height: 46px;
  border-radius: 9px;
  flex-shrink: 0;
}

.trend-info {
  flex: 1;
  min-width: 0;
}

.trend-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trend-sub {
  font-size: 11px;
  color: var(--text3);
  margin-top: 2px;
}

.trend-play {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 0.5px solid var(--border2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text3);
  font-size: 13px;
  flex-shrink: 0;
  transition: all 0.15s;
  opacity: 0;
}

.trend-item:hover .trend-play {
  opacity: 1;
  color: var(--accent);
  border-color: var(--accent);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .home-hero {
    padding: 18px 18px 0;
  }

  .home-greeting {
    font-size: 18px;
  }

  .cats-row {
    padding: 18px 18px 0;
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .cats-row::-webkit-scrollbar {
    display: none;
  }

  .sec-head {
    padding: 20px 18px 12px;
  }

  .feat-grid {
    display: flex;
    gap: 10px;
    padding: 0 18px 20px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .feat-grid::-webkit-scrollbar {
    display: none;
  }

  .feat-card {
    width: 158px;
    flex-shrink: 0;
  }

  .trending-grid {
    display: block;
    padding: 0 18px;
  }

  .trend-play {
    opacity: 1;
  }
}
</style>
