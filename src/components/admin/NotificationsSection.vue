<!-- src/components/admin/NotificationsSection.vue -->
<template>
  <div class="notifications-section">
    <div class="section-header">
      <h2>Управление уведомлениями</h2>
    </div>

    <!-- Форма отправки уведомления -->
    <div class="notification-composer">
      <div class="composer-card">
        <h3>Отправить уведомление</h3>

        <div class="form-group">
          <label>Тип уведомления</label>
          <select v-model="newNotification.type" class="form-input">
            <option value="all">Всем пользователям</option>
            <option value="level">По уровню</option>
            <option value="income">По доходу</option>
          </select>
        </div>

        <div class="form-group" v-if="newNotification.type === 'level'">
          <label>Минимальный уровень</label>
          <input
              type="number"
              v-model.number="newNotification.minLevel"
              class="form-input"
              min="1"
          >
        </div>

        <div class="form-group" v-if="newNotification.type === 'income'">
          <label>Минимальный доход</label>
          <input
              type="number"
              v-model.number="newNotification.minIncome"
              class="form-input"
              min="0"
              step="1000"
          >
        </div>

        <div class="form-group">
          <label>Сообщение</label>
          <textarea
              v-model="newNotification.message"
              class="form-input"
              rows="4"
              placeholder="Введите текст сообщения..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
                type="checkbox"
                v-model="newNotification.important"
            >
            Важное уведомление
          </label>
        </div>

        <button
            class="btn-primary"
            @click="sendNotification"
            :disabled="!newNotification.message"
        >
          Отправить уведомление
        </button>
      </div>
    </div>

    <!-- История уведомлений -->
    <div class="notifications-history">
      <div class="history-header">
        <h3>История уведомлений</h3>
        <div class="history-filters">
          <select v-model="historyFilter" class="form-input">
            <option value="all">Все уведомления</option>
            <option value="important">Важные</option>
            <option value="regular">Обычные</option>
          </select>
        </div>
      </div>

      <div class="history-list">
        <div
            v-for="notification in filteredHistory"
            :key="notification.id"
            class="history-item"
            :class="{ 'important': notification.important }"
        >
          <div class="history-item-header">
            <span class="notification-type">
              {{ getNotificationType(notification.type) }}
            </span>
            <span class="notification-date">
              {{ formatDate(notification.sentAt) }}
            </span>
          </div>

          <p class="notification-message">{{ notification.message }}</p>

          <div class="notification-stats">
            <div class="stat-item">
              <span class="stat-label">Отправлено:</span>
              <span class="stat-value">{{ notification.sentCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Прочитано:</span>
              <span class="stat-value">{{ notification.readCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">% прочтения:</span>
              <span class="stat-value">
                {{ calculateReadPercentage(notification) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ApiService } from '@/services/apiService'

const newNotification = ref({
  type: 'all',
  message: '',
  minLevel: 1,
  minIncome: 0,
  important: false
})

const historyFilter = ref('all')
const notificationsHistory = ref([])

// Загрузка истории уведомлений
const loadHistory = async () => {
  try {
    const data = await ApiService.getNotificationsHistory()
    notificationsHistory.value = data
  } catch (error) {
    console.error('Error loading notifications history:', error)
  }
}

// Фильтрация истории
const filteredHistory = computed(() => {
  if (historyFilter.value === 'all') return notificationsHistory.value
  return notificationsHistory.value.filter(notification =>
      historyFilter.value === 'important' ? notification.important : !notification.important
  )
})

// Отправка уведомления
const sendNotification = async () => {
  try {
    await ApiService.sendNotification(newNotification.value)
    await loadHistory()

    // Сброс формы
    newNotification.value = {
      type: 'all',
      message: '',
      minLevel: 1,
      minIncome: 0,
      important: false
    }
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

// Вспомогательные функции
const getNotificationType = (type) => {
  const types = {
    all: 'Всем пользователям',
    level: 'По уровню',
    income: 'По доходу'
  }
  return types[type] || type
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

const calculateReadPercentage = (notification) => {
  if (!notification.sentCount) return 0
  return Math.round((notification.readCount / notification.sentCount) * 100)
}

// Загрузка данных при монтировании
onMounted(async () => {
  await loadHistory()
})
</script>

<style scoped>
.notifications-section {
  padding: 20px;
}

.section-header {
  margin-bottom: 20px;
}

.notification-composer {
  margin-bottom: 30px;
}

.composer-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-filters .form-input {
  width: 200px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.history-item.important {
  border-left: 4px solid var(--primary-color);
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.notification-type {
  font-weight: 500;
}

.notification-date {
  color: #666;
  font-size: 14px;
}

.notification-message {
  margin: 0 0 16px;
  line-height: 1.5;
}

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

@media (max-width: 768px) {
  .notifications-section {
    padding: 10px;
  }

  .history-header {
    flex-direction: column;
    gap: 12px;
  }

  .history-filters .form-input {
    width: 100%;
  }

  .notification-stats {
    grid-template-columns: 1fr;
  }
}
</style>