<!-- src/components/admin/TasksSection.vue -->
<template>
  <div class="tasks-section">
    <div class="section-header">
      <h2>Управление заданиями</h2>
      <BaseButton type="primary" @click="openTaskModal()">
        Создать задание
      </BaseButton>
    </div>

    <div class="tasks-layout">
      <!-- Список заданий -->
      <BaseCard class="tasks-list">
        <div class="list-header">
          <h3>Список заданий</h3>
          <div class="filter-controls">
            <select v-model="filterType" class="form-input">
              <option value="all">Все типы</option>
              <option value="daily">Ежедневные</option>
              <option value="achievement">Достижения</option>
              <option value="special">Особые</option>
            </select>
            <select v-model="filterStatus" class="form-input">
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>
        </div>

        <LoadingSpinner v-if="loading" />

        <div v-else-if="filteredTasks.length === 0" class="empty-list">
          <p>Задания не найдены</p>
        </div>

        <div v-else class="tasks-table">
          <table>
            <thead>
            <tr>
              <th>Название</th>
              <th>Тип</th>
              <th>Награда</th>
              <th>Требования</th>
              <th>Выполнено</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="task in filteredTasks" :key="task.id">
              <td>{{ task.title }}</td>
              <td>{{ getTaskType(task.type) }}</td>
              <td>{{ formatMoney(task.reward) }}</td>
              <td>
                <div v-if="task.requirements?.level">Уровень: {{ task.requirements.level }}+</div>
                <div v-if="task.requirements?.income">Доход: {{ formatMoney(task.requirements.income) }}+</div>
              </td>
              <td>{{ task.completions || 0 }}</td>
              <td>
                  <span :class="['status-badge', task.active ? 'active' : 'inactive']">
                    {{ task.active ? 'Активно' : 'Неактивно' }}
                  </span>
              </td>
              <td class="actions">
                <button class="action-btn edit" @click="openTaskModal(task)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" @click="deleteTask(task)">
                  <i class="fas fa-trash"></i>
                </button>
                <button
                    class="action-btn toggle"
                    @click="toggleTaskStatus(task)"
                    :title="task.active ? 'Деактивировать' : 'Активировать'"
                >
                  <i :class="task.active ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>

      <!-- Статистика заданий -->
      <BaseCard class="tasks-stats">
        <h3>Статистика заданий</h3>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ tasks.length }}</div>
            <div class="stat-label">Всего заданий</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ activeTasks }}</div>
            <div class="stat-label">Активных заданий</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ totalCompletions }}</div>
            <div class="stat-label">Всего выполнений</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ totalRewards }}</div>
            <div class="stat-label">Выдано наград</div>
          </div>
        </div>

        <div class="task-type-chart">
          <h4>Распределение по типам</h4>
          <div class="type-bars">
            <div
                v-for="(count, type) in typeCounts"
                :key="type"
                class="type-bar"
                :style="{
                width: `${(count / tasks.length) * 100}%`,
                backgroundColor: getTypeColor(type)
              }"
            >
              <span class="type-name">{{ getTaskType(type) }}</span>
              <span class="type-count">{{ count }}</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Модальное окно для создания/редактирования задания -->
    <BaseModal
        v-if="showTaskModal"
        :title="currentTask.id ? 'Редактирование задания' : 'Создание нового задания'"
        @close="showTaskModal = false"
    >
      <BaseForm @submit="saveTask">
        <FormGroup label="Название задания">
          <input
              type="text"
              v-model="currentTask.title"
              class="form-input"
              required
          />
        </FormGroup>

        <FormGroup label="Описание">
          <textarea
              v-model="currentTask.description"
              class="form-input"
              rows="4"
              required
          ></textarea>
        </FormGroup>

        <FormGroup label="Тип задания">
          <select v-model="currentTask.type" class="form-input">
            <option value="daily">Ежедневное</option>
            <option value="achievement">Достижение</option>
            <option value="special">Особое</option>
          </select>
        </FormGroup>

        <FormGroup label="Награда">
          <input
              type="number"
              v-model.number="currentTask.reward"
              class="form-input"
              min="1"
              step="1"
              required
          />
        </FormGroup>

        <FormGroup label="Иконка (URL)">
          <input
              type="text"
              v-model="currentTask.icon"
              class="form-input"
              placeholder="URL изображения или путь"
          />
        </FormGroup>

        <FormGroup label="Минимальный уровень">
          <input
              type="number"
              v-model.number="currentTask.requirements.level"
              class="form-input"
              min="1"
              step="1"
          />
        </FormGroup>

        <FormGroup label="Минимальный доход">
          <input
              type="number"
              v-model.number="currentTask.requirements.income"
              class="form-input"
              min="0"
              step="1000"
          />
        </FormGroup>

        <FormGroup>
          <label class="checkbox-label">
            <input type="checkbox" v-model="currentTask.active" />
            Задание активно
          </label>
        </FormGroup>

        <div class="form-actions">
          <BaseButton type="secondary" @click="showTaskModal = false">
            Отмена
          </BaseButton>
          <BaseButton type="primary" :disabled="saving">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </BaseButton>
        </div>
      </BaseForm>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { ApiService } from '../../services/apiService';
import BaseCard from '../ui/BaseCard.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseForm from '../ui/BaseForm.vue';
import FormGroup from '../ui/FormGroup.vue';
import BaseModal from '../ui/BaseModal.vue';
import LoadingSpinner from '../ui/LoadingSpinner.vue';

const notifications = inject('notifications');

// Состояние
const loading = ref(true);
const saving = ref(false);
const tasks = ref([]);
const showTaskModal = ref(false);
const filterType = ref('all');
const filterStatus = ref('all');

// Модель задания
const defaultTask = {
  title: '',
  description: '',
  type: 'daily',
  reward: 100,
  icon: 'default.png',
  requirements: {
    level: 1,
    income: 0
  },
  active: true
};

const currentTask = ref({ ...defaultTask });

// Вычисляемые свойства
const filteredTasks = computed(() => {
  let result = tasks.value;

  // Фильтрация по типу
  if (filterType.value !== 'all') {
    result = result.filter(task => task.type === filterType.value);
  }

  // Фильтрация по статусу
  if (filterStatus.value !== 'all') {
    const isActive = filterStatus.value === 'active';
    result = result.filter(task => task.active === isActive);
  }

  return result;
});

const activeTasks = computed(() => {
  return tasks.value.filter(t => t.active).length;
});

const totalCompletions = computed(() => {
  return tasks.value.reduce((sum, task) => sum + (task.completions || 0), 0);
});

const totalRewards = computed(() => {
  return tasks.value.reduce((sum, task) => sum + (task.reward * (task.completions || 0)), 0);
});

const typeCounts = computed(() => {
  const counts = {};
  tasks.value.forEach(task => {
    counts[task.type] = (counts[task.type] || 0) + 1;
  });
  return counts;
});

// Методы
const loadTasks = async () => {
  try {
    loading.value = true;
    const response = await ApiService.getTasks();
    tasks.value = response.data || [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    notifications.addNotification({
      message: 'Ошибка при загрузке заданий',
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};

const openTaskModal = (task = null) => {
  if (task) {
    currentTask.value = {
      ...task,
      requirements: task.requirements || { level: 1, income: 0 }
    };
  } else {
    currentTask.value = { ...defaultTask };
  }
  showTaskModal.value = true;
};

const saveTask = async () => {
  try {
    saving.value = true;

    let response;
    if (currentTask.value.id) {
      response = await ApiService.updateTask(
          currentTask.value.id,
          currentTask.value
      );
      notifications.addNotification({
        message: 'Задание успешно обновлено',
        type: 'success'
      });
    } else {
      response = await ApiService.createTask(currentTask.value);
      notifications.addNotification({
        message: 'Задание успешно создано',
        type: 'success'
      });
    }

    showTaskModal.value = false;
    await loadTasks();
  } catch (error) {
    console.error('Error saving task:', error);
    notifications.addNotification({
      message: 'Ошибка при сохранении задания',
      type: 'error'
    });
  } finally {
    saving.value = false;
  }
};

const deleteTask = async (task) => {
  if (confirm(`Вы действительно хотите удалить задание "${task.title}"?`)) {
    try {
      await ApiService.deleteTask(task.id);
      notifications.addNotification({
        message: 'Задание успешно удалено',
        type: 'success'
      });
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      notifications.addNotification({
        message: 'Ошибка при удалении задания',
        type: 'error'
      });
    }
  }
};

const toggleTaskStatus = async (task) => {
  try {
    await ApiService.updateTask(task.id, {
      active: !task.active
    });

    notifications.addNotification({
      message: `Задание ${task.active ? 'деактивировано' : 'активировано'}`,
      type: 'success'
    });

    await loadTasks();
  } catch (error) {
    console.error('Error toggling task status:', error);
    notifications.addNotification({
      message: 'Ошибка при изменении статуса задания',
      type: 'error'
    });
  }
};

// Вспомогательные функции
const formatMoney = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const getTaskType = (type) => {
  const types = {
    daily: 'Ежедневное',
    achievement: 'Достижение',
    special: 'Особое'
  };
  return types[type] || type;
};

const getTypeColor = (type) => {
  const colors = {
    daily: '#4caf50',    // Зеленый
    achievement: '#2196f3', // Синий
    special: '#ff9800'    // Оранжевый
  };
  return colors[type] || '#9e9e9e';
};

// Загрузка данных при монтировании
onMounted(async () => {
  await loadTasks();
});
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

.tasks-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.tasks-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge.active {
  background-color: #4caf50;
  color: white;
}

.status-badge.inactive {
  background-color: #f44336;
  color: white;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-btn.edit {
  color: #2196f3;
}

.action-btn.delete {
  color: #f44336;
}

.action-btn.toggle {
  color: #ff9800;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.task-type-chart {
  margin-top: 24px;
}

.task-type-chart h4 {
  margin-bottom: 16px;
}

.type-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  color: white;
  border-radius: 4px;
  min-width: 30px;
  transition: all 0.3s ease;
}

.type-count {
  font-weight: 700;
}

.empty-list {
  text-align: center;
  padding: 40px;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* Styles for form inputs */
.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  border-color: var(--primary-color, #8C60E3);
  outline: none;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .tasks-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .filter-controls {
    flex-direction: column;
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>