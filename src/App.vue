<!-- src/App.vue (обновленный) -->
<template>
  <NotificationsProvider>
    <div class="app">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </NotificationsProvider>
</template>

<script setup>
import { onMounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from './stores/gameStore';
import { useTelegram } from './composables/useTelegram';
import { ApiService } from './services/apiService';
import { GameSettingsService } from './services/GameSettingsService';
import NotificationsProvider from './components/NotificationsProvider.vue';

const router = useRouter();
const store = useGameStore();
const { tg, user, isAvailable, expandApp } = useTelegram();

// Предоставляем логгер для отладки
const logger = {
  log: (...args) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
  error: (...args) => {
    console.error(...args);
  }
};

provide('logger', logger);

// Инициализация приложения
onMounted(async () => {
  // Предзагрузка настроек игры
  try {
    logger.log('Предзагрузка настроек игры...');
    const gameSettings = await ApiService.getGameSettings();
    logger.log('Предзагруженные настройки игры:', gameSettings);
    if (gameSettings?.data) {
      localStorage.setItem('preloadedGameSettings', JSON.stringify(gameSettings.data));
    }
  } catch (error) {
    logger.error('Ошибка предзагрузки настроек игры:', error);
  }

  // Инициализация Telegram Web App
  if (isAvailable.value && tg.value) {
    logger.log('Telegram WebApp инициализирован');
    logger.log('Пользователь Telegram:', user.value);

    if (user.value?.id) {
      // Сохраняем ID пользователя для WebSocket соединения
      localStorage.setItem('userId', user.value.id);

      // Инициализация игрового состояния
      await store.initializeGame(user.value.id);

      // Запускаем таймер для пассивного дохода
      store.startPassiveIncomeTimer();

      // Запускаем обновление энергии
      setInterval(() => {
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
      logger.error('Ошибка инициализации функций Telegram WebApp:', e);
    }
  } else {
    logger.log('Запуск вне Telegram WebApp');

    // Для тестирования вне Telegram
    if (import.meta.env.DEV) {
      // Попытка загрузить настройки игры снова (на всякий случай)
      try {
        const gameSettings = await GameSettingsService.getSettings();
        logger.log('Настройки игры в режиме DEV:', gameSettings);
      } catch (error) {
        logger.error('Ошибка загрузки настроек в режиме DEV:', error);
      }

      const testUserId = '12345';
      localStorage.setItem('userId', testUserId);

      try {
        await store.initializeGame(testUserId);
        store.startPassiveIncomeTimer();

        setInterval(() => {
          store.regenerateEnergy();
        }, 1000);
      } catch (e) {
        logger.error('Ошибка инициализации тестового режима:', e);
      }
    }
  }
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');

:root {
  --primary-color: #8C60E3;
  --background-color: #08070d;
  --menu-bg: #211b30;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Roboto", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
}

html, body {
  height: 100vh;
  width: 100%;
  font-family: 'Roboto', sans-serif;
  background: var(--background-color);
}

.app {
  min-height: 100vh;
  background: url('@/assets/images/bg.jpg') center top no-repeat;
  background-attachment: fixed;
  background-size: cover;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

/* Стили для тёмной темы */
.dark-theme {
  --background-color: #08070d;
  --text-color: white;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --card-bg: #211b30;
  --input-bg: #333;
  --input-border: #444;
}
</style>