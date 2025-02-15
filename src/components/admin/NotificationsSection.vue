<!-- src/components/admin/NotificationsSection.vue -->
<template>
  <div class="notifications-section">
    <h2>Управление уведомлениями</h2>

    <!-- Форма отправки уведомления -->
    <div class="notification-composer">
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
            v-model="newNotification.minLevel"
            class="form-input"
            min="1"
        >
      </div>

      <div class="form-group" v-if="newNotification.type === 'income'">
        <label>Минимальный доход</label>
        <input
            type="number"
            v-model="newNotification.minIncome"
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

    <!-- История уведомлений -->
    <div class="notifications-history">
      <h3>История уведомлений</h3>

      <div class="history-filters">
        <select v-model="historyFilter" class="form-input">
          <option value="all">Все уведомления</option>
          <option value="important">Важные</option>
          <option value="regular">Обычные</option>
        </select>
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
            <span>Отправлено: {{ notification.sentCount }}</span>
            <span>Прочитано: {{ notification.readCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAdminStore } from '@/stores/adminStore'

const adminStore = useAdminStore()

const newNotification = ref({
  type: 'all',
  message: '',
  minLevel: 1,
  minIncome: 0,
  important: false
})

const historyFilter = ref('all')
const notificationsHistory = ref([
  {
    id: 1,
    type: 'all',
    message: 'Тестовое уведомление',
    sentAt: new Date(),
    important: true,
    sentCount: 1000,
    readCount: 750
  }
  // Другие уведомления...
])

const filteredHistory = computed(() => {
  if (historyFilter.value === 'all') return notificationsHistory.value
  return notificationsHistory.value.filter(notification =>
      historyFilter.value === 'important' ? notification.important : !notification.important
  )
})

const sendNotification = async () => {
  try {
    await adminStore.sendNotification(newNotification.value)
    notificationsHistory.value.unshift({
      id: Date.now(),
      ...newNotification.value,
      sentAt: new Date(),
      sentCount: 0,
      readCount: 0
    })

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
</script>

<style scoped>
.notifications-section {
  padding: 20px;
}

.notification-composer {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 8px;
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
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.notifications-history {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.history-filters {
  margin-bottom: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
}

.history-item.important {
  border-color: var(--primary-color);
  background: rgba(140, 96, 227, 0.05);
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.notification-type {
  font-weight: 500;
}

.notification-date {
  color: #666;
  font-size: 12px;
}

.notification-message {
  margin: 8px 0;
  line-height: 1.4;
}

.notification-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .notifications-section {
    padding: 10px;
  }

  .notification-composer,
  .notifications-history {
    padding: 15px;
  }

  .history-item {
    padding: 12px;
  }

  .notification-stats {
    flex-direction: column;
    gap: 4px;
  }
}
</style>