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
          :style="{ '--card-gradient': product.gradient }"
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
  product.claimed = true

  // Показываем уведомление пользователю
  notifications.addNotification({
    message: 'Продукт активирован! Наши менеджеры свяжутся с вами в ближайшее время.',
    type: 'success',
    duration: 5000
  })
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
  padding: 68px 1rem  80px 1rem;
  background: url('/images/bg-2.jpg') center top no-repeat;
}

.products-grid {
  display: grid;
  overflow: auto;
  max-height: 60vh;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.product-card {
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--card-gradient);
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
}
</style>