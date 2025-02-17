<!-- src/components/admin/NotificationsSection.vue -->
<template>
  <div class="notifications-section">
    <div class="section-header">
      <h2>Управление уведомлениями</h2>
    </div>

    <div class="notifications-layout">
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
            <label>Кнопка в сообщении (опционально)</label>
            <div class="button-inputs">
              <input
                  v-model="newNotification.button.text"
                  class="form-input"
                  placeholder="Текст кнопки"
              >
              <input
                  v-model="newNotification.button.url"
                  class="form-input"
                  placeholder="URL кнопки"
              >
            </div>
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

          <div class="form-group">
            <label>Запланировать отправку</label>
            <input
                type="datetime-local"
                v-model="scheduledDate"
                class="form-input"
                :min="minScheduledDate"
            >
          </div>

          <div class="preview-section">
            <h4>Предпросмотр сообщения</h4>
            <div class="preview-message">
              <div v-html="previewMessage"></div>
              <button
                  v-if="hasButton"
                  class="preview-button"
                  @click.prevent
              >
                {{ newNotification.button.text }}
              </button>
            </div>
          </div>

          <div class="action-buttons">
            <button
                class="btn-secondary"
                @click="sendTestNotification"
                :disabled="!newNotification.message"
            >
              Тестовая отправка
            </button>
            <button
                class="btn-primary"
                @click="sendNotification"
                :disabled="!newNotification.message"
            >
              {{ scheduledDate ? 'Запланировать' : 'Отправить' }}
            </button>
          </div>
        </div>
      </div>

      <!-- История уведомлений -->
      <div class="notifications-history">
        <div class="history-header">
          <h3>История уведомлений</h3>
          <div class="history-filters">
            <select v-model="historyFilter" class="form-input">
              <option value="all">Все уведомления</option>
              <option value="scheduled">Запланированные</option>
              <option value="sent">Отправленные</option>
              <option value="important">Важные</option>
            </select>
          </div>
        </div>

        <div class="history-list">
          <div
              v-for="notification in filteredHistory"
              :key="notification.id"
              class="history-item"
              :class="{
              'important': notification.important,
              'scheduled': notification.status === 'scheduled'
            }"
          >
            <div class="history-item-header">
              <div class="header-info">
                <span class="notification-type">
                  {{ getNotificationType(notification.type) }}
                </span>
                <span :class="['status-badge', notification.status]">
                  {{ getStatusText(notification.status) }}
                </span>
              </div>
              <span class="notification-date">
                {{ formatDate(notification.scheduledFor || notification.sentAt) }}
              </span>
            </div>

            <p class="notification-message">{{ notification.message }}</p>

            <div class="notification-conditions" v-if="hasConditions(notification)">
              <span v-if="notification.type === 'level'">
                Мин. уровень: {{ notification.conditions.minLevel }}
              </span>
              <span v-if="notification.type === 'income'">
                Мин. доход: {{ formatMoney(notification.conditions.minIncome) }}
              </span>
            </div>

            <div class="notification-stats" v-if="notification.status === 'sent'">
              <div class="stat-item">
                <span class="stat-label">Отправлено:</span>
                <span class="stat-value">{{ notification.stats.sentCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Прочитано:</span>
                <span class="stat-value">{{ notification.stats.readCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">% прочтения:</span>
                <span class="stat-value">
                  {{ calculateReadPercentage(notification) }}%
                </span>
              </div>
            </div>

            <div class="notification-actions" v-if="notification.status === 'scheduled'">
              <button class="btn-secondary" @click="editNotification(notification)">
                Редактировать
              </button>
              <button class="btn-delete" @click="cancelNotification(notification)">
                Отменить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ApiService } from '@/services/apiService'
import { useTelegram } from '@/composables/useTelegram'

const { user } = useTelegram()

const newNotification = ref({
  type: 'all',
  message: '',
  minLevel: 1,
  minIncome: 0,
  important: false,
  button: {
    text: '',
    url: ''
  }
})

const scheduledDate = ref('')
const historyFilter = ref('all')
const notificationsHistory = ref([])

// Минимальная дата для планирования (текущее время + 5 минут)
const minScheduledDate = computed(() => {
  const date = new Date()
  date.setMinutes(date.getMinutes() + 5)
  return date.toISOString().slice(0, 16)
})

// Предпросмотр сообщения
const previewMessage = computed(() => {
  let message = ''
  if (newNotification.value.important) {
    message += '🔔 <b>ВАЖНО!</b>\n\n'
  }
  message += newNotification.value.message.replace(/\n/g, '<br>')
  return message
})

const hasButton = computed(() => {
  return newNotification.value.button.text && newNotification.value.button.url
})

// Фильтрация истории
const filteredHistory = computed(() => {
  let filtered = [...notificationsHistory.value]

  switch (historyFilter.value) {
    case 'scheduled':
      filtered = filtered.filter(n => n.status === 'scheduled')
      break
    case 'sent':
      filtered = filtered.filter(n => n.status === 'sent')
      break
    case 'important':
      filtered = filtered.filter(n => n.important)
      break
  }

  return filtered
})

// Загрузка истории уведомлений
const loadHistory = async () => {
  try {
    const data = await ApiService.getNotificationsHistory()
    notificationsHistory.value = data
  } catch (error) {
    console.error('Error loading notifications history:', error)
  }
}

// Отправка уведомления
const sendNotification = async () => {
  try {
    const notificationData = { ...newNotification.value }

    // Добавляем время отправки если оно задано
    if (scheduledDate.value) {
      notificationData.scheduledFor = new Date(scheduledDate.value).toISOString()
    }

    // Добавляем кнопку только если заполнены оба поля
    if (!hasButton.value) {
      delete notificationData.button
    }

    await ApiService.sendNotification(notificationData)
    await loadHistory()

    // Сброс формы
    resetForm()
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

// Тестовая отправка
const sendTestNotification = async () => {
  if (!user.value?.id) return

  try {
    const testData = {
      ...newNotification.value,
      type: 'test',
      testUserId: user.value.id
    }

    await ApiService.sendTestNotification(testData)
    alert('Тестовое уведомление отправлено')
  } catch (error) {
    console.error('Error sending test notification:', error)
  }
}

// Редактирование запланированного уведомления
const editNotification = (notification) => {
  newNotification.value = { ...notification }
  if (notification.scheduledFor) {
    scheduledDate.value = notification.scheduledFor.slice(0, 16)
  }
}

// Отмена запланированного уведомления
const cancelNotification = async (notification) => {
  if (confirm('Вы уверены, что хотите отменить отправку уведомления?')) {
    try {
      await ApiService.deleteNotification(notification.id)
      await loadHistory()
    } catch (error) {
      console.error('Error canceling notification:', error)
    }
  }
}

// Сброс формы
const resetForm = () => {
  newNotification.value = {
    type: 'all',
    message: '',
    minLevel: 1,
    minIncome: 0,
    important: false,
    button: {
      text: '',
      url: ''
    }
  }
  scheduledDate.value = ''
}

// Вспомогательные функции
const getNotificationType = (type) => {
  const types = {
    all: 'Всем пользователям',
    level: 'По уровню',
    income: 'По доходу',
    test: 'Тестовое'
  }
  return types[type] || type
}

const getStatusText = (status) => {
  const statuses = {
    scheduled: 'Запланировано',
    sending: 'Отправляется',
    sent: 'Отправлено',
    cancelled: 'Отменено'
  }
  return statuses[status] || status
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

const formatMoney = (amount) => {
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + 'B'
  }
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M'
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K'
  }
  return amount.toString()
}

const hasConditions = (notification) => {
  return notification.type === 'level' || notification.type === 'income'
}

const calculateReadPercentage = (notification) => {
  if (!notification.stats?.sentCount) return 0
  return Math.round((notification.stats.readCount / notification.stats.sentCount) * 100)
}

// Загрузка данных при монтировании
onMounted(async () => {
  await loadHistory()
})
</script>

<style scoped>
/* Добавляем новые стили */
.notifications-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.preview-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.preview-message {
  background: white;
  padding: 16px;
  border-radius: 4px;
  margin-top: 8px;
}

.button-inputs {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 8px;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
}

.status-badge.scheduled {
  background: #ffd700;
  color: #000;
}

.status-badge.sending {
  background: #2196f3;
  color: white;
}

.status-badge.sent {
  background: #4caf50;
  color: white;
}

.status-badge.cancelled {
  background: #f44336;
  color: white;
}

.notification-conditions {
  margin: 8px 0;
  font-size: 14px;
  color: #666;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.preview-button {
  margin-top: 8px;
  padding: 8px 16px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .notifications-layout {
    grid-template-columns: 1fr;
  }
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

  .button-inputs {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }
}

/* Базовые стили */
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
  transition: opacity 0.2s;
}

.btn-secondary {
  width: 100%;
  padding: 12px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-delete {
  padding: 8px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary:hover {
  background: #ebebeb;
}

.btn-delete:hover {
  opacity: 0.9;
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
  transition: transform 0.2s;
}

.history-item:hover {
  transform: translateY(-2px);
}

.history-item.important {
  border-left: 4px solid var(--primary-color);
}

.history-item.scheduled {
  border-left: 4px solid #ffd700;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
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
  word-break: break-word;
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
</style>