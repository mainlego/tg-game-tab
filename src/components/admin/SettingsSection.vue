<!-- src/components/admin/SettingsSection.vue -->
<template>
  <div class="settings-section">
    <div class="section-header">
      <h2>Настройки игры</h2>
      <BaseButton type="primary" @click="saveSettings" :disabled="saving">
        {{ saving ? 'Сохранение...' : 'Сохранить настройки' }}
      </BaseButton>
    </div>

    <div class="settings-layout">
      <!-- Основные настройки -->
      <BaseCard>
        <h3>Основные настройки</h3>
        <div class="settings-grid">
          <FormGroup label="Базовая стоимость клика">
            <input
                type="number"
                v-model.number="settings.tapValue"
                class="form-input"
                min="1"
                step="1"
            />
          </FormGroup>

          <FormGroup label="Базовая энергия">
            <input
                type="number"
                v-model.number="settings.baseEnergy"
                class="form-input"
                min="100"
                step="100"
            />
          </FormGroup>

          <FormGroup label="Скорость восстановления энергии">
            <input
                type="number"
                v-model.number="settings.energyRegenRate"
                class="form-input"
                min="0.1"
                step="0.1"
            />
          </FormGroup>

          <FormGroup label="Множитель дохода">
            <input
                type="number"
                v-model.number="settings.incomeMultiplier"
                class="form-input"
                min="0.1"
                step="0.1"
            />
          </FormGroup>

          <FormGroup label="Множитель опыта">
            <input
                type="number"
                v-model.number="settings.expMultiplier"
                class="form-input"
                min="0.1"
                step="0.1"
            />
          </FormGroup>
        </div>
      </BaseCard>

      <!-- Настройки бустов -->
      <BaseCard>
        <h3>Настройки бустов</h3>
        <div class="settings-grid">
          <FormGroup label="Стоимость буста x3">
            <input
                type="number"
                v-model.number="settings.boosts.tap3xCost"
                class="form-input"
                min="1000"
                step="1000"
            />
          </FormGroup>

          <FormGroup label="Стоимость буста x5">
            <input
                type="number"
                v-model.number="settings.boosts.tap5xCost"
                class="form-input"
                min="1000"
                step="1000"
            />
          </FormGroup>

          <FormGroup label="Длительность бустов (часы)">
            <input
                type="number"
                v-model.number="boostDurationHours"
                class="form-input"
                min="1"
                step="1"
            />
          </FormGroup>
        </div>
      </BaseCard>

      <!-- Настройки инвестиций -->
      <BaseCard>
        <h3>Настройки инвестиций</h3>
        <div class="settings-grid">
          <FormGroup label="Базовая доходность инвестиций">
            <input
                type="number"
                v-model.number="settings.investments.baseReturn"
                class="form-input"
                min="0.1"
                step="0.1"
            />
          </FormGroup>

          <FormGroup label="Множитель уровня для инвестиций">
            <input
                type="number"
                v-model.number="settings.investments.levelMultiplier"
                class="form-input"
                min="0.1"
                step="0.1"
            />
          </FormGroup>
        </div>
      </BaseCard>

      <!-- Требования к уровням -->
      <BaseCard>
        <div class="card-header">
          <h3>Требования к уровням</h3>
          <BaseButton type="secondary" @click="addLevelRequirement">
            Добавить уровень
          </BaseButton>
        </div>

        <div class="level-requirements">
          <div
              v-for="(level, index) in settings.levelRequirements"
              :key="index"
              class="level-item"
          >
            <div class="level-header">
              <strong>Уровень {{ level.level }}</strong>
              <button
                  v-if="index > 0"
                  class="delete-btn"
                  @click="removeLevelRequirement(index)"
              >
                &times;
              </button>
            </div>

            <FormGroup label="Название уровня">
              <input
                  type="text"
                  v-model="level.title"
                  class="form-input"
              />
            </FormGroup>

            <FormGroup label="Необходимый доход">
              <input
                  type="number"
                  v-model.number="level.income"
                  class="form-input"
                  min="0"
                  step="1000"
              />
            </FormGroup>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { useAdminStore } from '../../stores/adminStore';
import BaseCard from '../ui/BaseCard.vue';
import BaseButton from '../ui/BaseButton.vue';
import FormGroup from '../ui/FormGroup.vue';
import { ApiService } from '../../services/apiService';

const adminStore = useAdminStore();
const notifications = inject('notifications');

const settings = ref({
  tapValue: 1,
  baseEnergy: 100,
  energyRegenRate: 1,
  incomeMultiplier: 1,
  expMultiplier: 1,
  boosts: {
    tap3xCost: 8000,
    tap5xCost: 25000,
    duration: 86400000 // 24 часа в миллисекундах
  },
  investments: {
    baseReturn: 1.5,
    levelMultiplier: 1.2
  },
  levelRequirements: [
    { level: 1, income: 0, title: 'Новичок' }
  ]
});

const saving = ref(false);

// Преобразование длительности буста из миллисекунд в часы и обратно
const boostDurationHours = computed({
  get() {
    return settings.value.boosts.duration / (1000 * 60 * 60);
  },
  set(value) {
    settings.value.boosts.duration = value * 1000 * 60 * 60;
  }
});

// Загрузка настроек
const loadSettings = async () => {
  try {
    // Сначала загружаем из админского стора (локальное состояние)
    settings.value = { ...adminStore.gameSettings };

    // Затем пытаемся получить настройки с сервера
    const response = await ApiService.getGameSettings();
    if (response.data) {
      settings.value = response.data;

      // Обновляем админский стор
      adminStore.updateGameSettings(response.data);
    }

    // Убедимся, что массив требований к уровням существует
    if (!settings.value.levelRequirements || !Array.isArray(settings.value.levelRequirements)) {
      settings.value.levelRequirements = [{ level: 1, income: 0, title: 'Новичок' }];
    }

    // Убедимся, что объект бустов существует
    if (!settings.value.boosts) {
      settings.value.boosts = {
        tap3xCost: 8000,
        tap5xCost: 25000,
        duration: 86400000
      };
    }

    // Убедимся, что объект инвестиций существует
    if (!settings.value.investments) {
      settings.value.investments = {
        baseReturn: 1.5,
        levelMultiplier: 1.2
      };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    notifications.addNotification({
      message: 'Ошибка при загрузке настроек',
      type: 'error'
    });
  }
};

// Сохранение настроек
const saveSettings = async () => {
  try {
    saving.value = true;

    // Сортируем требования к уровням по возрастанию
    settings.value.levelRequirements.sort((a, b) => a.level - b.level);

    // Обновляем настройки в сторе
    await adminStore.updateGameSettings(settings.value);

    // Отправляем на сервер
    await ApiService.updateGameSettings(settings.value);

    notifications.addNotification({
      message: 'Настройки успешно сохранены',
      type: 'success'
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    notifications.addNotification({
      message: 'Ошибка при сохранении настроек',
      type: 'error'
    });
  } finally {
    saving.value = false;
  }
};

// Добавление нового требования к уровню
const addLevelRequirement = () => {
  const nextLevel = settings.value.levelRequirements.length + 1;
  const lastLevel = settings.value.levelRequirements[settings.value.levelRequirements.length - 1];

  settings.value.levelRequirements.push({
    level: nextLevel,
    income: lastLevel.income * 2, // Удваиваем доход от предыдущего уровня
    title: `Уровень ${nextLevel}`
  });
};

// Удаление требования к уровню
const removeLevelRequirement = (index) => {
  if (index > 0) { // Нельзя удалить первый уровень
    settings.value.levelRequirements.splice(index, 1);

    // Пересчитываем номера уровней
    settings.value.levelRequirements.forEach((level, i) => {
      level.level = i + 1;
    });
  }
};

// Загрузка данных при монтировании
onMounted(async () => {
  await loadSettings();
});
</script>

<style scoped>
.settings-section {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.settings-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.level-requirements {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.level-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.delete-btn {
  background: #f44336;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

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

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>