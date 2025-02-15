<!-- src/components/admin/ProductModal.vue -->
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ product ? 'Редактировать продукт' : 'Создать продукт' }}</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="product-form">
        <div class="form-group">
          <label for="name">Название</label>
          <input
              type="text"
              id="name"
              v-model="form.name"
              required
              class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="description">Описание</label>
          <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="form-input"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="requiredIncome">Требуемый доход</label>
            <input
                type="number"
                id="requiredIncome"
                v-model="form.requiredIncome"
                required
                min="0"
                class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="image">URL изображения</label>
            <input
                type="text"
                id="image"
                v-model="form.image"
                class="form-input"
            >
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
                type="checkbox"
                v-model="form.active"
            >
            Активен
          </label>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Отмена
          </button>
          <button type="submit" class="btn btn-primary">
            {{ product ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  name: '',
  description: '',
  requiredIncome: 0,
  image: '',
  active: true
})

onMounted(() => {
  if (props.product) {
    form.value = { ...props.product }
  }
})

const handleSubmit = () => {
  emit('save', { ...form.value })
  emit('close')
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
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  color: #666;
}

.product-form {
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
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
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
}

.btn {
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
    padding: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>