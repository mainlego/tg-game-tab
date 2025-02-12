<!-- src/components/game/TapArea.vue -->
<template>
  <div
      class="tap-area"
      ref="tapAreaRef"
      :style="{ backgroundImage }"
      @mousedown="handleTap"
      @touchstart.prevent="handleTap"
  >
    <TransitionGroup name="coin">
      <div v-for="coin in coins"
           :key="coin.id"
           class="coin-popup"
           :style="{
             left: `${coin.x}px`,
             top: `${coin.y}px`
           }">
        <img src="@/assets/images/coin.png" alt="coin" class="coin-image"/>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()
const tapAreaRef = ref(null)
const coins = ref([])
let coinId = 0
let isAnimating = false


// Следим за изменением уровня
const backgroundImage = computed(() => {
  return `url(/src/assets/images/bg-level-${store.level.current}.png)`
})





// Проверяем наличие активных бустов
const hasActiveBoosts = computed(() => {
  return store.boosts.tap3x.active || store.boosts.tap5x.active
})

// Обработка клика
const handleTap = (event) => {
  if (!store.canTap) {
    const energyBar = document.querySelector('.energy-boost')
    if (energyBar) energyBar.classList.add('no-energy-shake')
    return
  }

  const rect = tapAreaRef.value.getBoundingClientRect()
  let x, y;

  if (event.touches && event.touches[0]) {
    // Для тач-устройств
    x = event.touches[0].clientX - rect.left
    y = event.touches[0].clientY - rect.top
  } else {
    // Для мыши
    x = event.clientX - rect.left
    y = event.clientY - rect.top
  }

  const reward = store.handleTap()
  if (reward > 0) {
    createCoin(x, y, reward)
    if (!isAnimating) {
      animateBackground()
    }
  }
}

// Создание анимированной монетки
const createCoin = (x, y, value) => {
  const coin = {
    id: coinId++,
    x: Math.max(15, Math.min(x - 15, tapAreaRef.value.clientWidth - 30)),
    y: Math.max(15, Math.min(y - 15, tapAreaRef.value.clientHeight - 30)),
    value
  }

  coins.value = [...coins.value, coin]

  setTimeout(() => {
    coins.value = coins.value.filter(c => c.id !== coin.id)
  }, 1000)
}

// Анимация фона
const animateBackground = () => {
  if (!tapAreaRef.value || isAnimating) return

  isAnimating = true
  const startTime = performance.now()
  const duration = 200
  const maxOffset = 3

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const offset = Math.sin(progress * Math.PI * 2) * maxOffset
    const xPos = 50 + offset

    tapAreaRef.value.style.backgroundPosition = `${xPos}% top`

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      tapAreaRef.value.style.backgroundPosition = '50% top'
      isAnimating = false
    }
  }

  requestAnimationFrame(animate)
}

// Форматирование времени
const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Получение оставшегося времени буста
const getBoostTimeLeft = (boostType) => {
  const boost = store.boosts[boostType]
  if (!boost.active) return 0
  return Math.max(0, boost.endTime - Date.now())
}
</script>

<style scoped>
.tap-area {
  position: relative;
  width: 100%;
  height: 100vh;
  border-top: 4px solid var(--primary-color);
  border-radius: 40px 40px 0 0;
  background-size: 130%;
  background-position: 50% top;
  background-repeat: no-repeat;
  touch-action: none;
  user-select: none;
  will-change: background-position;
  overflow: hidden;
  transition: background-image 0.3s ease; /* Добавляем плавный переход */
}

.coin-popup {
  position: absolute;
  width: 30px;
  height: 30px;
  pointer-events: none;
  z-index: 1000;
  animation: floatUp 1s ease-out forwards;
  will-change: transform, opacity;
}

.coin-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}


@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(0, -25px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(0, -50px) scale(0.8);
  }
}
</style>