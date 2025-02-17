<!-- src/components/admin/NotificationStats.vue -->
<template>
  <div class="notification-stats">
    <div class="stat-item">
      <span class="stat-label">Отправлено:</span>
      <span class="stat-value">{{ stats.sentCount }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Прочитано:</span>
      <span class="stat-value">{{ stats.readCount }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">% прочтения:</span>
      <span class="stat-value">
        {{ calculateReadPercentage }}%
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const calculateReadPercentage = computed(() => {
  if (!props.stats.sentCount) return 0
  return Math.round((props.stats.readCount / props.stats.sentCount) * 100)
})
</script>

<style scoped>
.notification-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-weight: 500;
}
</style>