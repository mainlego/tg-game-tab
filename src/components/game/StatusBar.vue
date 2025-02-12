<!-- src/components/game/StatusBar.vue -->
<template>
  <div class="status">
    <div class="status__level">
      {{ store.level.title }}
      <svg width="12" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M11.8067 7.52646C11.8692 7.58844 11.9187 7.66217 11.9526 7.74341C11.9864 7.82465 12.0039 7.91179 12.0039 7.9998C12.0039 8.08781 11.9864 8.17494 11.9526 8.25618C11.9187 8.33742 11.8692 8.41116 11.8067 8.47313L6.47333 13.8065C6.41136 13.8689 6.33762 13.9185 6.25638 13.9524C6.17515 13.9862 6.08801 14.0037 6 14.0037C5.91199 14.0037 5.82485 13.9862 5.74362 13.9524C5.66238 13.9185 5.58864 13.8689 5.52667 13.8065C5.46418 13.7445 5.41459 13.6708 5.38074 13.5895C5.34689 13.5083 5.32947 13.4211 5.32947 13.3331C5.32947 13.2451 5.34689 13.158 5.38074 13.0767C5.41459 12.9955 5.46418 12.9218 5.52667 12.8598L10.3933 7.9998L5.52667 3.1398C5.40113 3.01426 5.33061 2.844 5.33061 2.66646C5.33061 2.48893 5.40113 2.31867 5.52667 2.19313C5.6522 2.0676 5.82247 1.99707 6 1.99707C6.17753 1.99707 6.3478 2.0676 6.47333 2.19313L11.8067 7.52646Z"
              fill="white"/>
      </svg>
    </div>
    <div class="status__score">
      <span class="current-score">{{ store.level.current }}</span>
      <span class="score-separator">/</span>
      <span class="max-score">{{ store.level.max }}</span>
    </div>
  </div>

  <div class="progress-container">
    <div class="progress-fill" :style="{ width: `${store.level.progress}%` }"></div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()
</script>

<style scoped>
.status {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: white;
  margin-top: 10px;
}

.status__level {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status__score {
  display: flex;
  gap: 3px;
}

.max-score {
  opacity: 0.5;
}

.progress-container {
  width: 100%;
  height: 12px;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: url('@/assets/images/progress.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: left center;
  transition: width 0.5s ease-in-out;
}
</style>