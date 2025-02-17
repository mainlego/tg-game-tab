<!-- src/components/NotificationPopup.vue -->
<template>
  <Teleport to="body">
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

const connectWebSocket = () => {
  if (!user.value?.id) return;

  const wsUrl = `${import.meta.env.VITE_WS_URL}/notifications?userId=${user.value.id}`;
  console.log('Подключение к WebSocket:', wsUrl);

  ws.value = new WebSocket(wsUrl);

  ws.value.onopen = () => {
    console.log('WebSocket соединение установлено');
  };

  ws.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Получено уведомление:', data);

      if (data.type === 'notification') {
        addNotification(data);
      }
    } catch (error) {
      console.error('Ошибка обработки уведомления:', error);
    }
  };

  ws.value.onerror = (error) => {
    console.error('Ошибка WebSocket:', error);
  };

  ws.value.onclose = () => {
    console.log('WebSocket соединение закрыто');
    // Попытка переподключения через 5 секунд
    setTimeout(connectWebSocket, 5000);
  };
};

const addNotification = (notification) => {
  const id = Date.now();
  notifications.value.push({
    id,
    ...notification,
    type: notification.important ? 'important' : 'normal'
  });

  // Автоматическое закрытие через 5 секунд
  setTimeout(() => {
    closeNotification(id);
  }, 5000);
};

const closeNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id);
};

onMounted(() => {
  connectWebSocket();
});

onUnmounted(() => {
  if (ws.value) {
    ws.value.close();
  }
});

// Экспортируем метод для внешнего использования
defineExpose({
  addNotification
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