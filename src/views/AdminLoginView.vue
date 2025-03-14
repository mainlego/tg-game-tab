<!-- src/views/AdminLoginView.vue -->
<template>
  <div class="admin-login">
    <div class="login-card">
      <div class="login-header">
        <h2>Вход в админ-панель</h2>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Логин</label>
          <input
              type="text"
              id="username"
              v-model="username"
              class="form-input"
              required
              autocomplete="username"
          >
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <div class="password-input">
            <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                class="form-input"
                required
                autocomplete="current-password"
            >
            <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-actions">
          <BaseButton
              type="primary"
              :disabled="loading"
              class="login-button"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <span v-else>Войти</span>
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';

const router = useRouter();
const notifications = inject('notifications');

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

const handleLogin = async () => {
  // Сбрасываем ошибку
  error.value = '';

  // Проверяем ввод
  if (!username.value || !password.value) {
    error.value = 'Введите логин и пароль';
    return;
  }

  try {
    loading.value = true;

    // В демо-версии используем простую проверку
    // В реальном приложении здесь должен быть запрос к API
    if (username.value === 'admin' && password.value === 'admin') {
      // Сохраняем состояние авторизации
      localStorage.setItem('isAdmin', 'true');

      notifications.addNotification({
        message: 'Вход выполнен успешно',
        type: 'success'
      });

      // Перенаправляем на админ-панель
      router.push('/admin');
    } else {
      error.value = 'Неверный логин или пароль';
    }
  } catch (err) {
    console.error('Ошибка авторизации:', err);
    error.value = 'Произошла ошибка при входе';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.login-header {
  background: var(--primary-color, #8C60E3);
  color: white;
  padding: 20px;
  text-align: center;
}

.login-header h2 {
  margin: 0;
  font-size: 24px;
}

.login-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.error-message {
  background-color: #ffebee;
  color: #f44336;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: center;
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.login-button i {
  margin-right: 8px;
}
</style>