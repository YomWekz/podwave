<!--
  SearchPage Component - Search Page
  Search bar with trending searches and results
-->

<template>
  <div class="screen active">
    <div class="scroll-area" style="padding-top: 8px;">
      <!-- Trending Searches (shown when no query) -->
      <div v-if="!searchQuery" id="search-suggestions">
        <div class="sec-head">
          <span class="sec-title">Trending Searches</span>
        </div>
        <div class="trending-searches search-content">
          <div
            v-for="(term, index) in trendingSearches"
            :key="index"
            class="trending-search-item"
            @click="fillSearch(term)"
          >
            <i class="ti ti-trending-up"></i>
            <span>{{ term }}</span>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div v-else id="search-results">
        <div class="sec-head">
          <span class="sec-title">{{ results.length }} Result{{ results.length !== 1 ? 's' : '' }}</span>
        </div>
        <div v-if="results.length > 0" class="search-content">
          <div
            v-for="podcast in results"
            :key="podcast.id"
            class="result-item"
            @click="$emit('playPodcast', podcast)"
          >
            <div :style="{ background: themeColors[podcast.colorClass] || '#1D9E75' }" style="width: 50px; height: 50px; border-radius: 9px; flex-shrink: 0;"></div>
            <div class="result-info">
              <div class="result-title">{{ podcast.name }}</div>
              <div class="result-sub">{{ podcast.meta }}</div>
            </div>
            <div class="result-type">Podcast</div>
          </div>
        </div>
        <div v-else class="no-results">
          No results for "{{ searchQuery }}"
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { allPodcasts, trendingSearches, themeColors } from '../../data/mockData';

// Props
const props = defineProps({
  query: {
    type: String,
    default: '',
  },
});

// Emits
const emit = defineEmits(['playPodcast', 'update:query']);

// Local state
const searchQuery = ref(props.query);

// Watch for prop changes
watch(() => props.query, (newQuery) => {
  searchQuery.value = newQuery;
});

// Computed results
const results = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return [];
  return allPodcasts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.meta.toLowerCase().includes(q) ||
    p.category?.toLowerCase().includes(q)
  );
});

// Fill search from trending
function fillSearch(term) {
  searchQuery.value = term;
  emit('update:query', term);
}

// Expose for parent
defineExpose({ searchQuery });
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

.search-content {
  padding: 0 28px;
}

.trending-searches {
  margin-top: 4px;
}

.trending-search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: opacity 0.15s;
}

.trending-search-item:hover {
  opacity: 0.7;
}

.trending-search-item i {
  font-size: 15px;
  color: var(--text3);
}

.trending-search-item span {
  font-size: 13px;
  color: var(--text2);
}

.result-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 8px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.result-sub {
  font-size: 11px;
  color: var(--text3);
  margin-top: 2px;
}

.result-type {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-dim);
  padding: 3px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.no-results {
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

  .search-content {
    padding: 0 18px;
  }
}
</style>
