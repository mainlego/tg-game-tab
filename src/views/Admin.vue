<!-- src/pages/Admin.vue -->
<template>
  <div class="admin-page">
    <!-- Сайдбар с навигацией -->
    <div class="admin-sidebar" :class="{ 'admin-sidebar--open': isSidebarOpen }">
      <div class="admin-logo">
        <h2>Admin Panel</h2>
        <button class="sidebar-toggle" @click="toggleSidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <nav class="admin-nav">
        <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['nav-button', { active: currentTab === tab.id }]"
            @click="switchTab(tab.id)"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Мобильный хедер -->
    <div class="mobile-header">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>
      <h2>{{ currentTabName }}</h2>
    </div>

    <!-- Основной контент -->
    <div class="admin-content" :class="{ 'sidebar-closed': !isSidebarOpen }">
      <UsersSection v-if="currentTab === 'users'" />
      <TasksSection v-if="currentTab === 'tasks'" />
      <ProductsSection v-if="currentTab === 'products'" />
      <NotificationsSection v-if="currentTab === 'notifications'" />
      <SettingsSection v-if="currentTab === 'settings'" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UsersSection from '../components/admin/UsersSection.vue'
import TasksSection from '../components/admin/TasksSection.vue'
import ProductsSection from '../components/admin/ProductsSection.vue'
import NotificationsSection from '../components/admin/NotificationsSection.vue'
import SettingsSection from '../components/admin/SettingsSection.vue'
import { useAdminStore } from '../stores/adminStore'
import { useRouter } from 'vue-router'

const adminStore = useAdminStore()
const router = useRouter()

const currentTab = ref('users')
const isSidebarOpen = ref(window.innerWidth > 768)

const tabs = [
  { id: 'users', name: 'Пользователи' },
  { id: 'tasks', name: 'Задания' },
  { id: 'products', name: 'Продукты' },
  { id: 'notifications', name: 'Уведомления' },
  { id: 'settings', name: 'Настройки' }
]

const currentTabName = computed(() => {
  return tabs.find(tab => tab.id === currentTab.value)?.name || ''
})

const switchTab = (tabId) => {
  currentTab.value = tabId
  if (window.innerWidth <= 768) {
    isSidebarOpen.value = false
  }
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Проверка авторизации при входе
onMounted(() => {
  const isAdmin = localStorage.getItem('isAdmin')
  if (!isAdmin) {
    router.push('/admin/login')
  } else {
    // Загрузка начальных данных
    adminStore.fetchUsers()
  }

  // Обработчик изменения размера окна
  window.addEventListener('resize', handleResize)
})

// Метод обработки изменения размера окна
const handleResize = () => {
  if (window.innerWidth > 768) {
    isSidebarOpen.value = true
  }
}
</script>

<style scoped>
.admin-page {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
}

.admin-sidebar {
  width: 250px;
  min-width: 250px; /* Фиксированная ширина сайдбара */
  background: #1a1a1a;
  padding: 20px;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  overflow-y: auto;
  transition: transform 0.3s ease;
}

.admin-sidebar--open {
  transform: translateX(0);
}

.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  padding: 0 20px;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 100;
}

.admin-content {
  flex: 1;
  padding: 20px;
  margin-left: 250px; /* Соответствует ширине сайдбара */
  min-height: 100vh;
  box-sizing: border-box;
  overflow-y: auto;
  transition: margin-left 0.3s ease;
}

.admin-content.sidebar-closed {
  margin-left: 0;
}

.admin-logo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #333;
}

.admin-logo h2 {
  margin: 0;
  font-size: 1.5rem;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-button {
  padding: 12px;
  background: none;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 14px;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-button.active {
  background: var(--primary-color, #8C60E3);
}

.sidebar-toggle {
  display: none;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 8px;
}

@media (max-width: 768px) {
  .admin-page {
    display: block; /* На мобильных меняем flexbox на блочную модель */
  }

  .admin-sidebar {
    transform: translateX(-100%);
    width: 80%;
    max-width: 300px;
  }

  .admin-sidebar--open {
    transform: translateX(0);
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
  }

  .mobile-header {
    display: flex;
  }

  .sidebar-toggle {
    display: block;
  }

  .admin-content {
    margin-left: 0;
    padding-top: 80px; /* Отступ для мобильного заголовка */
  }
}
</style>