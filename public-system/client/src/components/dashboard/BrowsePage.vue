<!--
  BrowsePage Component - Browse Categories
  Grid of category cards for browsing podcasts by genre
-->

<template>
  <div class="screen active">
    <div class="scroll-area">
      <div class="sec-head" style="padding-top: 28px;">
        <span class="sec-title">Browse Categories</span>
      </div>
      <div class="browse-grid">
        <div
          v-for="(info, name) in categoryData"
          :key="name"
          class="browse-card"
          :style="{ background: info.gradient }"
          @click="$emit('selectCategory', name)"
        >
          <i :class="['ti', info.icon, 'browse-card-icon']"></i>
          <div class="browse-card-label">{{ name }}</div>
          <div class="browse-card-count">{{ info.count }} podcasts</div>
        </div>
      </div>
      <div style="height: 24px;"></div>
    </div>
  </div>
</template>

<script setup>
import { categoryColors } from '../../data/mockData';

// Emits
defineEmits(['selectCategory', 'toast']);

// Category data
const categoryData = categoryColors;
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

.browse-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 0 28px;
}

.browse-card {
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 14px;
  transition: transform 0.18s, box-shadow 0.18s;
  position: relative;
}

.browse-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.5);
}

.browse-card-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
  font-size: 32px;
  color: rgba(255, 255, 255, 0.25);
}

.browse-card-label {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  position: relative;
  z-index: 1;
}

.browse-card-count {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
  margin-top: 2px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sec-head {
    padding: 18px 18px 14px;
  }

  .browse-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 0 18px 20px;
  }
}
</style>
