<!-- src/components/admin/modals/TaskModal.vue -->
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ task ? 'Редактировать задание' : 'Создать задание' }}</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="task-form">
        <div class="form-group">
          <label for="title">Название</label>
          <input
              type="text"
              id="title"
              v-model="form.title"
              required
              class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="description">Описание</label>
          <textarea
              id="description"
              v-model="form.description"
              required
              rows="3"
              class="form-input"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="type">Тип задания</label>
            <select
                id="type"
                v-model="form.type"
                required
                class="form-input"
            >
              <option value="daily">Ежедневное</option>
              <option value="achievement">Достижение</option>
              <option value="special">Специальное</option>
            </select>
          </div>

          <div class="form-group">
            <label for="reward">Награда</label>
            <input
                type="number"
                id="reward"
                v-model.number="form.reward"
                required
                min="1"
                class="form-input"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="minLevel">Минимальный уровень</label>
            <input
                type="number"
                id="minLevel"
                v-model.number="form.requirements.level"
                min="1"
                class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="minIncome">Минимальный доход</label>
            <input
                type="number"
                id="minIncome"
                v-model.number="form.requirements.income"
                min="0"
                class="form-input"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="icon">Иконка</label>
          <input
              type="text"
              id="icon"
              v-model="form.icon"
              class="form-input"
              placeholder="URL иконки или название файла"
          >
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
                type="checkbox"
                v-model="form.active"
            >
            Активно
          </label>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="$emit('close')">
            Отмена
          </button>
          <button type="submit" class="btn-primary">
            {{ task ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  title: '',
  description: '',
  type: 'daily',
  reward: 100,
  requirements: {
    level: 1,
    income: 0
  },
  icon: 'default.png',
  active: true
})

onMounted(() => {
  if (props.task) {
    // Если редактируем существующее задание
    form.value = {
      ...props.task,
      requirements: {
        level: props.task.requirements?.level || 1,
        income: props.task.requirements?.income || 0
      }
    }
  }
})

const handleSubmit = () => {
  emit('save', { ...form.value })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 15px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>