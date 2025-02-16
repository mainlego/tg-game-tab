<!-- src/components/admin/SettingsSection.vue -->
<template>
  <div class="settings-section">
    <h2>Настройки игры</h2>

    <form @submit.prevent="saveSettings" class="settings-form">
      <div class="settings-group">
        <h3>Базовые настройки</h3>

        <div class="setting-item">
          <label>Монет за клик</label>
          <div class="setting-input">
            <input
                type="number"
                v-model="settings.tapValue"
                class="form-input"
                min="1"
            >
          </div>
        </div>

        <div class="setting-item">
          <label>Базовая энергия</label>
          <div class="setting-input">
            <input
                type="number"
                v-model="settings.baseEnergy"
                class="form-input"
                min="100"
                step="100"
            >
          </div>
        </div>

        <div class="setting-item">
          <label>Восстановление энергии (в секунду)</label>
          <div class="setting-input">
            <input
                type="number"
                v-model="settings.energyRegenRate"
                class="form-input"
                min="0.1"
                step="0.1"
            >
          </div>
        </div>
      </div>

      <div class="settings-group">
        <h3>Множители</h3>

        <div class="setting-item">
          <label>Множитель дохода</label>
          <div class="setting-input">
            <input
                type="number"
                v-model="settings.incomeMultiplier"
                class="form-input"
                min="1"
                step="0.1"
            >
          </div>
        </div>

        <div class="setting-item">
          <label>Множитель опыта</label>
          <div class="setting-input">
            <input
                type="number"
                v-model="settings.expMultiplier"
                class="form-input"
                min="1"
                step="0.1"
            >
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="resetSettings">
          Сбросить
        </button>
        <button type="submit" class="btn-primary">
          Сохранить настройки
        </button>
      </div>
    </form>

    <div class="settings-preview">
      <h3>Предпросмотр настроек</h3>
      <div class="preview-content">
        <div class="preview-item">
          <span class="preview-label">Клик 1000 раз:</span>
          <span class="preview-value">{{ formatMoney(previewClickReward) }}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Восстановление энергии за час:</span>
          <span class="preview-value">{{ Math.floor(settings.energyRegenRate * 3600) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'

const adminStore = useAdminStore()

// Загрузка текущих настроек
const settings = ref({
  tapValue: 1,
  baseEnergy: 100,
  energyRegenRate: 1,
  incomeMultiplier: 1,
  expMultiplier: 1
})

// Предварительные расчеты
const previewClickReward = computed(() => {
  return settings.value.tapValue * settings.value.incomeMultiplier * 1000
})

// Методы
const saveSettings = async () => {
  try {
    await adminStore.updateGameSettings(settings.value)
    alert('Настройки успешно сохранены')
  } catch (error) {
    console.error('Error saving settings:', error)
    alert('Ошибка при сохранении настроек')
  }
}

const resetSettings = () => {
  if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
    settings.value = {
      tapValue: 1,
      baseEnergy: 100,
      energyRegenRate: 1,
      incomeMultiplier: 1,
      expMultiplier: 1
    }
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

onMounted(() => {
  // Загружаем текущие настройки при монтировании компонента
  settings.value = { ...adminStore.gameSettings }
})
</script>

<style scoped>
.settings-section {
  padding: 20px;
}

.settings-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  height: 90vh;
  overflow: scroll;
}

.settings-group {
  margin-bottom: 24px;
}

.settings-group h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.setting-item label {
  flex: 1;
  font-size: 14px;
  color: #666;
}

.setting-input {
  width: 200px;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
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

.settings-preview {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.settings-preview h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.preview-label {
  color: #666;
  font-size: 14px;
}

.preview-value {
  font-weight: 600;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .settings-section {
    padding: 10px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .setting-input {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }

  .preview-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>