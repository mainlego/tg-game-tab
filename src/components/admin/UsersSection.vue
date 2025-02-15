<!-- src/components/admin/UsersSection.vue -->
<template>
  <div class="users-section">
    <h2>Пользователи</h2>

    <!-- Карточки статистики -->
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

    <!-- Таблица пользователей -->
    <div class="table-wrapper">
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
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.level }}</td>
          <td>{{ formatMoney(user.passiveIncome) }}</td>
          <td>{{ formatMoney(user.balance) }}</td>
          <td>{{ formatDate(user.lastLogin) }}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-action" @click="handleBlock(user)">
                {{ user.blocked ? 'Разблокировать' : 'Блокировать' }}
              </button>
              <button class="btn-action" @click="handleReset(user)">
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

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'

const adminStore = useAdminStore()
const users = ref([])
const usersStats = ref({
  total: 0,
  activeToday: 0,
  newThisWeek: 0
})

onMounted(async () => {
  await loadUsers()
})

const loadUsers = async () => {
  await adminStore.fetchUsers()
  users.value = adminStore.users
  usersStats.value = adminStore.userStats
}

const handleBlock = async (user) => {
  await adminStore.blockUser(user.id)
  await loadUsers()
}

const handleReset = async (user) => {
  if (confirm('Вы уверены, что хотите сбросить прогресс пользователя?')) {
    await adminStore.resetUserProgress(user.id)
    await loadUsers()
  }
}

const formatMoney = (amount) => {
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + 'B'
  }
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M'
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K'
  }
  return amount.toString()
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.users-section {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #666;
}

.stat-card p {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
}

.table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background: #f8f9fa;
  font-weight: 600;
  font-size: 14px;
}

.users-table td {
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.btn-action:first-child {
  background: #ff4444;
  color: white;
}

.btn-action:last-child {
  background: #666;
  color: white;
}

.btn-action:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .users-section {
    padding: 10px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .table-wrapper {
    margin: 0 -10px;
    border-radius: 0;
  }

  .stat-card {
    padding: 15px;
  }

  .stat-card h3 {
    font-size: 12px;
  }

  .stat-card p {
    font-size: 20px;
  }
}
</style>