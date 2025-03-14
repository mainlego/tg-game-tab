<!-- src/components/ui/NotificationProvider.vue -->
<template>
  <div class="notifications-wrapper">
    <Transition name="fade" mode="out-in">
      <div v-if="notifications.length > 0" class="notifications-container">
        <div
            v-for="(notification, index) in notifications"
            :key="index"
            class="notification"
            :class="notification.type"
        >
          <div class="notification-content">
            <div class="notification-icon">
              <i :class="getNotificationIcon(notification.type)"></i>
            </div>
            <div class="notification-message">{{ notification.message }}</div>
          </div>
          <button class="notification-close" @click="removeNotification(index)">&times;</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue';

const notifications = ref([]);

const addNotification = (notification) => {
  // Устанавливаем тип по умолчанию, если не указан
  if (!notification.type) {
    notification.type = 'info';
  }

  // Добавляем уведомление в массив
  notifications.value.push(notification);

  // Автоматическое удаление через 5 секунд (если не error)
  if (notification.type !== 'error') {
    setTimeout(() => {
      removeNotification(notifications.value.indexOf(notification));
    }, 5000);
  }
};

const removeNotification = (index) => {
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return 'fas fa-check-circle';
    case 'error':
      return 'fas fa-exclamation-circle';
    case 'warning':
      return 'fas fa-exclamation-triangle';
    default:
      return 'fas fa-info-circle';
  }
};

// Предоставляем функции для использования в других компонентах
provide('notifications', {
  addNotification,
  removeNotification
});
</script>

<style scoped>
.notifications-wrapper {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 350px;
  width: 100%;
}

.notifications-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notification-icon {
  font-size: 20px;
  margin-top: 2px;
}

.notification-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
}

.notification-close {
  background: none;
  border: none;
  color: currentColor;
  opacity: 0.6;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
}

.notification-close:hover {
  opacity: 1;
}

.notification.success {
  background-color: #e3f8e6;
  color: #1f9d55;
  border-left: 4px solid #1f9d55;
}

.notification.error {
  background-color: #fcebea;
  color: #e3342f;
  border-left: 4px solid #e3342f;
}

.notification.warning {
  background-color: #fff9e6;
  color: #f2d024;
  border-left: 4px solid #f2d024;
}

.notification.info {
  background-color: #e6f7ff;
  color: #2196f3;
  border-left: 4px solid #2196f3;
}

/* Анимации */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .notifications-wrapper {
    max-width: 90%;
    top: 10px;
    right: 10px;
  }
}
</style>