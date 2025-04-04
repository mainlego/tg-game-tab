<!-- src/pages/Tasks.vue -->
<template>
  <div class="tasks-page">
    <Header />
    <Balance />

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Загрузка заданий...</p>
    </div>

    <div v-else class="tasks-container">
      <!-- Ежедневные задания -->
      <div v-if="dailyTasks.length > 0" class="section">
        <h2 class="section-title">Ежедневные задания</h2>
        <div class="tasks-list">
          <div
              v-for="task in dailyTasks"
              :key="task._id"
              class="task-item"
              :class="{ 'completed': task.completed }"
              @click="handleTaskClick(task)"
          >
            <div class="task-icon">
              <img :src="getTaskIcon(task)" :alt="task.title">
            </div>
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
            </div>
            <div class="task-reward">
              <img src="@/assets/images/coin.png" alt="coin" class="coin-icon">
              <span>+{{ task.reward }}</span>
            </div>
            <div class="task-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Список постоянных заданий -->
      <div v-if="regularTasks.length > 0" class="section">
        <h2 class="section-title">Список заданий</h2>
        <div class="tasks-list">
          <div
              v-for="task in regularTasks"
              :key="task._id"
              class="task-item"
              :class="{ 'completed': task.completed }"
              @click="handleTaskClick(task)"
          >
            <div class="task-icon">
              <img :src="getTaskIcon(task)" :alt="task.title">
            </div>
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
            </div>
            <div class="task-reward">
              <img src="@/assets/images/coin.png" alt="coin" class="coin-icon">
              <span>+{{ task.reward }}</span>
            </div>
            <div class="task-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Задания платформы -->
      <div v-if="platformTasks.length > 0" class="section">
        <h2 class="section-title">
          Задания платформы
          <div class="platform-progress">
            <div
                v-for="n in 12"
                :key="n"
                class="progress-dot"
                :class="{ 'active': n <= platformProgress }"
            ></div>
          </div>
        </h2>
        <div class="tasks-list">
          <div
              v-for="task in platformTasks"
              :key="task._id"
              class="task-item"
              :class="{ 'completed': task.completed }"
              @click="handleTaskClick(task)"
          >
            <div class="task-icon">
              <img :src="getTaskIcon(task)" :alt="task.title">
            </div>
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
            </div>
            <div class="task-reward">
              <img src="@/assets/images/coin.png" alt="coin" class="coin-icon">
              <span>+{{ task.reward }}</span>
            </div>
            <div class="task-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Navigation />
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useTelegram } from '@/composables/useTelegram'
import Header from '@/components/layout/Header.vue'
import Balance from '@/components/game/Balance.vue'
import Navigation from '@/components/layout/Navigation.vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://tg-game-tab-server.onrender.com/api'
const BASE_URL = 'https://tg-game-tab-server.onrender.com'

const store = useGameStore()
const { user } = useTelegram()
const notifications = inject('notifications')

// Состояние загрузки
const loading = ref(true)
const error = ref(null)

// Прогресс выполнения заданий платформы
const platformProgress = ref(0)

// Списки заданий
const dailyTasks = ref([])
const regularTasks = ref([])
const platformTasks = ref([])

// Загрузка заданий из API
const fetchTasks = async () => {
  try {
    loading.value = true

    // Загружаем все задания
    const response = await axios.get(`${API_URL}/admin/tasks`)

    if (response.data.success) {
      const tasksData = response.data.data

      // Если у нас есть активный пользователь, загружаем его завершенные задания
      const completedTaskIds = []
      if (user.value?.id) {
        try {
          const userTasksResponse = await axios.get(`${API_URL}/tasks/user/${user.value.id}`)
          if (userTasksResponse.data.success) {
            userTasksResponse.data.data.forEach(task => {
              completedTaskIds.push(task.taskId)
            })
          }
        } catch (err) {
          console.error('Ошибка загрузки завершенных заданий пользователя:', err)
        }
      }

      // Разделяем задания по типам и отмечаем выполненные
      dailyTasks.value = tasksData
          .filter(task => task.type === 'daily' && task.active)
          .map(task => ({
            ...task,
            completed: completedTaskIds.includes(task._id)
          }))

      regularTasks.value = tasksData
          .filter(task => task.type === 'achievement' && task.active)
          .map(task => ({
            ...task,
            completed: completedTaskIds.includes(task._id)
          }))

      platformTasks.value = tasksData
          .filter(task => task.type === 'platform' && task.active)
          .map(task => ({
            ...task,
            completed: completedTaskIds.includes(task._id)
          }))

      // Обновляем прогресс платформы
      platformProgress.value = platformTasks.value.filter(task => task.completed).length
    } else {
      error.value = 'Не удалось загрузить задания'
      notifications.addNotification({
        message: 'Ошибка загрузки заданий',
        type: 'error'
      })
    }
  } catch (err) {
    console.error('Ошибка загрузки заданий:', err)
    error.value = 'Не удалось загрузить задания'
    notifications.addNotification({
      message: 'Ошибка загрузки заданий',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Получение полного URL для иконки задания
const getTaskIcon = (task) => {
  if (!task.icon) return '@/assets/images/tasks/default.png'

  // Если это относительный путь к иконке
  if (task.icon.startsWith('/')) {
    return `${BASE_URL}${task.icon}`
  }

  // Если это URL
  if (task.icon.startsWith('http')) {
    return task.icon
  }

  // Если это путь из фронтенда
  if (task.icon.includes('images/') || task.icon.includes('assets/')) {
    return task.icon
  }

  // Иначе добавляем BASE_URL
  return `${BASE_URL}/${task.icon}`
}

// Обработка клика по заданию
const handleTaskClick = async (task) => {
  if (task.completed) {
    notifications.addNotification({
      message: 'Задание уже выполнено',
      type: 'info'
    })
    return
  }

  // Если есть ссылка, открываем ее
  if (task.link) {
    // Открываем ссылку в новом окне
    window.open(task.link, '_blank')

    // Отмечаем задание как выполненное (можно добавить проверку успешного выполнения)
    try {
      // Отправляем запрос на сервер о выполнении задания
      if (user.value?.id) {
        const response = await axios.post(`${API_URL}/tasks/complete`, {
          userId: user.value.id,
          taskId: task._id
        })

        if (response.data.success) {
          // Отмечаем задание как выполненное
          task.completed = true

          // Обновляем баланс пользователя
          store.balance += task.reward

          // Показываем уведомление
          notifications.addNotification({
            message: `Получено ${task.reward} монет!`,
            type: 'success'
          })

          // Обновляем прогресс платформы, если это задание платформы
          if (task.type === 'platform') {
            platformProgress.value += 1
          }
        } else {
          notifications.addNotification({
            message: 'Ошибка выполнения задания',
            type: 'error'
          })
        }
      }
    } catch (err) {
      console.error('Ошибка выполнения задания:', err)
      notifications.addNotification({
        message: 'Ошибка выполнения задания',
        type: 'error'
      })
    }
  } else {
    // Если нет ссылки, просто отмечаем задание как выполненное
    task.completed = true
    store.balance += task.reward
    notifications.addNotification({
      message: `Получено ${task.reward} монет!`,
      type: 'success'
    })

    // Обновляем прогресс платформы, если это задание платформы
    if (task.type === 'platform') {
      platformProgress.value += 1
    }
  }
}

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.tasks-page {
  min-height: 100vh;
  padding: 78px 0  80px 0;
  background: url('@/assets/images/bg.jpg') center top no-repeat;
}

.tasks-container {
  margin-top: 20px;
  padding: 0 1rem 150px 1rem;
  overflow: scroll;
  height: 70vh;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.platform-progress {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.progress-dot.active {
  background: var(--primary-color);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  background: none;
  border: 1px solid rgba(140, 96, 227, 0.3);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: rgba(140, 96, 227, 0.1);
}

.task-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
}

.task-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.task-reward {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
}

.coin-icon {
  width: 16px;
  height: 16px;
}

.task-arrow {
  color: rgba(255, 255, 255, 0.5);
}

.task-item.completed {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Стили для отображения загрузки */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>