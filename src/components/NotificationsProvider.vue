<!-- src/components/NotificationsProvider.vue -->
<template>
  <div class="notifications-container">
    <TransitionGroup name="notification">
      <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="notification.type"
      >
        <div class="notification-content">
          {{ notification.message }}
        </div>
        <button class="close-btn" @click="removeNotification(notification.id)">
          &times;
        </button>
      </div>
    </TransitionGroup>
  </div>
  <slot></slot>
</template>

<script setup>
import { ref, provide } from 'vue';

const notifications = ref([]);
const notificationTimeout = 5000; // 5 секунд

const addNotification = (notification) => {
  const id = Date.now();
  notifications.value.push({
    id,
    message: notification.message,
    type: notification.type || 'info'
  });

  // Автоматически удалять уведомление через timeout
  setTimeout(() => {
    removeNotification(id);
  }, notificationTimeout);
};

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
};

// Предоставляем сервис уведомлений для всех компонентов
provide('notifications', {
  notifications,
  addNotification,
  removeNotification
});
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 350px;
  max-height: 80vh;
  overflow-y: auto;
}

.notification {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid #2196f3;
}

.notification.success {
  border-left-color: #4caf50;
}

.notification.error {
  border-left-color: #f44336;
}

.notification.warning {
  border-left-color: #ff9800;
}

.notification-content {
  flex: 1;
  margin-right: 10px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

/* Анимации перехода */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>