<!-- src/components/admin/TasksSection.vue -->
<template>
  <div class="tasks-section">
    <div class="section-header">
      <h2>Управление заданиями</h2>
      <button class="btn-primary" @click="showTaskModal = true">
        Создать задание
      </button>
    </div>

    <!-- Список заданий -->
    <div class="tasks-grid">
      <div v-for="task in tasks" :key="task.id" class="task-card">
        <div class="task-header">
          <h3>{{ task.title }}</h3>
          <span :class="['status-badge', { active: task.active }]">
            {{ task.active ? 'Активно' : 'Неактивно' }}
          </span>
        </div>

        <p class="task-description">{{ task.description }}</p>

        <div class="task-stats">
          <div class="stat-item">
            <span class="stat-label">Выполнено:</span>
            <span class="stat-value">{{ task.completions }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Награда:</span>
            <span class="stat-value">{{ formatMoney(task.reward) }}</span>
          </div>
        </div>

        <div class="task-actions">
          <button class="btn-secondary" @click="editTask(task)">
            Редактировать
          </button>
          <button
              class="btn-action"
              :class="{ 'btn-deactivate': task.active }"
              @click="toggleTaskStatus(task)"
          >
            {{ task.active ? 'Деактивировать' : 'Активировать' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для создания/редактирования задания -->
    <TaskModal
        v-if="showTaskModal"
        :task="editingTask"
        @close="closeTaskModal"
        @save="saveTask"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ApiService } from '@/services/apiService'
import TaskModal from './modals/TaskModal.vue'
import ConfirmModal from './modals/ConfirmModal.vue'

const tasks = ref([])
const showTaskModal = ref(false)
const showDeleteModal = ref(false)
const editingTask = ref(null)
const taskToDelete = ref(null)

onMounted(async () => {
  await loadTasks()
})

const loadTasks = async () => {
  try {
    const response = await ApiService.getTasks()
    if (response) {
      tasks.value = response
    }
  } catch (error) {
    console.error('Error loading tasks:', error)
  }
}

const editTask = (task) => {
  editingTask.value = { ...task }
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
  editingTask.value = null
}

const saveTask = async (taskData) => {
  try {
    if (editingTask.value) {
      await ApiService.updateTask(editingTask.value._id, taskData)
    } else {
      await ApiService.createTask(taskData)
    }
    await loadTasks()
    closeTaskModal()
  } catch (error) {
    console.error('Error saving task:', error)
  }
}

const toggleTaskStatus = async (task) => {
  try {
    await ApiService.updateTask(task._id, {
      active: !task.active
    })
    await loadTasks()
  } catch (error) {
    console.error('Error toggling task status:', error)
  }
}

const confirmDelete = (task) => {
  taskToDelete.value = task
  showDeleteModal.value = true
}

const deleteTask = async () => {
  try {
    await ApiService.deleteTask(taskToDelete.value._id)
    await loadTasks()
    showDeleteModal.value = false
    taskToDelete.value = null
  } catch (error) {
    console.error('Error deleting task:', error)
  }
}
</script>

<style scoped>
.tasks-section {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.task-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.task-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #eee;
  color: #666;
}

.status-badge.active {
  background: #4CAF50;
  color: white;
}

.task-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.4;
}

.task-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
}

.stat-label {
  color: #666;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #f8f9fa;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-action {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-deactivate {
  background: #f44336;
}

@media (max-width: 768px) {
  .tasks-section {
    padding: 10px;
  }

  .tasks-grid {
    grid-template-columns: 1fr;
  }

  .task-card {
    padding: 15px;
  }

  .task-actions {
    flex-direction: column;
  }

  .task-actions button {
    width: 100%;
  }
}
</style>