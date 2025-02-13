<!-- src/pages/Growth.vue -->
<template>
  <div class="growth-page">
    <Header />


    <div class="main__container">
    <Balance />

    <div class="investments-container">
      <!-- Табы категорий -->
      <div class="investment-tabs">
        <button
            v-for="category in categories"
            :key="category.id"
            class="tab"
            :class="{ active: currentCategory === category.id }"
            @click="currentCategory = category.id"
        >
          {{ category.title }}
        </button>
      </div>

      <!-- Сетка инвестиций -->
      <div class="grid-scroll">
        <div class="investment-grid">
          <div
              v-for="investment in currentInvestments"
              :key="investment.id"
              class="investment-card"
              :class="{ disabled: !canBuyInvestment(investment) }"
              @click="handleInvestment(investment)"
          >
            <div class="card-image">
              <img :src="investment.image" :alt="investment.name">
            </div>
            <div class="card-info">
              <h3>{{ investment.name }}</h3>

              <div class="income-info">
                <div>Пассивный доход в месяц</div>
                <div class="income-amount">
                  <img src="../assets/images/coin.png" class="passive__income_cart" alt="coin">
                  <span>+{{ formatMoney(calculateIncome(investment)) }}</span>
                </div>
              </div>

            </div>

            <div class="card-footer">
              <div class="level">lvl {{ investment.level }}</div>
              <div class="price">
                <img src="../assets/images/coin.png" class="price_cart" alt="coin">
                <span>{{ formatMoney(investment.cost) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <Navigation />
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import Header from '@/components/layout/Header.vue'
import Balance from '@/components/game/Balance.vue'
import Navigation from '@/components/layout/Navigation.vue'
import { investmentsData } from '@/data/investmentsData'

const store = useGameStore()
const notifications = inject('notifications')
const currentCategory = ref('finances')

// Категории инвестиций
const categories = [
  { id: 'finances', title: 'Финансы' },
  { id: 'technology', title: 'Технологии' },
  { id: 'business', title: 'Бизнес' },
  { id: 'realestate', title: 'Недвижимость' }
]

// Текущие инвестиции
const currentInvestments = computed(() => {
  const categoryData = investmentsData[currentCategory.value]
  if (!categoryData) return []

  return categoryData.items.filter(item =>
      store.level.current >= checkRequiredLevel(item.required_level)
  )
})

// Проверка возможности покупки
const canBuyInvestment = (investment) => {
  return store.balance >= investment.cost
}

// Расчет дохода от инвестиции
const calculateIncome = (investment) => {
  const baseIncome = investment.baseIncome
  const level = investment.level
  const type = investment.type || investmentsData[currentCategory.value].type

  let calculatedIncome
  switch(type) {
    case 'linear':
      calculatedIncome = baseIncome * Math.pow(investment.multiplier, level)
      break
    case 'parabolic':
      const bonus = baseIncome * (investment.bonus_percent || 0) * store.level.current
      calculatedIncome = (baseIncome * Math.pow(investment.multiplier, level)) + bonus
      break
    case 'exponential':
      calculatedIncome = baseIncome * Math.pow(investment.multiplier, level * store.level.current)
      break
    case 'inverse_parabolic':
      const decay = 1 / (1 + (store.level.current / 10))
      calculatedIncome = baseIncome * Math.pow(investment.multiplier, level) * decay
      break
    default:
      calculatedIncome = baseIncome
  }

  return Math.max(0, calculatedIncome)
}

// Обработка покупки инвестиции
const handleInvestment = (investment) => {
  if (!canBuyInvestment(investment)) {
    notifications.addNotification({
      message: 'Недостаточно монет',
      type: 'error'
    })
    return
  }

  const income = calculateIncome(investment)
  const success = store.purchaseInvestment(investment, income)

  if (success) {
    notifications.addNotification({
      message: `Вы приобрели ${investment.name}`,
      type: 'success'
    })
  }
}

// Проверка требуемого уровня
const checkRequiredLevel = (requiredLevel) => {
  if (typeof requiredLevel === 'number') {
    return requiredLevel
  }

  if (typeof requiredLevel === 'string') {
    try {
      return new Function(`return ${requiredLevel.replace('n', store.level.current)}`)()
    } catch (error) {
      console.error('Ошибка вычисления уровня:', error)
      return Infinity
    }
  }

  return Infinity
}

// Форматирование чисел
const formatMoney = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
</script>


<style scoped>
.growth-page {
  min-height: 100vh;
  padding-top: 48px;
  background: url('@/assets/images/bg-2.jpg') center top no-repeat;
}

.investments-container {
  margin-top: 20px;
  height: 100vh;
}

.investment-tabs {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.tab {
  padding: 8px 4px;
  border: none;
  border-radius: 8px;
  background: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab.active {
  background: var(--primary-color);
}

.grid-scroll {
  overflow: auto;
  max-height: 55vh;
}

.investment-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.investment-card {
  display: flex;
  flex-wrap: wrap;
  background: #422263f7;
  border-radius: 12px;
  padding: 10px 0 5px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.investment-card:not(.disabled):hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.investment-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-image img {
  width: 59px;
  height: 57px;
  margin-right: 10px;
  object-fit: cover;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;

}

.card-info h3 {
  color: white;
  font-size: 9px;
  margin: 0 0 4px 0;
}

.income-info div {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  font-size: 7px;
  line-height: 8.8px;
}
.income-info span{
  font-size: 12px;
}

.income-amount {
  display: flex;
  align-items: center;
  margin-top: 3px;
  gap: 4px;
  font-size: 14px;
}
.income-amount span{
  color: white;
}

.card-footer {
  width: 100%;
  height: 24px;
  margin-top: 5px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  position: relative;
}

.card-footer::after{
  content: '';
  position: absolute;
  left: -10px;
  top: 0;
  height: 1px;
  width: 169px;
  background: rgba(255, 255, 255, 0.1);

}

.level {
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-content: center;
  align-items: center;
  padding-right: 10px;
  margin-right: 10px;
  height: 100%;
  font-size: 12px;
  border-right: solid 1px rgba(255, 255, 255, 0.1);
}

.price {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  line-height: 15.4px;



}
.passive__income_cart{
  width: 12px;
  height: 12px;
}
.price_cart{
  width: 17px;
  height: 17px;
}
.main__container{
  padding: 0 1rem;
  border-top: 4px solid var(--primary-color);
  border-radius: 40px 40px 0 0;
  background: url("../../images/bg.jpg");
  margin-top: 20px;
}


</style>