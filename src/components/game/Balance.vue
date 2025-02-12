<!-- src/components/game/Balance.vue -->
<template>
  <div class="balance">
    <img src="../../assets/images/coin.png" class="balance__icon" alt="coin">
    <span class="balance__amount" :class="{ 'balance__amount--increasing': isIncreasing }">
      {{ formattedBalance }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()
const isIncreasing = ref(false)
let previousBalance = store.balance

const formattedBalance = computed(() => {
  return Math.floor(store.balance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
})

// Обновляем баланс чаще
watch(() => store.balance, (newBalance) => {
  if (newBalance > previousBalance) {
    isIncreasing.value = true
    setTimeout(() => {
      isIncreasing.value = false
    }, 100) // Уменьшили время анимации
  }
  previousBalance = newBalance
}, { immediate: true })

onMounted(() => {
  // Запускаем обновление при монтировании
  previousBalance = store.balance
})
</script>

<style scoped>
.balance {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
}

.balance__icon {
  width: 33px;
  height: 33px;
}

.balance__amount {
  margin-left: 0.75rem;
  font-size: 36px;
  font-weight: 700;
  line-height: 42px;
  letter-spacing: -0.02em;
  color: white;
  transition: color 0.3s ease;
  font-variant-numeric: tabular-nums;
}



.balance__amount--increasing {
  color: #fff;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>