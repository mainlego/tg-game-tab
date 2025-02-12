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
          :style="{ '--card-gradient': product.gradient }"
      >
        <img :src="product.image" :alt="product.title" class="product-image">
        <div class="product-title">{{ product.title }}</div>
        <div class="product-income">
          <span>Пассивный доход</span>
          <div class="income-amount">{{ product.income }}</div>
        </div>
      </div>
    </div>

    <Navigation />
  </div>
</template>

<script setup>
import Header from '@/components/layout/Header.vue'
import Balance from '@/components/game/Balance.vue'
import Navigation from '@/components/layout/Navigation.vue'

const products = [
  {
    id: 1,
    title: 'Участие в розыгрыше BMW M5',
    image: '../assets/images/products/1.png',
    income: '1 000 000 000',
    gradient: 'linear-gradient(140.83deg, rgb(111, 95, 242) 0%, rgb(73, 51, 131) 100%)'
  },
  {
    id: 2,
    title: 'Участие в розыгрыше iPhone',
    image: '../assets/images/products/2.png',
    income: '100 000 000',
    gradient: 'linear-gradient(140.83deg, rgb(242, 95, 95) 0%, rgb(131, 51, 51) 100%)'
  },
  {
    id: 3,
    title: 'Финансовая диагностика',
    image: '../assets/images/products/3.png',
    income: '10 000 000',
    gradient: 'linear-gradient(140.83deg, rgb(95, 135, 242) 0%, rgb(51, 71, 131) 100%)'
  },
  {
    id: 4,
    title: 'Денежный марафон',
    image: '../assets/images/products/4.png',
    income: '1 000 000',
    gradient: 'linear-gradient(140.83deg, rgb(95, 242, 169) 0%, rgb(51, 131, 94) 100%)'
  },
  {
    id: 5,
    title: 'Вебинар о пассивном доходе',
    image: '../assets/images/products/5.png',
    income: '500 000',
    gradient: 'linear-gradient(140.83deg, rgb(242, 95, 156) 0%, rgb(131, 51, 87) 100%)'
  },
  {
    id: 6,
    title: 'Инвест клуб по подписке',
    image: '../assets/images/products/6.png',
    income: '200 000',
    gradient: 'linear-gradient(140.83deg, rgb(242, 162, 95) 0%, rgb(131, 90, 51) 100%)'
  }
]
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  padding: 0 1rem;
  padding-bottom: 80px;
}

.products-grid {
  display: grid;
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
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-top: 4px;
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