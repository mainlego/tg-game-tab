<!-- src/components/Loading.vue -->
<template>
  <div class="loading-container">
    <div class="loading-content">
      <div class="loader">
        <div class="coin">
          <div class="coin-front">$</div>
          <div class="coin-back">$</div>
        </div>
        <div class="glow-effect"></div>
      </div>

      <h1 class="loading-title">ФИНАНСОВЫЙ<br>СИМУЛЯТОР</h1>
      <h2 class="loading-subtitle">{{ loadingMessage }}</h2>

      <div class="loading-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  duration: {
    type: Number,
    default: 3000
  }
});

const emit = defineEmits(['loading-complete']);

const progress = ref(0);
const loadingMessages = [
  'Загрузка активов...',
  'Подсчет прибыли...',
  'Анализ рынка...',
  'Создание капитала...'
];
const loadingMessage = ref(loadingMessages[0]);
let animationTimer;
let messageInterval;

// Упрощенная версия с фиксированной анимацией загрузки
onMounted(() => {
  console.log('[LOADING] Component mounted, fixed duration:', props.duration);

  // Запуск смены сообщений
  messageInterval = setInterval(() => {
    const nextIndex = (loadingMessages.indexOf(loadingMessage.value) + 1) % loadingMessages.length;
    loadingMessage.value = loadingMessages[nextIndex];
  }, 800);

  // Простая анимация загрузки без интервалов
  const startTime = Date.now();
  const endTime = startTime + props.duration;

  // Функция для обновления прогресса
  const updateProgress = () => {
    const now = Date.now();
    const elapsed = now - startTime;
    const percentage = Math.min(100, (elapsed / props.duration) * 100);

    progress.value = Math.floor(percentage);

    if (now < endTime) {
      // Продолжаем анимацию
      animationTimer = requestAnimationFrame(updateProgress);
    } else {
      // Загрузка завершена
      progress.value = 100;
      console.log('[LOADING] Animation complete, emitting event');
      clearInterval(messageInterval);

      // Фиксированная задержка перед эмитом события
      setTimeout(() => {
        console.log('[LOADING] Emitting loading-complete event');
        emit('loading-complete');
      }, 500);
    }
  };

  // Запускаем анимацию
  animationTimer = requestAnimationFrame(updateProgress);
});

onUnmounted(() => {
  console.log('[LOADING] Component unmounted, cleaning up');
  clearInterval(messageInterval);
  if (animationTimer) {
    cancelAnimationFrame(animationTimer);
  }
});
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: radial-gradient(circle at center, #211b30 0%, #08070d 70%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  position: relative;
}

.loader {
  position: relative;
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.coin {
  width: 100px;
  height: 100px;
  position: relative;
  transform-style: preserve-3d;
  animation: rotate 2s linear infinite;
  z-index: 10;
}

.coin-front, .coin-back {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 50px;
  font-weight: bold;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

.coin-front {
  background: linear-gradient(45deg, #FFD700, #FFA500);
  color: #fff;
  transform: rotateY(0deg);
}

.coin-back {
  background: linear-gradient(45deg, #FFD700, #FFA500);
  color: #fff;
  transform: rotateY(180deg);
}

.glow-effect {
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(140, 96, 227, 0.2);
  filter: blur(20px);
  animation: pulse 2s ease-in-out infinite alternate;
  z-index: 1;
}

.loading-title {
  color: white;
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 8px;
  text-shadow: 0 0 15px rgba(140, 96, 227, 0.6);
  letter-spacing: 2px;
}

.loading-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 40px;
  min-height: 30px;
}

.loading-progress {
  width: 80%;
  max-width: 300px;
}

.progress-bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3) inset;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8C60E3, #a074ff);
  border-radius: 6px;
  transition: width 0.2s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
  );
  animation: shine 1.5s linear infinite;
}

.progress-text {
  text-align: right;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}

@keyframes rotate {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.4;
    transform: scale(0.9);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 480px) {
  .loading-title {
    font-size: 28px;
  }

  .loading-subtitle {
    font-size: 16px;
  }
}
</style>