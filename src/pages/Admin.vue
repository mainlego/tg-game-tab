<!-- src/pages/Admin.vue -->
<template>
  <div class="admin-panel">
    <!-- Сайдбар с навигацией -->
    <div class="admin-sidebar">
      <div class="admin-logo">
        <h2>Admin Panel</h2>
      </div>
      <nav class="admin-nav">
        <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['nav-button', { active: currentTab === tab.id }]"
            @click="currentTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Основной контент -->
    <div class="admin-content">
      <!-- Статистика пользователей -->
      <div v-if="currentTab === 'users'" class="admin-section">
        <h2>Пользователи</h2>
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
        <div class="users-table">
          <table>
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
                <button @click="blockUser(user.id)">Блокировать</button>
                <button @click="resetProgress(user.id)">Сброс</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Управление заданиями -->
      <div v-if="currentTab === 'tasks'" class="admin-section">
        <h2>Управление заданиями</h2>
        <button class="create-button" @click="showTaskModal = true">
          Создать задание
        </button>

        <!-- Список заданий -->
        <div class="tasks-list">
          <div v-for="task in tasks" :key="task.id" class="task-card">
            <h3>{{ task.title }}</h3>
            <p>{{ task.description }}</p>
            <div class="task-stats">
              <span>Выполнено: {{ task.completions }}</span>
              <span>Награда: {{ formatMoney(task.reward) }}</span>
            </div>
            <div class="task-actions">
              <button @click="editTask(task)">Редактировать</button>
              <button @click="toggleTaskStatus(task)">
                {{ task.active ? 'Деактивировать' : 'Активировать' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Управление продуктами -->
      <div v-if="currentTab === 'products'" class="admin-section">
        <h2>Управление продуктами</h2>
        <button class="create-button" @click="showProductModal = true">
          Добавить продукт
        </button>

        <!-- Список продуктов -->
        <div class="products-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <img :src="product.image" :alt="product.name">
            <h3>{{ product.name }}</h3>
            <p>{{ product.description }}</p>
            <div class="product-stats">
              <span>Цена: {{ formatMoney(product.cost) }}</span>
              <span>Доход: {{ formatMoney(product.income) }}</span>
            </div>
            <div class="product-actions">
              <button @click="editProduct(product)">Редактировать</button>
              <button @click="toggleProduct(product)">
                {{ product.active ? 'Скрыть' : 'Показать' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Управление уведомлениями -->
      <div v-if="currentTab === 'notifications'" class="admin-section">
        <h2>Уведомления</h2>
        <div class="notification-composer">
          <textarea
              v-model="newNotification.message"
              placeholder="Текст уведомления"
          ></textarea>
          <select v-model="newNotification.type">
            <option value="all">Всем пользователям</option>
            <option value="level">По уровню</option>
            <option value="income">По доходу</option>
          </select>
          <button @click="sendNotification">Отправить</button>
        </div>

        <!-- История уведомлений -->
        <div class="notifications-history">
          <h3>История уведомлений</h3>
          <div v-for="notification in notificationsHistory"
               :key="notification.id"
               class="notification-record">
            <p>{{ notification.message }}</p>
            <span>{{ formatDate(notification.sentAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Настройки игры -->
      <div v-if="currentTab === 'settings'" class="admin-section">
        <h2>Настройки игры</h2>
        <div class="settings-form">
          <div class="setting-group">
            <h3>Базовые настройки</h3>
            <div class="setting-item">
              <label>Монет за клик</label>
              <input type="number" v-model="settings.tapValue">
            </div>
            <div class="setting-item">
              <label>Базовая энергия</label>
              <input type="number" v-model="settings.baseEnergy">
            </div>
          </div>

          <div class="setting-group">
            <h3>Множители</h3>
            <div class="setting-item">
              <label>Множитель дохода</label>
              <input type="number" v-model="settings.incomeMultiplier">
            </div>
            <div class="setting-item">
              <label>Множитель опыта</label>
              <input type="number" v-model="settings.expMultiplier">
            </div>
          </div>

          <button @click="saveSettings" class="save-button">
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()
const currentTab = ref('users')

// Табы админ-панели
const tabs = [
  { id: 'users', name: 'Пользователи' },
  { id: 'tasks', name: 'Задания' },
  { id: 'products', name: 'Продукты' },
  { id: 'notifications', name: 'Уведомления' },
  { id: 'settings', name: 'Настройки' }
]

// Статистика пользователей
const usersStats = ref({
  total: 0,
  activeToday: 0,
  newThisWeek: 0
})

// Настройки игры
const settings = ref({
  tapValue: 1,
  baseEnergy: 100,
  incomeMultiplier: 1,
  expMultiplier: 1
})

// Загрузка данных
onMounted(async () => {
  // Здесь будет загрузка реальных данных
  // Пока используем моковые данные
  usersStats.value = {
    total: 1000,
    activeToday: 250,
    newThisWeek: 75
  }
})

// Форматирование денег
const formatMoney = (amount) => {
  return store.formatBigNumber(amount)
}

// Форматирование даты
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// Методы управления
const saveSettings = () => {
  // Сохранение настроек
  store.updateGameSettings(settings.value)
}

// ... другие методы для управления пользователями, заданиями и т.д.
</script>

<style scoped>
.admin-panel {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.admin-sidebar {
  width: 250px;
  background: #1a1a1a;
  padding: 20px;
  color: white;
}

.admin-logo h2 {
  margin: 0 0 20px;
  padding: 10px 0;
  border-bottom: 1px solid #333;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-button {
  padding: 10px;
  background: none;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-button.active {
  background: var(--primary-color);
}

.admin-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.admin-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #666;
}

.stat-card p {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
}

.create-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.settings-form {
  max-width: 600px;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.setting-item label {
  width: 200px;
}

.setting-item input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 120px;
}

.save-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

/* Таблицы */
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background: #f8f9fa;
  font-weight: 600;
}

/* Формы */
textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}
</style>