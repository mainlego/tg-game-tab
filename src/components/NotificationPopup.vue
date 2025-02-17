<!-- src/components/NotificationPopup.vue -->
<template>
  <Teleport to="body">
    <div v-if="isDebug" class="debug-panel">
      <p>WebSocket status: {{ wsStatus }}</p>
      <p>User ID: {{ user?.id }}</p>
    </div>

    <TransitionGroup name="notification" tag="div" class="notifications-container">
      <div v-for="notification in notifications"
           :key="notification.id"
           :class="['notification', notification.type]">
        <div class="notification-content">
          <span v-html="notification.message"></span>
          <a v-if="notification.button"
             :href="notification.button.url"
             target="_blank"
             class="notification-button">
            {{ notification.button.text }}
          </a>
        </div>
        <button class="close-button" @click="closeNotification(notification.id)">×</button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTelegram } from '@/composables/useTelegram'

const { user } = useTelegram()
const notifications = ref([])
const ws = ref(null)
const wsStatus = ref('disconnected')
const isDebug = ref(true) // Включаем дебаг-панель для отладки

const connectWebSocket = () => {
  if (!user.value?.id) {
    console.log('Нет ID пользователя для WebSocket подключения');
    return;
  }

  // Используем WSS для безопасного соединения
  const wsUrl = `wss://tg-game-tab-server.onrender.com?userId=${user.value.id}`;
  console.log('Подключение к WebSocket:', wsUrl);

  try {
    ws.value = new WebSocket(wsUrl);
    wsStatus.value = 'connecting';

    ws.value.onopen = () => {
      console.log('WebSocket соединение установлено');
      wsStatus.value = 'connected';
      // Отправляем тестовое сообщение для проверки
      ws.value.send(JSON.stringify({ type: 'ping', userId: user.value.id }));
    };

    ws.value.onmessage = (event) => {
      console.log('Получено WebSocket сообщение:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          addNotification({
            id: Date.now(),
            message: data.message,
            type: data.important ? 'important' : 'normal',
            button: data.button
          });
        }
      } catch (error) {
        console.error('Ошибка обработки сообщения:', error);
      }
    };

    ws.value.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
      wsStatus.value = 'error';
    };

    ws.value.onclose = () => {
      console.log('WebSocket соединение закрыто');
      wsStatus.value = 'disconnected';
      // Переподключение через 5 секунд
      setTimeout(connectWebSocket, 5000);
    };
  } catch (error) {
    console.error('Ошибка создания WebSocket:', error);
    wsStatus.value = 'error';
  }
};

const addNotification = (notification) => {
  notifications.value.push(notification);
  // Автоматическое закрытие через 5 секунд
  setTimeout(() => {
    closeNotification(notification.id);
  }, 5000);
};

const closeNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id);
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

.debug-panel {
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