<!-- src/pages/LoadingPage.vue -->
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
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useTelegram } from '@/composables/useTelegram';
import { ApiService } from '@/services/apiService';
import { GameSettingsService } from '@/services/GameSettingsService';

const router = useRouter();
const store = useGameStore();
const { tg, user, isAvailable, expandApp } = useTelegram();

const progress = ref(0);
const loadingMessages = [
  'Загрузка активов...',
  'Подсчет прибыли...',
  'Анализ рынка...',
  'Создание капитала...'
];
const loadingMessage = ref(loadingMessages[0]);

// Переменные для хранения ID таймеров
let animationTimer;
let messageInterval;
let loadingTimeout;
let energyTimerId;
let passiveIncomeTimerId;
let saveStateTimerId;

const loadingDuration = 3000; // 3 секунды

// Инициализация приложения
async function initializeApp() {
  console.log('[LOADING] Инициализация приложения...');

  try {
    // Предзагрузка ресурсов и изображений
    const preloadImages = () => {
      return new Promise((resolve) => {
        const imageUrls = [
          '/images/onboarding/1.jpg',
          '/images/onboarding/2.jpg',
          '/images/onboarding/3.jpg',
          '/images/onboarding/4.jpg',
          '/images/bg.jpg',
          '/images/bg-2.jpg',
          '/images/coin.png',
        ];

        let loadedCount = 0;
        const totalImages = imageUrls.length;

        // Если нет изображений для предзагрузки, сразу резолвим промис
        if (totalImages === 0) {
          resolve();
          return;
        }

        imageUrls.forEach(url => {
          const img = new Image();
          img.onload = img.onerror = () => {
            loadedCount++;
            console.log(`Загружено изображение ${loadedCount}/${totalImages}: ${url}`);
            if (loadedCount === totalImages) {
              console.log('Все изображения загружены');
              resolve();
            }
          };
          img.src = url;
        });

        // На всякий случай резолвим промис через 5 секунд, даже если не все загрузились
        setTimeout(() => {
          if (loadedCount < totalImages) {
            console.log(`Тайм-аут загрузки изображений, загружено ${loadedCount}/${totalImages}`);
            resolve();
          }
        }, 5000);
      });
    };

    // Предзагрузка настроек игры
    console.log('Предзагрузка настроек игры...');
    const gameSettingsPromise = ApiService.getGameSettings()
        .then(gameSettings => {
          console.log('Предзагруженные настройки игры:', gameSettings);
          if (gameSettings?.data) {
            localStorage.setItem('preloadedGameSettings', JSON.stringify(gameSettings.data));
          }
        })
        .catch(error => {
          console.error('Ошибка предзагрузки настроек игры:', error);
        });

    // Инициализация Telegram Web App
    if (isAvailable.value && tg.value) {
      console.log('Telegram WebApp инициализирован');
      console.log('Пользователь Telegram:', user.value);

      if (user.value?.id) {
        // Сохраняем ID пользователя для WebSocket соединения
        localStorage.setItem('userId', user.value.id);

        // Инициализация игрового состояния
        await store.initializeGame(user.value.id);

        // Запускаем таймер для пассивного дохода
        store.startPassiveIncomeTimer();

        // Запускаем обновление энергии с сохранением ID таймера
        energyTimerId = setInterval(() => {
          store.regenerateEnergy();
        }, 1000); // Обновление каждую секунду
      }

      // Безопасное использование методов Telegram WebApp
      try {
        // Расширяем приложение
        expandApp();

        // Безопасно пытаемся включить подтверждение закрытия
        if (tg.value && typeof tg.value.enableClosingConfirmation === 'function') {
          tg.value.enableClosingConfirmation();
        }

        // Обработка темы
        if (tg.value && tg.value.colorScheme === 'dark') {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
      } catch (e) {
        console.error('Ошибка инициализации функций Telegram WebApp:', e);
      }
    } else {
      console.log('Запуск вне Telegram WebApp');

      // Для тестирования вне Telegram
      if (import.meta.env.DEV) {
        // Попытка загрузить настройки игры снова (на всякий случай)
        try {
          const gameSettings = await GameSettingsService.getSettings();
          console.log('Настройки игры в режиме DEV:', gameSettings);
        } catch (error) {
          console.error('Ошибка загрузки настроек в режиме DEV:', error);
        }

        const testUserId = '12345';
        localStorage.setItem('userId', testUserId);

        try {
          await store.initializeGame(testUserId);
          store.startPassiveIncomeTimer();

          // Запускаем обновление энергии с сохранением ID таймера
          energyTimerId = setInterval(() => {
            store.regenerateEnergy();
          }, 1000);
        } catch (e) {
          console.error('Ошибка инициализации тестового режима:', e);
        }
      }
    }

    // Предзагрузка изображений параллельно с другими операциями
    console.log('Начинаем предзагрузку изображений');
    await Promise.all([gameSettingsPromise, preloadImages()]);
    console.log('Все ресурсы загружены');

    // Отмечаем, что приложение загружено
    localStorage.setItem('appLoaded', 'true');

    return true;
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error);
    // В случае ошибки все равно считаем приложение загруженным, но с ошибкой
    localStorage.setItem('appLoaded', 'true');
    return false;
  }
}

function completeLoading() {
  console.log('[LOADING] Загрузка завершена');

  // Проверяем, завершен ли онбординг
  const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';

  // Переходим или на онбординг, или сразу на главную
  if (onboardingCompleted) {
    console.log('[LOADING] Онбординг ранее пройден, переходим на главную');
    router.replace('/');
  } else {
    console.log('[LOADING] Онбординг не пройден, переходим на онбординг');
    router.replace('/onboarding');
  }
}

onMounted(async () => {
  console.log('[LOADING] Компонент загрузки смонтирован');

  // Запускаем смену сообщений
  messageInterval = setInterval(() => {
    const nextIndex = (loadingMessages.indexOf(loadingMessage.value) + 1) % loadingMessages.length;
    loadingMessage.value = loadingMessages[nextIndex];
  }, 800);

  // Запускаем анимацию прогресса независимо от инициализации приложения
  const startTime = Date.now();
  const endTime = startTime + loadingDuration;

  const updateProgress = () => {
    const now = Date.now();
    const elapsed = now - startTime;
    const percentage = Math.min(100, (elapsed / loadingDuration) * 100);

    progress.value = Math.floor(percentage);

    if (now < endTime) {
      // Продолжаем анимацию
      animationTimer = requestAnimationFrame(updateProgress);
    } else {
      // Анимация завершена, прогресс 100%
      progress.value = 100;
    }
  };

  // Параллельно инициализируем приложение
  initializeApp();

  // Запускаем анимацию прогресса
  animationTimer = requestAnimationFrame(updateProgress);

  // Устанавливаем таймер для завершения загрузки через фиксированное время
  loadingTimeout = setTimeout(() => {
    completeLoading();
  }, loadingDuration + 500); // Добавляем 500мс для завершения анимации
});

onUnmounted(() => {
  console.log('[LOADING] Компонент загрузки размонтирован');

  // Очищаем все таймеры
  clearInterval(messageInterval);
  clearTimeout(loadingTimeout);

  if (animationTimer) {
    cancelAnimationFrame(animationTimer);
  }

  // Очищаем таймеры игры
  if (energyTimerId) clearInterval(energyTimerId);
  if (passiveIncomeTimerId) clearInterval(passiveIncomeTimerId);
  if (saveStateTimerId) clearInterval(saveStateTimerId);

  console.log('[LOADING] Все таймеры очищены');
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