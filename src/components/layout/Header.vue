<!-- src/components/layout/Header.vue -->
<template>
  <div class="header-wrapper">
    <header class="header">
      <!-- Профиль -->
      <div class="profile">
        <div class="profile__avatar" v-if="user">
          <img v-if="user.photo_url" :src="user.photo_url" alt="avatar" class="avatar-image">
          <svg v-else viewBox="0 0 32 33" fill="none">
            <rect width="32" height="33" rx="8" fill="#423361"/>
            <path d="M16.5 16.5C15.3312 16.5 14.3307 16.0839 13.4984 15.2516C12.6661 14.4193 12.25 13.4187 12.25 12.25C12.25 11.0812 12.6661 10.0807 13.4984 9.24844C14.3307 8.41615 15.3312 8 16.5 8C17.6687 8 18.6693 8.41615 19.5016 9.24844C20.3339 10.0807 20.75 11.0812 20.75 12.25C20.75 13.4187 20.3339 14.4193 19.5016 15.2516C18.6693 16.0839 17.6687 16.5 16.5 16.5Z"
                  fill="#8776AA"/>
          </svg>
        </div>
        <div class="profile__info">
          <div class="profile__name">{{ userName }}</div>
          <div class="profile__level">{{ store.level.title }}</div>
        </div>
      </div>

      <!-- Доход -->
      <div class="income">
        <div>
          <div class="income__label">Пассивный доход в месяц</div>
          <div class="income__amount">{{ store.formattedPassiveIncome }}</div>
        </div>
        <img src="/images/safe.png" alt="Доход" class="income__icon">
      </div>
    </header>

    <!-- Статус и прогресс -->
    <div class="status">
      <div class="status__level">
        {{ store.level.title }}
        <svg width="12" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M11.8067 7.52646C11.8692 7.58844 11.9187 7.66217 11.9526 7.74341C11.9864 7.82465 12.0039 7.91179 12.0039 7.9998C12.0039 8.08781 11.9864 8.17494 11.9526 8.25618C11.9187 8.33742 11.8692 8.41116 11.8067 8.47313L6.47333 13.8065C6.41136 13.8689 6.33762 13.9185 6.25638 13.9524C6.17515 13.9862 6.08801 14.0037 6 14.0037C5.91199 14.0037 5.82485 13.9862 5.74362 13.9524C5.66238 13.9185 5.58864 13.8689 5.52667 13.8065C5.46418 13.7445 5.41459 13.6708 5.38074 13.5895C5.34689 13.5083 5.32947 13.4211 5.32947 13.3331C5.32947 13.2451 5.34689 13.158 5.38074 13.0767C5.41459 12.9955 5.46418 12.9218 5.52667 12.8598L10.3933 7.9998L5.52667 3.1398C5.40113 3.01426 5.33061 2.844 5.33061 2.66646C5.33061 2.48893 5.40113 2.31867 5.52667 2.19313C5.6522 2.0676 5.82247 1.99707 6 1.99707C6.17753 1.99707 6.3478 2.0676 6.47333 2.19313L11.8067 7.52646Z"
                fill="white"/>
        </svg>
      </div>
      <div class="status__score">
        <span class="current-score">{{ store.level.current }}</span>
        <span class="score-separator">/</span>
        <span class="max-score">{{ store.level.max }}</span>
      </div>
    </div>

    <div class="progress-container">
      <div class="progress-fill" :style="{ width: `${store.level.progress}%` }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useTelegram } from '@/composables/useTelegram'

const store = useGameStore()
const { user } = useTelegram()

const userName = computed(() => {
  if (user.value) {
    return user.value.first_name + (user.value.last_name ? ' ' + user.value.last_name : '')
  }
  return 'Игрок'
})
</script>

<style scoped>


.header {
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.profile__avatar {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile__name {
  font-size: 14px;
  font-weight: 700;
}

.profile__level {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.income {
  display: flex;
  align-items: center;
  text-align: center;
}

.income__label {
  font-size: 8px;
  font-weight: 500;
  opacity: 0.5;
}

.income__amount {
  font-size: 20px;
  font-weight: 600;
  line-height: 22px;
}

.income__icon {
  width: 40px;
  height: 40px;
  margin-left: 10px;
}

/* Статус и прогресс */
.status {
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  margin-top: 10px;
  font-size: 10px;
  color: white;
}

.status__level {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status__score {
  display: flex;
  gap: 3px;
}

.max-score {
  opacity: 0.5;
}

.progress-container {
  width: 93%;
  height: 12px;
  margin: 10px auto 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: url('/images/progress.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: left center;
  transition: width 0.5s ease-in-out;
}
</style>