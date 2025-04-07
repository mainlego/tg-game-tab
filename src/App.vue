<!-- src/App.vue -->
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

      <ProductNotification />

      <!-- Модальное окно для продуктов -->
      <ProductModal
          :show="showProductModal"
          :product="selectedProduct"
          @close="closeProductModal"
          @activate="handleProductActivation"
      />

      <!-- Модальное окно для заданий -->
      <TaskModal
          v-if="showTaskModal"
          :show="showTaskModal"
          :task="selectedTask"
          @close="closeTaskModal"
          @complete="handleTaskCompletion"
      />
    </div>
  </NotificationsProvider>
</template>

<script setup>
import { onMounted, provide, computed, ref, inject } from 'vue';
import { useRoute } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import NotificationsProvider from '@/components/NotificationsProvider.vue';
import ProductNotification from '@/components/notifications/ProductNotification.vue';
import ProductModal from '@/components/modals/ProductModal.vue';
import TaskModal from '@/components/modals/TaskModal.vue';

// Получение экземпляра хранилища
const store = useGameStore();
const route = useRoute();

// Состояние для модального окна продуктов (уже должно быть в вашем коде)
const showProductModal = ref(false);
const selectedProduct = ref(null);

// Состояние для модального окна заданий (новое)
const showTaskModal = ref(false);
const selectedTask = ref(null);

// Предоставляем логгер для отладки
const logger = {
  log: (...args) => {
    if (import.meta.env.DEV) {
      console.log('[APP]', ...args);
    }
  },
  error: (...args) => {
    console.error('[APP ERROR]', ...args);
  },
  warn: (...args) => {
    console.warn('[APP WARN]', ...args);
  }
};

provide('logger', logger);

// Методы для управления модальным окном задания (новые)
const openTaskModal = (task) => {
  logger.log('Opening task modal for:', task);
  selectedTask.value = task;
  showTaskModal.value = true;
};

setTimeout(() => {
  if (store._energyRegenTimerId === null) {
    console.log('Таймер регенерации энергии не запущен, запускаем...');
    store.startPassiveIncomeTimer();
  }
}, 3000);

const closeTaskModal = () => {
  logger.log('Closing task modal');
  showTaskModal.value = false;
  setTimeout(() => {
    selectedTask.value = null;
  }, 300); // Даем время на анимацию закрытия
};

const handleTaskCompletion = (completedTask) => {
  logger.log('Task completed:', completedTask);

  // Увеличиваем баланс пользователя
  if (completedTask?.reward) {
    store.balance += completedTask.reward;
  }
};

// Методы для управления модальным окном продукта (если их еще нет)
const openProductModal = (product) => {
  logger.log('Opening product modal for:', product);
  selectedProduct.value = product;
  showProductModal.value = true;
};

const closeProductModal = () => {
  logger.log('Closing product modal');
  showProductModal.value = false;
  setTimeout(() => {
    selectedProduct.value = null;
  }, 300);
};

const handleProductActivation = (activatedProduct) => {
  logger.log('Product activated:', activatedProduct);
};

// Предоставляем методы модальных окон через контекст
provide('productModal', {
  open: openProductModal,
  close: closeProductModal
});

provide('taskModal', {
  open: openTaskModal,
  close: closeTaskModal
});

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

  // Проверяем данные в localStorage на корректность
  try {
    const stateString = localStorage.getItem('gameState');
    if (stateString) {
      const state = JSON.parse(stateString);
      logger.log('Проверка целостности данных:', {
        hasEnergy: !!state.energy,
        energyLastRegenTime: state.energy?.lastRegenTime ?
            new Date(state.energy.lastRegenTime).toISOString() : 'отсутствует',
        hasInvestments: !!state.investments,
        lastSaved: state.lastSaved
      });

      // Восстановление из резервной копии при обнаружении проблем
      if (!state.energy || !state.energy.lastRegenTime || isNaN(state.energy.lastRegenTime)) {
        logger.warn('Обнаружены проблемы с данными энергии, проверяем резервную копию');

        try {
          const fallbackString = localStorage.getItem('gameStateFallback');
          if (fallbackString) {
            const fallbackState = JSON.parse(fallbackString);
            if (fallbackState.energy && fallbackState.energy.lastRegenTime) {
              state.energy = fallbackState.energy;
              localStorage.setItem('gameState', JSON.stringify(state));
              logger.log('Данные восстановлены из резервной копии');
            }
          }
        } catch (e) {
          logger.error('Ошибка восстановления из резервной копии:', e);
        }
      }
    }
  } catch (e) {
    logger.error('Ошибка проверки данных из localStorage:', e);
    // Сбрасываем повреждённые данные
    localStorage.removeItem('gameState');
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