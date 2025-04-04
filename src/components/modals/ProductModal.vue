<!-- src/components/modals/ProductModal.vue -->
<template>
  <div class="modal-overlay" v-if="show" @click="closeModal">
    <div class="modal-container" @click.stop :style="{ background: product ? product.gradient : '' }">
      <button class="modal-close" @click="closeModal">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div v-if="product" class="modal-content">
        <img :src="getProductImage(product)" :alt="product.name" class="modal-image">

        <h2 class="modal-title">{{ product.name }}</h2>

        <div class="modal-description">
          <p>{{ product.description }}</p>
        </div>

        <div class="modal-income">
          <span class="income-label">💰 {{ formatMoney(product.requiredIncome) }}</span>
        </div>

        <button
            class="modal-button"
            :disabled="!isProductAvailable(product) || product.claimed"
            @click="activateProduct"
        >
          <span v-if="product.claimed">Уже активировано</span>
          <span v-else-if="isProductAvailable(product)">Активировать</span>
          <span v-else>Недоступно</span>
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
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'activate'])

const store = useGameStore()
const { user } = useTelegram()
const notifications = inject('notifications')

// Проверка доступности продукта
const isProductAvailable = (product) => {
  return store.passiveIncome >= product.requiredIncome
}

// Закрытие модального окна
const closeModal = () => {
  emit('close')
}

// Активация продукта
const activateProduct = async () => {
  if (!props.product) return

  const product = props.product

  if (product.claimed) {
    notifications.addNotification({
      message: 'Вы уже активировали этот продукт',
      type: 'info'
    })
    return
  }

  if (!isProductAvailable(product)) {
    notifications.addNotification({
      message: `Необходим пассивный доход ${formatMoney(product.requiredIncome)} в месяц`,
      type: 'error'
    })
    return
  }

  // Получаем данные пользователя для заявки
  const userData = user.value ? {
    telegramId: user.value.id,
    username: user.value.username,
    firstName: user.value.first_name,
    lastName: user.value.last_name
  } : null

  if (!userData) {
    notifications.addNotification({
      message: 'Ошибка: не удалось получить данные пользователя',
      type: 'error'
    })
    return
  }

  try {
    // Отправка заявки на сервер
    const response = await axios.post(`${API_URL}/products/claim`, {
      userId: userData.telegramId,
      userData: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        username: userData.username
      },
      productId: product._id
    })

    if (response.data.success) {
      // Показываем уведомление пользователю
      notifications.addNotification({
        message: 'Продукт активирован! Наши менеджеры свяжутся с вами в ближайшее время.',
        type: 'success',
        duration: 5000
      })

      // Сообщаем родительскому компоненту, что продукт активирован
      emit('activate', { ...product, claimed: true })

      // Закрываем модальное окно после активации
      setTimeout(() => {
        closeModal()
      }, 1500)
    } else {
      notifications.addNotification({
        message: 'Ошибка активации продукта',
        type: 'error'
      })
    }
  } catch (error) {
    console.error('Ошибка активации продукта:', error)
    notifications.addNotification({
      message: 'Не удалось отправить заявку на активацию продукта',
      type: 'error'
    })
  }
}

// Получение изображения продукта
const getProductImage = (product) => {
  if (!product.image) return '/images/products/default.png'
  return product.image
}

// Форматирование чисел
const formatMoney = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
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

.modal-income {
  margin-bottom: 24px;
}

.income-label {
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