<!-- src/components/NotificationPopup.vue -->
<template>

  <div class="notifications-container">
    <!-- Дебаг информация -->
    <div v-if="isDebug" class="debug-info">
      <p>User ID: {{ user?.id }}</p>
      <p>WebSocket Status: {{ wsStatus }}</p>
      <p>Notifications Count: {{ notifications.length }}</p>
    </div>

    <TransitionGroup name="notification" tag="div">
      <div v-for="notification in notifications"
           :key="notification.id"
           :class="['notification', notification.type]">
        <div class="notification-content">
          <span v-html="notification.message"></span>
        </div>
        <button class="close-button" @click="closeNotification(notification.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTelegram } from '@/composables/useTelegram'

const { user } = useTelegram()
const notifications = ref([])
const ws = ref(null)
const wsStatus = ref('disconnected')
const isDebug = ref(true) // Включаем дебаг режим

const connectWebSocket = () => {
  if (!user.value?.id) {
    console.log('Нет ID пользователя, WebSocket не подключается');
    return;
  }

  const wsUrl = `${import.meta.env.VITE_WS_URL}?userId=${user.value.id}`;
  console.log('Подключение к WebSocket:', wsUrl);

  try {
    ws.value = new WebSocket(wsUrl);
    wsStatus.value = 'connecting';

    ws.value.onopen = () => {
      console.log('WebSocket соединение открыто');
      wsStatus.value = 'connected';
    };

    ws.value.onmessage = (event) => {
      console.log('Получено сообщение WebSocket:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          addNotification(data);
        }
      } catch (error) {
        console.error('Ошибка обработки сообщения:', error);
      }
    };

    ws.value.onerror = (error) => {
      console.error('Ошибка WebSocket:', error);
      wsStatus.value = 'error';
    };

    ws.value.onclose = () => {
      console.log('WebSocket соединение закрыто');
      wsStatus.value = 'disconnected';
      setTimeout(connectWebSocket, 5000);
    };
  } catch (error) {
    console.error('Ошибка создания WebSocket:', error);
    wsStatus.value = 'error';
  }
};

onMounted(() => {
  console.log('NotificationPopup mounted, user:', user.value);
  connectWebSocket();
});

onUnmounted(() => {
  if (ws.value) {
    ws.value.close();
  }
});
</script>


<style scoped>

.debug-info {
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 9999;
}

.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
}

.notification {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  backdrop-filter: blur(4px);
}

.notification.important {
  background: rgba(244, 67, 54, 0.9);
}

.notification-content {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.notification-button {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 12px;
  background: white;
  color: black;
  text-decoration: none;
  border-radius: 4px;
  font-size: 12px;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  padding: 0 4px;
  cursor: pointer;
  opacity: 0.7;
}

.close-button:hover {
  opacity: 1;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>