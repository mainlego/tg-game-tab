  <!-- src/components/admin/TasksSection.vue - исправленный вывод заданий -->
    <template>
      <div class="section-container">
      <div class="tasks-section">
        <div class="section-header">
          <h2>Управление заданиями</h2>
          <BaseButton type="primary" @click="openTaskModal()">
            Создать задание
          </BaseButton>
        </div>

        <div class="tasks-layout">

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
                <div class="stat-value">{{ formatMoney(totalRewards) }}</div>
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

            <div v-else>
              <!-- Таблица для десктопа -->
              <div class="tasks-table desktop-only">
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
                  <tr v-for="task in filteredTasks" :key="'table-'+task.id">
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

              <!-- Карточки для мобильной версии -->
              <div class="task-cards mobile-only">
                <div v-for="task in filteredTasks" :key="'card-'+task.id" class="task-card">
                  <div class="task-card-header">
                    <h4>{{ task.title }}</h4>
                    <span :class="['status-badge', task.active ? 'active' : 'inactive']">
                  {{ task.active ? 'Активно' : 'Неактивно' }}
                </span>
                  </div>

                  <div class="task-card-content">
                    <div class="task-detail">
                      <strong>Тип:</strong> {{ getTaskType(task.type) }}
                    </div>
                    <div class="task-detail">
                      <strong>Награда:</strong> {{ formatMoney(task.reward) }}
                    </div>
                    <div class="task-detail" v-if="task.requirements?.level || task.requirements?.income">
                      <strong>Требования:</strong>
                      <div v-if="task.requirements?.level">Уровень: {{ task.requirements.level }}+</div>
                      <div v-if="task.requirements?.income">Доход: {{ formatMoney(task.requirements.income) }}+</div>
                    </div>
                    <div class="task-detail">
                      <strong>Выполнено:</strong> {{ task.completions || 0 }}
                    </div>
                  </div>

                  <div class="task-card-actions">
                    <button class="action-btn edit" @click="openTaskModal(task)">
                      <i class="fas fa-edit"></i>
                      <span>Редактировать</span>
                    </button>
                    <button class="action-btn delete" @click="deleteTask(task)">
                      <i class="fas fa-trash"></i>
                      <span>Удалить</span>
                    </button>
                    <button
                        class="action-btn toggle"
                        @click="toggleTaskStatus(task)"
                    >
                      <i :class="task.active ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
                      <span>{{ task.active ? 'Деактивировать' : 'Активировать' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>


        </div>

        <!-- Модальное окно для создания/редактирования задания -->
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

            <!-- Обновленная часть для формы в TasksSection -->
            <FormGroup label="Иконка">
              <div class="image-upload-container">
                <div v-if="imagePreview" class="image-preview">
                  <img :src="imagePreview" alt="Предпросмотр" />
                  <button type="button" class="remove-image" @click="removeImage">
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div class="upload-controls">
                  <input
                      type="file"
                      id="icon-upload"
                      ref="fileInput"
                      @change="handleFileUpload"
                      accept="image/*"
                      class="file-input"
                  />
                  <label for="icon-upload" class="upload-button">
                    <i class="fas fa-upload"></i>
                    Выбрать изображение
                  </label>

                  <p class="or-text">или</p>

                  <input
                      type="text"
                      v-model="currentTask.icon"
                      class="form-input"
                      placeholder="URL изображения или путь"
                  />
                </div>
              </div>
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

const fileInput = ref(null);
const imagePreview = ref(null);
const uploadedFile = ref(null);


// Обработка загрузки файла
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Проверка типа файла
  if (!file.type.match('image.*')) {
    notifications.addNotification({
      message: 'Пожалуйста, выберите изображение',
      type: 'error'
    });
    return;
  }

  // Проверка размера файла (макс. 2МБ)
  if (file.size > 2 * 1024 * 1024) {
    notifications.addNotification({
      message: 'Размер изображения не должен превышать 2МБ',
      type: 'error'
    });
    return;
  }

  // Сохраняем файл для последующей отправки
  uploadedFile.value = file;

  // Создаем URL для предпросмотра
  imagePreview.value = URL.createObjectURL(file);

  // Очищаем поле URL
  currentTask.value.icon = '';
};

// Удаление выбранного изображения
const removeImage = () => {
  imagePreview.value = null;
  uploadedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

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
    // Преобразуем _id в id для совместимости с фронтендом
    tasks.value = (response.data || []).map(task => ({
      ...task,
      id: task._id // Добавляем id для совместимости
    }));
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
  imagePreview.value = null;
  uploadedFile.value = null;

  if (task) {
    currentTask.value = {
      ...task,
      requirements: task.requirements || { level: 1, income: 0 }
    };

    // Если у задания есть иконка и она не URL, загружаем предпросмотр
    if (task.icon && !task.icon.startsWith('http') && !task.icon.startsWith('data:')) {
      // Предполагается, что изображения хранятся по пути /uploads/
      imagePreview.value = `${ApiService.API_URL}/uploads/${task.icon}`;
    }
  } else {
    currentTask.value = { ...defaultTask };
  }
  showTaskModal.value = true;
};

// В методе saveTask компонента TasksSection.vue

const saveTask = async () => {
  try {
    saving.value = true;

    const formData = new FormData();

    // Явно добавляем текстовые поля по одному
    formData.append('title', currentTask.value.title || '');
    formData.append('description', currentTask.value.description || '');
    formData.append('type', currentTask.value.type || 'daily');
    formData.append('reward', currentTask.value.reward || 100);

    // Преобразуем boolean в строку 'true' или 'false'
    formData.append('active', currentTask.value.active ? 'true' : 'false');

    // Преобразуем объект requirements в строку JSON
    if (currentTask.value.requirements) {
      formData.append('requirements', JSON.stringify(currentTask.value.requirements));
    }

    // Добавляем файл, если он выбран
    if (uploadedFile.value) {
      formData.append('taskImage', uploadedFile.value);
    } else if (currentTask.value.icon) {
      // Сохраняем существующую иконку
      formData.append('icon', currentTask.value.icon);
    }

    // Отладка - проверяем содержимое FormData
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    let response;
    if (currentTask.value._id) {
      response = await ApiService.updateTaskWithImage(currentTask.value._id, formData);
    } else {
      response = await ApiService.createTaskWithImage(formData);
    }

    notifications.addNotification({
      message: currentTask.value._id ? 'Задание успешно обновлено' : 'Задание успешно создано',
      type: 'success'
    });

    showTaskModal.value = false;
    await loadTasks();
  } catch (error) {
    console.error('Error saving task:', error);
    notifications.addNotification({
      message: 'Ошибка при сохранении задания: ' + error.message,
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

.section-container {
  width: 100%;
  max-height: 90vh;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;

}

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
  grid-template-columns: auto;
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

/* Мобильные карточки */
.task-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.task-card-header h4 {
  margin: 0;
  font-size: 16px;
  flex: 1;
}

.task-card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-detail {
  display: flex;
  flex-direction: column;
}

.task-card-actions {
  display: flex;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  gap: 8px;
  overflow-x: auto;
}

.task-card-actions .action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  white-space: nowrap;
  border-radius: 4px;
  font-size: 14px;
}

.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 300px;
  height: 150px;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  color: #f44336;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-image:hover {
  background-color: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.upload-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-input {
  display: none;
}

.upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.upload-button:hover {
  background-color: #eee;
  border-color: #ccc;
}

.or-text {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin: 4px 0;
}

.task-card-actions .action-btn.edit {
  background-color: rgba(33, 150, 243, 0.1);
}

.task-card-actions .action-btn.delete {
  background-color: rgba(244, 67, 54, 0.1);
}

.task-card-actions .action-btn.toggle {
  background-color: rgba(255, 152, 0, 0.1);
}

/* Управление видимостью для разных устройств */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .tasks-layout {
    grid-template-columns: 1fr;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .section-header h2 {
    width: 100%;
    margin-bottom: 8px;
  }

  .section-header button {
    width: 100%;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .filter-controls {
    width: 100%;
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  /* Уменьшаем отступы для мобильных устройств */
  .tasks-section {
    padding: 12px;
  }

  /* Модальное окно для мобильных */
  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}

/* Еще более мелкие экраны */
@media (max-width: 480px) {
  .task-card-actions {
    flex-direction: column;
  }

  .task-card-actions .action-btn {
    width: 100%;
    justify-content: center;
  }
  .type-bar{
    min-width: 100%;
  }

  .stats-grid {
    gap: 8px;
  }

  .stat-card {
    padding: 12px 8px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 12px;
  }
}
</style>