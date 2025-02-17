<script setup>
import { ref, onMounted } from 'vue'
import { ApiService } from '@/services/apiService'

const users = ref([])
const usersStats = ref({
  total: 0,
  activeToday: 0,
  newThisWeek: 0
})
const loading = ref(true)
const error = ref(null)

const loadUsers = async () => {
  try {
    loading.value = true;
    const response = await ApiService.getAllUsers();
    users.value = response.users;
    usersStats.value = response.stats;
  } catch (err) {
    error.value = 'Ошибка загрузки пользователей';
    console.error('Error loading users:', err);
  } finally {
    loading.value = false;
  }
};

const handleBlock = async (user) => {
  if (confirm(`Вы уверены, что хотите ${user.blocked ? 'разблокировать' : 'заблокировать'} пользователя?`)) {
    try {
      await ApiService.blockUser(user.id);
      await loadUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }
};

const handleReset = async (user) => {
  if (confirm('Вы уверены, что хотите сбросить прогресс пользователя?')) {
    try {
      await ApiService.resetUserProgress(user.id);
      await loadUsers();
    } catch (error) {
      console.error('Error resetting user progress:', error);
    }
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="users-section">
    <div class="section-header">
      <h2>Пользователи</h2>
      <button @click="loadUsers" class="refresh-button" :disabled="loading">
        Обновить
      </button>
    </div>

    <!-- Статистика -->
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Всего пользователей</h3>
        <p>{{ usersStats.total }}</p>
      </div>
      <div class="stat-card">
        <h3>Активных сегодня</h3>
        <p>{{ usersStats.activeToday }}</p>
      </div>
      <div class="stat-card">
        <h3>Новых за неделю</h3>
        <p>{{ usersStats.newThisWeek }}</p>
      </div>
    </div>

    <!-- Ошибка -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="loading">
      Загрузка пользователей...
    </div>

    <!-- Таблица пользователей -->
    <div v-else class="table-wrapper">
      <table class="users-table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Имя</th>
          <th>Уровень</th>
          <th>Пассивный доход</th>
          <th>Баланс</th>
          <th>Последний вход</th>
          <th>Действия</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in users" :key="user.id" :class="{ 'blocked': user.blocked }">
          <td>{{ user.id }}</td>
          <td>{{ user.name }} {{ user.username ? `(@${user.username})` : '' }}</td>
          <td>{{ user.level }}</td>
          <td>{{ formatMoney(user.passiveIncome) }}/мес</td>
          <td>{{ formatMoney(user.balance) }}</td>
          <td>{{ formatDate(user.lastLogin) }}</td>
          <td>
            <div class="action-buttons">
              <button
                  class="btn-action"
                  :class="{ 'btn-block': !user.blocked, 'btn-unblock': user.blocked }"
                  @click="handleBlock(user)"
              >
                {{ user.blocked ? 'Разблокировать' : 'Блокировать' }}
              </button>
              <button class="btn-action btn-reset" @click="handleReset(user)">
                Сброс
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Добавим новые стили */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.refresh-button {
  padding: 8px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.blocked {
  opacity: 0.7;
  background: #f9fafb;
}

.btn-block {
  background: #dc2626 !important;
}

.btn-unblock {
  background: #059669 !important;
}

.btn-reset {
  background: #4b5563 !important;
}

/* Остальные стили остаются без изменений */
</style>