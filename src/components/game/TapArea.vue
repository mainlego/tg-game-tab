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
import { ref, computed, onMounted, inject } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { GameSettingsService } from '@/services/GameSettingsService'

const store = useGameStore()
const tapAreaRef = ref(null)
const coins = ref([])
let coinId = 0
let isAnimating = false
const logger = inject('logger', console)

// Настраиваемые параметры с API
const customBackgrounds = ref({})
const defaultAnimation = ref({
  duration: 200,
  maxOffset: 3
})

// Загрузка настроек при монтировании
onMounted(async () => {
  try {
    // Загрузка кастомных фонов для уровней
    const backgrounds = await GameSettingsService.getSetting('levelBackgrounds', null)
    if (backgrounds && typeof backgrounds === 'object') {
      customBackgrounds.value = backgrounds
      logger.log('Загружены кастомные фоны для уровней:', backgrounds)
    }

    // Загрузка настроек анимации
    const animSettings = await GameSettingsService.getSetting('tapAnimation', null)
    if (animSettings && typeof animSettings === 'object') {
      defaultAnimation.value = {
        ...defaultAnimation.value,
        ...animSettings
      }
      logger.log('Загружены настройки анимации тапа:', animSettings)
    }
  } catch (error) {
    logger.error('Ошибка загрузки настроек для TapArea:', error)
  }
})

// Следим за изменением уровня
const backgroundImage = computed(() => {
  const level = store.level.current

  // Проверяем, есть ли кастомный фон для данного уровня
  if (customBackgrounds.value && customBackgrounds.value[level]) {
    return `url(${customBackgrounds.value[level]})`
  }

  // Стандартный фон, зависящий от уровня
  return `url(../../images/bg-level-${level}.png)`
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
  const duration = defaultAnimation.value.duration
  const maxOffset = defaultAnimation.value.maxOffset

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const offset = Math.sin(progress * Math.PI * 2) * maxOffset
    const xPos = 50 + offset

    tapAreaRef.value.style.backgroundPosition = `${xPos}% -10px`

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      tapAreaRef.value.style.backgroundPosition = '50% -10px'
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
  width: 105%;
  margin-left: -2.5%;
  height: 100vh;
  border:5px solid #8c60e3;
  border-radius: 60px;
  background-size: 110%;
  background-position: 50% -10px;
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