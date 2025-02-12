<!-- src/pages/Tasks.vue -->
<template>
  <div class="tasks-page">
    <Header />
    <Balance />

    <div class="tasks-container">
      <!-- Ежедневные задания -->
      <div class="section">
        <h2 class="section-title">Ежедневные задания</h2>
        <div class="tasks-list">
          <div
              v-for="task in dailyTasks"
              :key="task.id"
              class="task-item"
              :class="{ 'completed': task.completed }"
              @click="handleTaskClick(task)"
          >
            <div class="task-icon">
              <img :src="task.icon" :alt="task.title">
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
      <div class="section">
        <h2 class="section-title">Список заданий</h2>
        <div class="tasks-list">
          <div
              v-for="task in regularTasks"
              :key="task.id"
              class="task-item"
              :class="{ 'completed': task.completed }"
              @click="handleTaskClick(task)"
          >
            <div class="task-icon">
              <img :src="task.icon" :alt="task.title">
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
      <div class="section">
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
              :key="task.id"
              class="task-item"
              :class="{ 'completed': task.completed }"
              @click="handleTaskClick(task)"
          >
            <div class="task-icon">
              <img :src="task.icon" :alt="task.title">
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
import { ref, inject } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import Header from '@/components/layout/Header.vue'
import Balance from '@/components/game/Balance.vue'
import Navigation from '@/components/layout/Navigation.vue'

const store = useGameStore()
const notifications = inject('notifications')
const platformProgress = ref(3) // Текущий прогресс платформы

// Ежедневные задания
const dailyTasks = ref([
  {
    id: 1,
    title: 'Как заработать свой первый миллион',
    icon: '../assets/images/youtube.png',
    reward: 567,
    completed: false
  }
])

// Постоянные задания
const regularTasks = ref([
  {
    id: 2,
    title: 'Подписаться в Instagram',
    icon: '../assets/images/instagram.png',
    reward: 567,
    completed: false
  },
  {
    id: 3,
    title: 'Подписаться в Телеграм',
    icon: '../assets/images/telegram.png',
    reward: 567,
    completed: false
  }
])

// Задания платформы
const platformTasks = ref([
  {
    id: 4,
    title: 'Зарегистрируйтесь на платформе CWI',
    icon: '../assets/images/tasks/1.png',
    reward: 567,
    completed: false
  },
  {
    id: 5,
    title: 'Пройдите краткий курс обучения',
    icon: '../assets/images/tasks/2.png',
    reward: 567,
    completed: false
  },
  {
    id: 6,
    title: 'Сделайте первый минимальный депозит',
    icon: '../assets/images/tasks/3.png',
    reward: 567,
    completed: false
  },
  // ... остальные задания платформы
])

// Обработка клика по заданию
const handleTaskClick = (task) => {
  if (!task.completed) {
    // В реальном приложении здесь будет проверка выполнения задания
    task.completed = true
    store.balance += task.reward
    notifications.addNotification({
      message: `Получено ${task.reward} монет!`,
      type: 'success'
    })

    // Обновляем прогресс платформы если это задание платформы
    if (platformTasks.value.includes(task)) {
      platformProgress.value = Math.min(12, platformProgress.value + 1)
    }
  }
}
</script>

<style scoped>
.tasks-page {
  min-height: 100vh;
  padding: 0 1rem;
  padding-bottom: 80px;
  background: url('@/assets/images/bg.jpg') center top no-repeat;
}

.tasks-container {
  margin-top: 20px;
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
</style>