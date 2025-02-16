<!-- src/components/admin/SettingsSection.vue -->
<template>
  <div class="settings-section">
    <div class="section-header">
      <h2>Настройки игры</h2>
    </div>

    <form @submit.prevent="saveSettings" class="settings-form">
      <!-- Базовые настройки -->
      <div class="settings-group">
        <h3>Базовые настройки</h3>

        <div class="setting-item">
          <label>Монет за клик</label>
          <input
              type="number"
              v-model.number="settings.tapValue"
              min="1"
              class="form-input"
          >
        </div>

        <div class="setting-item">
          <label>Базовая энергия</label>
          <input
              type="number"
              v-model.number="settings.baseEnergy"
              min="100"
              step="100"
              class="form-input"
          >
        </div>

        <div class="setting-item">
          <label>Восстановление энергии (в секунду)</label>
          <input
              type="number"
              v-model.number="settings.energyRegenRate"
              min="0.1"
              step="0.1"
              class="form-input"
          >
        </div>
      </div>

      <!-- Множители -->
      <div class="settings-group">
        <h3>Множители</h3>

        <div class="setting-item">
          <label>Множитель дохода</label>
          <input
              type="number"
              v-model.number="settings.incomeMultiplier"
              min="1"
              step="0.1"
              class="form-input"
          >
        </div>

        <div class="setting-item">
          <label>Множитель опыта</label>
          <input
              type="number"
              v-model.number="settings.expMultiplier"
              min="1"
              step="0.1"
              class="form-input"
          >
        </div>
      </div>

      <!-- Настройки бустов -->
      <div class="settings-group">
        <h3>Настройки бустов</h3>

        <div class="setting-item">
          <label>Стоимость буста x3</label>
          <input
              type="number"
              v-model.number="settings.boosts.tap3xCost"
              min="1000"
              step="1000"
              class="form-input"
          >
        </div>

        <div class="setting-item">
          <label>Стоимость буста x5</label>
          <input
              type="number"
              v-model.number="settings.boosts.tap5xCost"
              min="1000"
              step="1000"
              class="form-input"
          >
        </div>

        <div class="setting-item">
          <label>Длительность бустов (часов)</label>
          <input
              type="number"
              v-model.number="settings.boosts.duration"
              min="1"
              max="72"
              step="1"
              class="form-input"
          >
        </div>
      </div>

      <!-- Настройки уровней -->
      <div class="settings-group">
        <h3>Настройки уровней</h3>

        <div v-for="(level, index) in settings.levelRequirements"
             :key="index"
             class="level-setting">
          <div class="level-header">
            <h4>Уровень {{ index + 1 }}</h4>
            <button type="button" class="btn-delete" @click="removeLevel(index)" v-if="index > 0">
              Удалить
            </button>
          </div>

          <div class="setting-item">
            <label>Название</label>
            <input
                type="text"
                v-model="level.title"
                class="form-input"
            >
          </div>

          <div class="setting-item">
            <label>Требуемый доход</label>
            <input
                type="number"
                v-model.number="level.income"
                min="0"
                step="1000"
                class="form-input"
            >
          </div>
        </div>

        <button type="button" class="btn-secondary" @click="addLevel">
          Добавить уровень
        </button>
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

    <!-- Модальное окно подтверждения сброса -->
    <ConfirmModal
        v-if="showResetModal"
        title="Сброс настроек"
        message="Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?"
        @confirm="confirmReset"
        @cancel="showResetModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ApiService } from '@/services/apiService'
import ConfirmModal from '@/components/admin/modals/ConfirmModal.vue'

const settings = ref({
  tapValue: 1,
  baseEnergy: 100,
  energyRegenRate: 1,
  incomeMultiplier: 1,
  expMultiplier: 1,
  boosts: {
    tap3xCost: 8000,
    tap5xCost: 25000,
    duration: 24 // в часах
  },
  levelRequirements: [
    { title: 'Пацан', income: 0 },
    { title: 'Курьер', income: 10000 },
    { title: 'Темщик', income: 70000 },
    { title: 'Продавец', income: 150000 },
    { title: 'Сотрудник', income: 300000 },
    { title: 'Менеджер', income: 800000 },
    { title: 'Владелец', income: 1800000 },
    { title: 'Аристократ', income: 20000000 },
    { title: 'Инвестор', income: 200000000 },
    { title: 'Миллиардер', income: 2500000000 }
  ]
})

const showResetModal = ref(false)

onMounted(async () => {
  await loadSettings()
})

const loadSettings = async () => {
  try {
    const data = await ApiService.getGameSettings()
    if (data) {
      settings.value = { ...settings.value, ...data }
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

const saveSettings = async () => {
  try {
    await ApiService.updateGameSettings(settings.value)
    alert('Настройки успешно сохранены')
  } catch (error) {
    console.error('Error saving settings:', error)
    alert('Ошибка при сохранении настроек')
  }
}

const resetSettings = () => {
  showResetModal.value = true
}

const confirmReset = async () => {
  try {
    await ApiService.updateGameSettings({
      tapValue: 1,
      baseEnergy: 100,
      energyRegenRate: 1,
      incomeMultiplier: 1,
      expMultiplier: 1,
      boosts: {
        tap3xCost: 8000,
        tap5xCost: 25000,
        duration: 24
      },
      levelRequirements: [
        { title: 'Пацан', income: 0 },
        { title: 'Курьер', income: 10000 },
        { title: 'Темщик', income: 70000 },
        { title: 'Продавец', income: 150000 },
        { title: 'Сотрудник', income: 300000 },
        { title: 'Менеджер', income: 800000 },
        { title: 'Владелец', income: 1800000 },
        { title: 'Аристократ', income: 20000000 },
        { title: 'Инвестор', income: 200000000 },
        { title: 'Миллиардер', income: 2500000000 }
      ]
    })
    await loadSettings()
    showResetModal.value = false
  } catch (error) {
    console.error('Error resetting settings:', error)
    alert('Ошибка при сбросе настроек')
  }
}

const addLevel = () => {
  settings.value.levelRequirements.push({
    title: `Уровень ${settings.value.levelRequirements.length + 1}`,
    income: 0
  })
}

const removeLevel = (index) => {
  settings.value.levelRequirements.splice(index, 1)
}
</script>

<style scoped>
.settings-section {
  padding: 20px;
}

.settings-form {
  max-width: 800px;
  margin: 0 auto;
}

.settings-group {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.settings-group h3 {
  margin: 0 0 20px;
  font-size: 18px;
  color: #333;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.setting-item label {
  flex: 1;
  margin-right: 20px;
  color: #666;
}

.form-input {
  width: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.level-setting {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.level-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary,
.btn-delete {
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

.btn-delete {
  background: #f44336;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .settings-section {
    padding: 10px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .setting-item label {
    margin-bottom: 8px;
  }

  .form-input {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>