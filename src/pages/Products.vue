<!-- src/pages/Products.vue -->
<template>
  <div class="products-page">
    <Header />
    <Balance />

    <div class="products-grid" v-if="!loading">
      <div
          v-for="product in products"
          :key="product._id"
          class="product-card"
          :class="{ 'product-available': isProductAvailable(product) }"
          :style="{ background: product.gradient }"
          @click="handleProductClick(product)"
      >
        <img :src="product.image" :alt="product.name" class="product-image">
        <div class="product-title">{{ product.name }}</div>
        <div class="product-income">
          <span>Необходимый доход</span>
          <div class="income-amount">
            <img src="/images/coin.png" alt="coin" class="passive__income_cart">
            <span>{{ formatMoney(product.requiredIncome) }}</span>
          </div>
        </div>

        <div class="product-status" v-if="product.claimed">
          Активировано
        </div>
        <div class="product-status" v-else-if="isProductAvailable(product)">
          Доступно
        </div>
        <div class="product-status locked" v-else>
          Заблокировано
        </div>
      </div>
    </div>

    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>Загрузка продуктов...</p>
    </div>

    <!-- Модальное окно -->
    <div class="modal-overlay" v-if="showModal" @click="closeModal">
      <div class="modal-container" @click.stop :style="{ background: selectedProduct ? selectedProduct.gradient : '' }">
        <button class="modal-close" @click="closeModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div v-if="selectedProduct" class="modal-content">
          <img :src="selectedProduct.image" :alt="selectedProduct.name" class="modal-image">

          <h2 class="modal-title">{{ selectedProduct.name }}</h2>

          <div class="modal-description">
            <p>{{ selectedProduct.description }}</p>
          </div>

          <div class="modal-income">
            <span class="income-label">💰 {{ formatMoney(selectedProduct.requiredIncome) }}</span>
          </div>

          <button
              class="modal-button"
              :disabled="!isProductAvailable(selectedProduct) || selectedProduct.claimed"
              @click="activateProduct"
          >
            <span v-if="selectedProduct.claimed">Уже активировано</span>
            <span v-else-if="isProductAvailable(selectedProduct)">Активировать</span>
            <span v-else>Недоступно</span>
          </button>
        </div>
      </div>
    </div>

    <Navigation />
  </div>
</template>

<script setup>
import { ref, inject, onMounted, computed } from 'vue'
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

// Состояние модального окна
const showModal = ref(false)
const selectedProduct = ref(null)

// Продукты из базы данных
const products = ref([])
// Заявки пользователя на активацию продуктов
const userClaims = ref([])

// Загрузка продуктов
const fetchProducts = async () => {
  try {
    loading.value = true
    const response = await axios.get(`${API_URL}/admin/products`)

    if (response.data.success) {
      const productsData = response.data.data

      // Если у нас есть активный пользователь, получаем его заявки на продукты
      if (user.value?.id) {
        await fetchUserClaims(user.value.id)
      }

      // Объединяем информацию о продуктах с информацией о заявках
      // И добавляем полный путь к изображениям
      products.value = productsData.map(product => {
        const userClaim = userClaims.value.find(claim => claim.productId === product._id)
        return {
          ...product,
          claimed: !!userClaim,
          image: getFullImageUrl(product.image)
        }
      }).filter(product => product.active)
    } else {
      error.value = 'Не удалось загрузить продукты'
      notifications.addNotification({
        message: 'Ошибка загрузки продуктов',
        type: 'error'
      })
    }
  } catch (err) {
    console.error('Ошибка загрузки продуктов:', err)
    error.value = 'Не удалось загрузить продукты'
    notifications.addNotification({
      message: 'Ошибка загрузки продуктов',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Загрузка заявок пользователя
const fetchUserClaims = async (userId) => {
  try {
    // Запрос на получение заявок пользователя
    const response = await axios.get(`${API_URL}/products/claims/user/${userId}`)

    if (response.data.success) {
      userClaims.value = response.data.data
    }
  } catch (err) {
    console.error('Ошибка загрузки заявок пользователя:', err)
    // Просто логируем ошибку, но не прерываем работу
  }
}

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchProducts()
})

const isProductAvailable = (product) => {
  return store.passiveIncome >= product.requiredIncome
}

const handleProductClick = (product) => {
  // Открываем модальное окно с выбранным продуктом
  selectedProduct.value = product
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
}

const activateProduct = async () => {
  if (!selectedProduct.value) return

  const product = selectedProduct.value

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
      // Помечаем продукт как активированный
      product.claimed = true

      // Обновляем состояние в интерфейсе
      const productIndex = products.value.findIndex(p => p._id === product._id)
      if (productIndex !== -1) {
        products.value[productIndex].claimed = true
        selectedProduct.value = products.value[productIndex]
      }

      // Показываем уведомление пользователю
      notifications.addNotification({
        message: 'Продукт активирован! Наши менеджеры свяжутся с вами в ближайшее время.',
        type: 'success',
        duration: 5000
      })

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

// Преобразование относительных URL изображений в абсолютные
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return '/images/products/default.png';

  // Если URL уже полный, возвращаем как есть
  if (imageUrl.startsWith('http')) return imageUrl;

  // Если URL начинается с /, это локальный URL
  if (imageUrl.startsWith('/')) {
    return `${BASE_URL}${imageUrl}`;
  }

  // Добавляем / если его нет
  return `${BASE_URL}/${imageUrl}`;
}

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
.products-page {
  min-height: 100vh;
  padding: 78px 0  80px 0;
  background: url('/images/bg-2.jpg') center top no-repeat;
}

.products-grid {
  display: grid;
  max-height: 70vh;
  overflow: scroll;
  padding: 0 1rem 150px 1rem;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.product-card {
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 12px;
  position: relative;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.product-card.product-available {
  opacity: 1;
  cursor: pointer;
}

.product-card.product-available:hover {
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 8px;
}

.product-title {
  margin: 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.product-income {
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.product-income span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.income-amount {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-top: 4px;
}

.passive__income_cart {
  width: 16px;
  height: 16px;
}

.product-status {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(76, 175, 80, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.product-status.locked {
  background: rgba(255, 255, 255, 0.2);
}

/* Стили модального окна */
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

@media (max-width: 480px) {
  .products-grid {
    gap: 12px;
  }

  .product-card {
    padding: 8px;
  }

  .product-title {
    font-size: 12px;
    margin: 8px 0;
  }

  .income-amount {
    font-size: 14px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-description {
    font-size: 14px;
  }
}
</style>