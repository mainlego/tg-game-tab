<!-- src/components/modals/TaskModal.vue -->
<template>
  <div class="modal-overlay" v-if="show" @click="closeModal">
    <div class="modal-container" @click.stop>
      <button class="modal-close" @click="closeModal">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div v-if="task" class="modal-content">
        <img :src="getTaskIcon(task)" :alt="task.title" class="modal-image">

        <h2 class="modal-title">{{ task.title }}</h2>

        <div class="modal-description">
          <p>{{ task.description }}</p>
        </div>

        <div class="modal-reward">
          <span class="reward-label">💰 +{{ task.reward }} монет</span>
        </div>

        <button
            class="modal-button"
            :disabled="task.completed"
            @click="completeTask"
        >
          <span v-if="task.completed">Задание выполнено</span>
          <span v-else>Выполнить задание</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, inject } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useTelegram } from '@/composables/useTelegram'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://tg-game-tab-server.onrender.com/api'
const BASE_URL = 'https://tg-game-tab-server.onrender.com'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'complete'])

const store = useGameStore()
const { user } = useTelegram()
const notifications = inject('notifications')

// Получение полного URL для иконки задания
const getTaskIcon = (task) => {
  if (!task.icon) return '/images/tasks/default.png'

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

// Закрытие модального окна
const closeModal = () => {
  emit('close')
}

// Выполнение задания
const completeTask = async () => {
  if (!props.task || props.task.completed) {
    notifications.addNotification({
      message: 'Задание уже выполнено',
      type: 'info'
    })
    return
  }

  // Если есть ссылка, открываем ее
  if (props.task.link) {
    window.open(props.task.link, '_blank')
  }

  try {
    // Отправляем запрос на сервер о выполнении задания, если есть пользователь
    if (user.value?.id) {
      const response = await axios.post(`${API_URL}/tasks/complete`, {
        userId: user.value.id,
        taskId: props.task._id
      })

      if (response.data.success) {
        // Сообщаем о выполнении задания
        emit('complete', {
          ...props.task,
          completed: true
        })

        // Закрываем модальное окно через некоторое время
        setTimeout(() => {
          closeModal()
        }, 1500)
      } else {
        notifications.addNotification({
          message: 'Ошибка выполнения задания',
          type: 'error'
        })
      }
    } else {
      // Для локального тестирования без сервера
      emit('complete', {
        ...props.task,
        completed: true
      })

      // Закрываем модальное окно через некоторое время
      setTimeout(() => {
        closeModal()
      }, 1500)
    }
  } catch (error) {
    console.error('Ошибка выполнения задания:', error)
    notifications.addNotification({
      message: 'Ошибка выполнения задания',
      type: 'error'
    })
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-container {
  width: 100%;
  border-radius: 24px 24px 0 0;
  padding: 24px;
  position: relative;
  box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.3);
  color: white;
  animation: slideUp 0.4s ease;
  margin-bottom: 0;
  background: linear-gradient(140.83deg, rgb(140, 96, 227) 0%, rgb(73, 51, 131) 100%);
}

.modal-close {
  position: absolute;
  right: 16px;
  top: 16px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.modal-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

.modal-description {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.modal-reward {
  margin-bottom: 24px;
}

.reward-label {
  font-size: 24px;
  font-weight: 700;
  color: #FFD700;
}

.modal-button {
  background: linear-gradient(140.83deg, rgb(155, 105, 254) 0%, rgb(109, 67, 196) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.modal-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>