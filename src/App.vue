<!-- src/App.vue (упрощенный) -->
<template>
  <NotificationsProvider>
    <div class="app">
      <button
          v-if="showResetButton"
          @click="resetProgress"
          class="bg-red-600 text-white px-4 py-2 rounded-lg reset-button"
      >
        Сбросить прогресс
      </button>

      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </NotificationsProvider>
</template>

<script setup>
import { onMounted, provide, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import NotificationsProvider from '@/components/NotificationsProvider.vue';

// Получение экземпляра хранилища
const store = useGameStore();
const route = useRoute();

// Предоставляем логгер для отладки
const logger = {
  log: (...args) => {
    if (import.meta.env.DEV) {
      console.log('[APP]', ...args);
    }
  },
  error: (...args) => {
    console.error('[APP ERROR]', ...args);
  }
};

provide('logger', logger);

// Показываем кнопку сброса только на основных страницах (не на загрузке и онбординге)
const showResetButton = computed(() => {
  return route.path !== '/loading' && route.path !== '/onboarding';
});

function resetProgress() {
  if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
    // Удаляем информацию о прохождении онбординга
    localStorage.removeItem('onboardingCompleted');

    // Удаляем информацию о загрузке приложения
    localStorage.removeItem('appLoaded');

    // Вызываем метод resetGame(), который не только удаляет данные,
    // но и делает reload страницы для гарантированного сброса
    store.resetGame();
  }
}

// Начальная инициализация
onMounted(() => {
  logger.log('App.vue mounted');

  // Проверяем, есть ли хранимый счетчик перенаправлений
  if (!localStorage.getItem('redirectCount')) {
    localStorage.setItem('redirectCount', '0');
  }

  // Сбрасываем флаг загрузки при перезагрузке страницы
  // для отладочных целей (только в режиме разработки)
  if (import.meta.env.DEV) {
    const resetStorageOnReload = false; // Установите в true для автоматического сброса при перезагрузке

    if (resetStorageOnReload) {
      localStorage.removeItem('appLoaded');
      logger.log('Флаг загрузки приложения сброшен (DEV режим)');
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
  max-height: 100vh;
  overflow: hidden;
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

.reset-button {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 900;
}
</style>