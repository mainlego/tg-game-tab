<!-- src/components/admin/NotificationsSection.vue -->
<template>
  <div class="notifications-section">
    <div class="section-header">
      <h2>Управление уведомлениями</h2>
    </div>

    <div class="notifications-layout">
      <!-- Форма отправки уведомления -->
      <BaseCard class="notification-composer">
        <h3>Отправить уведомление</h3>
        <BaseForm @submit="sendNotification">
          <FormGroup label="Тип уведомления">
            <select v-model="newNotification.type" class="form-input">
              <option value="all">Всем пользователям</option>
              <option value="level">По уровню</option>
              <option value="income">По доходу</option>
            </select>
          </FormGroup>

          <FormGroup
              v-if="newNotification.type === 'level'"
              label="Минимальный уровень"
          >
            <input
                type="number"
                v-model.number="newNotification.minLevel"
                class="form-input"
                min="1"
            >
          </FormGroup>

          <FormGroup
              v-if="newNotification.type === 'income'"
              label="Минимальный доход"
          >
            <input
                type="number"
                v-model.number="newNotification.minIncome"
                class="form-input"
                min="0"
                step="1000"
            >
          </FormGroup>

          <FormGroup label="Сообщение">
            <textarea
                v-model="newNotification.message"
                class="form-input"
                rows="4"
                placeholder="Введите текст сообщения..."
            ></textarea>
          </FormGroup>

          <FormGroup label="Кнопка в сообщении (опционально)">
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
          </FormGroup>

          <FormGroup>
            <label class="checkbox-label">
              <input
                  type="checkbox"
                  v-model="newNotification.important"
              >
              Важное уведомление
            </label>
          </FormGroup>

          <div class="preview-section">
            <h4>Предпросмотр сообщения</h4>
            <div class="preview-message">
              <div v-html="previewMessage"></div>
              <BaseButton
                  v-if="hasButton"
                  type="secondary"
                  @click.prevent
              >
                {{ newNotification.button.text }}
              </BaseButton>
            </div>
          </div>

          <div class="action-buttons">
            <BaseButton
                type="secondary"
                @click="sendTestNotification"
                :disabled="!newNotification.message"
            >
              Тестовая отправка
            </BaseButton>
            <BaseButton
                type="primary"
                @click="sendNotification"
                :disabled="!newNotification.message"
            >
              {{ scheduledDate ? 'Запланировать' : 'Отправить' }}
            </BaseButton>
          </div>
        </BaseForm>
      </BaseCard>

      <!-- История уведомлений -->
      <BaseCard class="notifications-history">
        <div class="history-header">
          <h3>История уведомлений</h3>
          <select v-model="historyFilter" class="form-input">
            <option value="all">Все уведомления</option>
            <option value="scheduled">Запланированные</option>
            <option value="sent">Отправленные</option>
            <option value="important">Важные</option>
          </select>
        </div>

        <LoadingSpinner v-if="loading" />

        <div v-else class="history-list">
          <div
              v-for="notification in filteredHistory"
              :key="notification.id"
              class="notification-item"
              :class="{
              'important': notification.important,
              'scheduled': notification.status === 'scheduled'
            }"
          >
            <div class="notification-header">
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

            <NotificationStats
                v-if="notification.status === 'sent'"
                :stats="notification.stats"
            />

            <div
                v-if="notification.status === 'scheduled'"
                class="notification-actions"
            >
              <BaseButton
                  type="secondary"
                  @click="editNotification(notification)"
              >
                Редактировать
              </BaseButton>
              <BaseButton
                  type="danger"
                  @click="cancelNotification(notification)"
              >
                Отменить
              </BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { ApiService } from '@/services/apiService'
import { useTelegram } from '@/composables/useTelegram'

// Импортируем новые базовые компоненты
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseForm from '@/components/ui/BaseForm.vue'
import FormGroup from '@/components/ui/FormGroup.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import NotificationStats from '@/components/admin/NotificationStats.vue'

const { user } = useTelegram()
const notifications = inject('notifications')

// Добавляем состояние загрузки
const loading = ref(false)
const error = ref(null)

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
    loading.value = true
    error.value = null
    const data = await ApiService.getNotificationsHistory()
    notificationsHistory.value = data
  } catch (err) {
    console.error('Error loading notifications history:', err)
    error.value = 'Ошибка загрузки истории уведомлений'
  } finally {
    loading.value = false
  }
}

// Отправка уведомления
const sendNotification = async () => {
  try {
    loading.value = true
    const notificationData = {
      type: newNotification.value.type,
      message: newNotification.value.message,
      important: newNotification.value.important,
      conditions: {
        minLevel: newNotification.value.minLevel,
        minIncome: newNotification.value.minIncome
      },
      button: hasButton.value ? newNotification.value.button : undefined,
      scheduledFor: scheduledDate.value || undefined
    }

    const response = await ApiService.sendNotification(notificationData)

    if (response.success) {
      notifications.addNotification({
        message: 'Уведомление успешно отправлено',
        type: 'success'
      })
      await loadHistory()
      resetForm()
    }
  } catch (error) {
    console.error('Error sending notification:', error)
    notifications.addNotification({
      message: 'Ошибка при отправке уведомления',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Тестовая отправка
const sendTestNotification = async () => {
  if (!user.value?.id) return

  try {
    loading.value = true
    const testData = {
      ...newNotification.value,
      type: 'test',
      testUserId: user.value.id
    }

    await ApiService.sendTestNotification(testData)
    notifications.addNotification({
      message: 'Тестовое уведомление отправлено',
      type: 'success'
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    notifications.addNotification({
      message: 'Ошибка отправки тестового уведомления',
      type: 'error'
    })
  } finally {
    loading.value = false
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
      loading.value = true
      await ApiService.deleteNotification(notification.id)
      await loadHistory()
      notifications.addNotification({
        message: 'Уведомление отменено',
        type: 'success'
      })
    } catch (error) {
      console.error('Error canceling notification:', error)
      notifications.addNotification({
        message: 'Ошибка при отмене уведомления',
        type: 'error'
      })
    } finally {
      loading.value = false
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

// Загрузка данных при монтировании
onMounted(async () => {
  await loadHistory()
})
</script>

<style scoped>
.notifications-section {
  padding: 20px;
}

.notifications-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: 80vh;
  overflow: auto;
}

/* Кнопки действий */
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

/* Предпросмотр сообщения */
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

/* Поля для кнопки */
.button-inputs {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 8px;
}

/* История уведомлений */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.notification-item {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  background: white;
  border: 1px solid #eee;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
}

.status-badge.scheduled { background: #ffd700; color: #000; }
.status-badge.sending { background: #2196f3; color: white; }
.status-badge.sent { background: #4caf50; color: white; }
.status-badge.cancelled { background: #f44336; color: white; }

.notification-message {
  margin: 12px 0;
  line-height: 1.5;
  word-break: break-word;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .notifications-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .notifications-section {
    padding: 10px;
  }

  .button-inputs {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>