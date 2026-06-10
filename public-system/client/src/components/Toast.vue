<!--
  Toast Component - Notification Toast
  Floating toast notification at the bottom of the screen
-->

<template>
  <div :class="['toast', { show: visible }]">
    {{ message }}
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

// Props
const props = defineProps({
  message: {
    type: String,
    default: '',
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(['hide']);

// Watch for visibility changes
watch(() => props.visible, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      emit('hide');
    }, 2200);
  }
});
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: calc(var(--player-h) + 20px);
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  background: rgba(20, 20, 30, 0.96);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  padding: 9px 18px;
  border-radius: 20px;
  border: 0.5px solid var(--border2);
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: none;
  z-index: 200;
  white-space: nowrap;
  backdrop-filter: blur(10px);
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Mobile toast positioning */
@media (max-width: 768px) {
  .toast {
    bottom: 100px;
  }
}
</style>
