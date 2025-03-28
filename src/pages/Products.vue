<!-- src/pages/Products.vue -->
<template>
  <div class="products-page">
    <Header />
    <Balance />

    <div class="products-grid">
      <div
          v-for="product in products"
          :key="product.id"
          class="product-card"
          :class="{ 'product-available': isProductAvailable(product) }"
          :style="{ background: product.gradient }"
          @click="handleProductClick(product)"
      >
        <img :src="product.image" :alt="product.title" class="product-image">
        <div class="product-title">{{ product.title }}</div>
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
          <img :src="selectedProduct.image" :alt="selectedProduct.title" class="modal-image">

          <h2 class="modal-title">{{ selectedProduct.title }}</h2>

          <div class="modal-description">
            <!-- Динамическое описание в зависимости от продукта -->
            <p v-if="selectedProduct.id === 1">
              Хочешь в путешествие мечты? Мы дарим шанс
              выиграть незабываемую поездку в Дубай! 🏙️🌴 ☀️
              Билеты туда и обратно + 5-звездочный отель на 5
              дней! ☀️ Для того чтобы наслаждаться пляжами,
              шопингом и лучшими достопримечательностями
              Дубая. ☀️✨ Уровень счастья для участия в
              розыгрыше {{ formatMoney(selectedProduct.requiredIncome) }} единиц.
            </p>
            <p v-else-if="selectedProduct.id === 2">
              Хочешь новый iPhone? Участвуй в нашем розыгрыше и получи шанс
              выиграть новейшую модель! 📱✨ Уровень счастья для участия в
              розыгрыше {{ formatMoney(selectedProduct.requiredIncome) }} единиц.
            </p>
            <!-- Для других продуктов -->
            <p v-else>
              Для получения доступа к "{{ selectedProduct.title }}" необходим
              пассивный доход {{ formatMoney(selectedProduct.requiredIncome) }} единиц.
            </p>
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
import { ref, inject } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useTelegram } from '@/composables/useTelegram'
import Header from '@/components/layout/Header.vue'
import Balance from '@/components/game/Balance.vue'
import Navigation from '@/components/layout/Navigation.vue'

const store = useGameStore()
const { user } = useTelegram()
const notifications = inject('notifications')

// Состояние модального окна
const showModal = ref(false)
const selectedProduct = ref(null)

const products = ref([
  {
    id: 1,
    title: 'Участие в розыгрыше BMW M5',
    image: '/images/products/1.png',
    requiredIncome: 1000000000,
    gradient: 'linear-gradient(140.83deg, rgb(111, 95, 242) 0%, rgb(73, 51, 131) 100%)',
    claimed: false
  },
  {
    id: 2,
    title: 'Участие в розыгрыше iPhone',
    image: '/images/products/2.png',
    requiredIncome: 100000000,
    gradient: 'linear-gradient(140.83deg, rgb(242, 95, 95) 0%, rgb(131, 51, 51) 100%)',
    claimed: false
  },
  {
    id: 3,
    title: 'Финансовая диагностика',
    image: '/images/products/3.png',
    requiredIncome: 10000000,
    gradient: 'linear-gradient(140.83deg, rgb(95, 135, 242) 0%, rgb(51, 71, 131) 100%)',
    claimed: false
  },
  {
    id: 4,
    title: 'Денежный марафон',
    image: '/images/products/4.png',
    requiredIncome: 1000000,
    gradient: 'linear-gradient(140.83deg, rgb(95, 242, 169) 0%, rgb(51, 131, 94) 100%)',
    claimed: false
  },
  {
    id: 5,
    title: 'Вебинар о пассивном доходе',
    image: '/images/products/5.png',
    requiredIncome: 500000,
    gradient: 'linear-gradient(140.83deg, rgb(242, 95, 156) 0%, rgb(131, 51, 87) 100%)',
    claimed: false
  },
  {
    id: 6,
    title: 'Инвест клуб по подписке',
    image: '/images/products/6.png',
    requiredIncome: 200000,
    gradient: 'linear-gradient(140.83deg, rgb(242, 162, 95) 0%, rgb(131, 90, 51) 100%)',
    claimed: false
  }
])

const isProductAvailable = (product) => {
  return store.passiveIncome >= product.requiredIncome
}

const handleProductClick = (product) => {
  // Вместо уведомления открываем модальное окно
  selectedProduct.value = product
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
}

const activateProduct = () => {
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

  // Получаем данные пользователя для уведомления
  const userData = user.value ? {
    telegramId: user.value.id,
    username: user.value.username,
    firstName: user.value.first_name,
    lastName: user.value.last_name
  } : null

  // Здесь будет отправка данных в админку
  console.log('Активация продукта:', {
    productId: product.id,
    productTitle: product.title,
    user: userData,
    passiveIncome: store.passiveIncome,
    timestamp: new Date()
  })

  // Помечаем продукт как активированный
  const productIndex = products.value.findIndex(p => p.id === product.id)
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