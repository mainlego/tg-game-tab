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
              <div class="level">lvl {{ getInvestmentLevel(investment) }}</div>
              <div class="price">
                <img src="../assets/images/coin.png" class="price_cart" alt="coin">
                <span>{{ formatMoney(getInvestmentCost(investment)) }}</span>
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
import { ref, computed, inject, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import Header from '@/components/layout/Header.vue'
import Balance from '@/components/game/Balance.vue'
import Navigation from '@/components/layout/Navigation.vue'
import { investmentsData } from '@/data/investmentsData'

const store = useGameStore()
const notifications = inject('notifications')
const logger = inject('logger', {
  log: (...args) => console.log('[Growth]', ...args),
  error: (...args) => console.error('[Growth Error]', ...args)
})

const currentCategory = ref('finances')
const purchasedInvestments = ref({}) // Локальное отслеживание купленных инвестиций
const investmentCosts = ref({}) // Локальное отслеживание стоимости инвестиций

// Загрузка уровней инвестиций из хранилища
onMounted(() => {
  logger.log('Growth component mounted')
  logger.log('Current store investments:', store.investments)

  // Проверяем наличие метода purchaseInvestment в store
  if (typeof store.purchaseInvestment !== 'function') {
    logger.error('purchaseInvestment is not a function in store!')
  }

  // Проверяем наличие системы уведомлений
  if (!notifications || typeof notifications.addNotification !== 'function') {
    logger.error('Notifications system not available or addNotification is not a function!')
  }

  // Преобразуем массив купленных инвестиций в объект для быстрого доступа
  if (store.investments && store.investments.purchased) {
    logger.log('Loading purchased investments:', store.investments.purchased.length)

    store.investments.purchased.forEach(investment => {
      const key = `${investment.type}_${investment.id}`
      purchasedInvestments.value[key] = investment.level
      logger.log(`Setting level for ${key}: ${investment.level}`)

      // Если есть сохраненная стоимость, используем её
      if (investment.cost) {
        investmentCosts.value[key] = investment.cost
        logger.log(`Setting cost for ${key}: ${investment.cost}`)
      } else {
        // Иначе рассчитываем стоимость на основе базовой цены и уровня
        const baseInvestment = findBaseInvestment(investment.type, investment.id)
        if (baseInvestment) {
          investmentCosts.value[key] = calculateCostForLevel(baseInvestment, investment.level)
          logger.log(`Calculated cost for ${key}: ${investmentCosts.value[key]}`)
        }
      }
    })
  } else {
    logger.log('No purchased investments found in store')
  }
})

// Поиск базовой инвестиции по типу и id
const findBaseInvestment = (type, id) => {
  if (investmentsData[type] && investmentsData[type].items) {
    return investmentsData[type].items.find(item => item.id === id)
  }
  return null
}

// Категории инвестиций
const categories = [
  { id: 'finances', title: 'Финансы' },
  { id: 'technology', title: 'Технологии' },
  { id: 'business', title: 'Бизнес' },
  { id: 'realestate', title: 'Недвижимость' }
]

// Текущие инвестиции - показываем все без фильтрации по уровню
const currentInvestments = computed(() => {
  const categoryData = investmentsData[currentCategory.value]
  if (!categoryData) return []

  // Возвращаем все инвестиции без фильтрации по уровню
  return categoryData.items
})

// Получение текущего уровня инвестиции
const getInvestmentLevel = (investment) => {
  const key = `${currentCategory.value}_${investment.id}`
  // Возвращаем уровень из локального отслеживания или базовый уровень из данных
  return purchasedInvestments.value[key] || investment.level
}

// Получение текущей стоимости инвестиции
const getInvestmentCost = (investment) => {
  const key = `${currentCategory.value}_${investment.id}`

  // Если инвестиция уже куплена, возвращаем сохраненную стоимость или рассчитываем новую
  if (purchasedInvestments.value[key]) {
    // Если есть сохраненная стоимость
    if (investmentCosts.value[key]) {
      return investmentCosts.value[key]
    } else {
      // Рассчитываем стоимость для текущего уровня
      return calculateCostForLevel(investment, purchasedInvestments.value[key])
    }
  }

  // Иначе возвращаем базовую стоимость
  return investment.cost
}

// Расчет стоимости для определенного уровня
const calculateCostForLevel = (investment, level) => {
  // Базовая стоимость
  const baseCost = investment.cost || 0
  // Коэффициент роста цены (можно настроить)
  const costMultiplier = investment.costMultiplier || 1.5

  // Рассчитываем стоимость: базовая стоимость * (множитель ^ (уровень - базовый уровень))
  const baseLevel = investment.level || 1
  const levelDifference = level - baseLevel

  if (levelDifference <= 0) {
    return baseCost
  }

  return Math.round(baseCost * Math.pow(costMultiplier, levelDifference))
}

// Проверка возможности покупки
const canBuyInvestment = (investment) => {
  const cost = getInvestmentCost(investment)
  return store.balance >= cost
}

// Расчет дохода от инвестиции с учетом актуального уровня
const calculateIncome = (investment) => {
  const baseIncome = investment.baseIncome
  const level = getInvestmentLevel(investment) // Используем актуальный уровень
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
  logger.log('handleInvestment called for:', investment.name)

  try {
    // Получаем текущую стоимость инвестиции
    const currentCost = getInvestmentCost(investment)
    logger.log('Current cost:', currentCost, 'Current balance:', store.balance)

    if (!canBuyInvestment(investment)) {
      logger.log('Not enough balance to buy investment')
      if (notifications && typeof notifications.addNotification === 'function') {
        notifications.addNotification({
          message: 'Недостаточно монет',
          type: 'error'
        })
      } else {
        alert('Недостаточно монет')
      }
      return
    }

    // Создаем копию инвестиции для возможного увеличения уровня
    const investmentCopy = { ...investment }
    const key = `${currentCategory.value}_${investment.id}`

    // Текущий уровень инвестиции
    const currentLevel = purchasedInvestments.value[key] || investment.level
    logger.log('Current level:', currentLevel)

    // Увеличиваем уровень
    const newLevel = currentLevel + 1
    investmentCopy.level = newLevel
    logger.log('New level:', newLevel)

    // Рассчитываем доход для нового уровня
    const income = calculateIncome(investmentCopy)
    logger.log('Calculated income:', income)

    // Рассчитываем новую стоимость для следующего уровня
    const newCost = calculateCostForLevel(investment, newLevel + 1)
    logger.log('New cost for next level:', newCost)

    // Устанавливаем текущую стоимость (которую заплатит игрок)
    investmentCopy.cost = currentCost

    // Добавляем тип категории к инвестиции для сохранения
    investmentCopy.type = currentCategory.value

    // Запасной вариант, если purchaseInvestment не существует
    let success = false;

    if (typeof store.purchaseInvestment === 'function') {
      // Покупаем инвестицию через хранилище
      logger.log('Calling store.purchaseInvestment with:', investmentCopy, income)
      success = store.purchaseInvestment(investmentCopy, income)
      logger.log('Purchase result:', success)
    } else {
      // Резервный метод, если оригинальный метод не найден
      logger.error('store.purchaseInvestment is not a function, using fallback')

      // Проверяем баланс
      if (store.balance >= currentCost) {
        // Уменьшаем баланс
        store.balance -= currentCost;

        // Обновляем купленные инвестиции
        if (!store.investments) {
          store.investments = { purchased: [] };
        }
        if (!store.investments.purchased) {
          store.investments.purchased = [];
        }

        // Ищем существующую инвестицию
        const index = store.investments.purchased.findIndex(
            item => item.type === investmentCopy.type && item.id === investmentCopy.id
        );

        if (index >= 0) {
          // Обновляем существующую
          store.investments.purchased[index] = {
            ...investmentCopy,
            cost: newCost
          };
        } else {
          // Добавляем новую
          store.investments.purchased.push({
            ...investmentCopy,
            cost: newCost
          });
        }

        // Обновляем доход
        if (!store.passiveIncome) store.passiveIncome = 0;
        store.passiveIncome += income;

        success = true;
      }
    }

    if (success) {
      // Обновляем локальное отслеживание уровней
      purchasedInvestments.value[key] = newLevel
      logger.log('Updated local level tracking for', key, 'to', newLevel)

      // Обновляем стоимость для следующей покупки
      investmentCosts.value[key] = newCost
      logger.log('Updated local cost tracking for', key, 'to', newCost)

      // Обновляем стоимость в копии инвестиции для правильного сохранения в хранилище
      investmentCopy.nextCost = newCost

      // Отправляем уведомление
      if (notifications && typeof notifications.addNotification === 'function') {
        notifications.addNotification({
          message: `Вы приобрели ${investment.name} (Уровень ${newLevel})`,
          type: 'success'
        })
      } else {
        alert(`Вы приобрели ${investment.name} (Уровень ${newLevel})`)
      }
    } else {
      logger.error('Failed to purchase investment')
    }
  } catch (error) {
    logger.error('Error in handleInvestment:', error)
    if (notifications && typeof notifications.addNotification === 'function') {
      notifications.addNotification({
        message: `Ошибка покупки: ${error.message}`,
        type: 'error'
      })
    } else {
      alert(`Ошибка покупки: ${error.message}`)
    }
  }
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
  padding-top: 150px;
  background: url('@/assets/images/bg-2.jpg') center top no-repeat;
}

.investments-container {
  margin-top: 20px;
  height: 100vh;
  overflow: scroll;
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


.investment-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-height: 50vh;
  overflow-y: scroll;
  overflow-x: hidden;
  padding-bottom: 100px;
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
  width: 107%;
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