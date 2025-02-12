<!-- src/App.vue -->
<template>
  <div id="app" class="app">
    <!-- Панель управления -->
    <div class="dev-menu">
      <button @click="store.resetGame()" class="dev-button">
        Сброс игры
      </button>
      <div class="tap-control">
        <button @click="decreaseTapValue" class="dev-button">-1000</button>
        <span>Клик: {{ store.multipliers.tapValue }}</span>
        <button @click="increaseTapValue" class="dev-button">+1000</button>
      </div>
    </div>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Notification ref="notificationSystem" />
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue'
import Notification from '@/components/ui/Notification.vue'
import { useGameStore } from '@/stores/gameStore'
import { useTelegram } from '@/composables/useTelegram'

const store = useGameStore()
const notificationSystem = ref(null)
const { ready, user } = useTelegram()


if (user) {
  // Здесь можно инициализировать пользователя в store
  console.log('Telegram user:', user)
}

// Добавляем управление значением клика
const increaseTapValue = () => {
  store.multipliers.tapValue += 1000
  store.saveState()
}

const decreaseTapValue = () => {
  if (store.multipliers.tapValue >= 1000) {
    store.multipliers.tapValue -= 1000
    store.saveState()
  }
}


onMounted(() => {
  store.startPassiveIncomeTimer()
  setInterval(() => {
    store.regenerateEnergy()
  }, 1000)
})

provide('notifications', {
  addNotification: (params) => {
    notificationSystem.value?.addNotification(params)
  }
})

const resetGame = () => {
  if (confirm('Вы уверены, что хотите сбросить игру?')) {
    store.resetGame()
  }
}


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