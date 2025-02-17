<!-- src/App.vue -->
<template>
  <div id="app" class="app">
    <!-- Панель управления
    <div class="dev-menu">
      <button @click="store.resetGame()" class="dev-button">
        Сброс игры
      </button>
      <div class="tap-control">
        <button @click="decreaseTapValue" class="dev-button">-1000</button>
        <span>Клик: {{ store.multipliers.tapValue }}</span>
        <button @click="increaseTapValue" class="dev-button">+1000</button>
      </div>
    </div>-->

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Notification ref="notificationSystem" />
    <NotificationPopup ref="notificationPopup" />
  </div>
</template>

<!-- src/App.vue -->
<script setup>
import { ref, provide, onMounted, watch } from 'vue'
import Notification from '@/components/ui/Notification.vue'
import { useGameStore } from '@/stores/gameStore'
import { useTelegram } from '@/composables/useTelegram'

import NotificationPopup from '@/components/NotificationPopup.vue'

const logger = ref(null)
const store = useGameStore()
const notificationSystem = ref(null)
const { tg, user, ready } = useTelegram()

provide('logger', {
  log: (message) => logger.value?.addLog(message)
})

provide('notifications', {
  addNotification: (params) => {
    notificationSystem.value?.addNotification(params)
  }
})

// Следим за инициализацией пользователя
watch(() => user.value, (newUser) => {
  if (newUser) {
    // Инициализируем игру для пользователя
    store.initializeGame(newUser.id)
  }
}, { immediate: true })

onMounted(() => {
  // Проверяем, является ли текущий путь админским
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  if (!isAdminRoute && tg.value) {
    // Применяем Telegram Web App методы только если это не админка
    tg.value.expand();
    tg.value.setBackgroundColor('#08070d');
    tg.value.setHeaderColor('#1a1a1a');
    tg.value.BackButton.hide();
    tg.value.enableClosingConfirmation();
  }

  // Запускаем таймеры только для игровой части
  if (!isAdminRoute) {
    store.startPassiveIncomeTimer();
    setInterval(() => {
      store.regenerateEnergy();
    }, 1000);
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
  font-family: "Roboto", serif;
  font-optical-sizing: auto;
  font-style: normal;
}

html, body {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
  background: var(--background-color);
}

#app {
  min-height: 100vh;
  background: url('@/assets/images/bg-2.jpg') center top no-repeat;
  background-attachment: fixed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dev-menu {
  position: fixed;
  bottom: 120px;
  right: 20px;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: 8px;
  display: flex;
  gap: 10px;
  backdrop-filter: blur(5px);
}

.dev-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.dev-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.dev-button:active {
  transform: translateY(0);
}

.tap-control {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.tap-control button {
  width: auto;
  padding: 4px 8px;
}

.tap-control span {
  min-width: 80px;
  text-align: center;
}

</style>