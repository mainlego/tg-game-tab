<!-- src/components/layout/Header.vue -->
<template>
  <header class="header">
    <!-- Профиль -->
    <div class="profile">
      <div class="profile__avatar">
        <svg viewBox="0 0 32 33" fill="none">
          <rect width="32" height="33" rx="8" fill="#423361"/>
          <path d="M16.5 16.5C15.3312 16.5 14.3307 16.0839 13.4984 15.2516C12.6661 14.4193 12.25 13.4187 12.25 12.25C12.25 11.0812 12.6661 10.0807 13.4984 9.24844C14.3307 8.41615 15.3312 8 16.5 8C17.6687 8 18.6693 8.41615 19.5016 9.24844C20.3339 10.0807 20.75 11.0812 20.75 12.25C20.75 13.4187 20.3339 14.4193 19.5016 15.2516C18.6693 16.0839 17.6687 16.5 16.5 16.5ZM10.975 25C9.33195 25 8 23.668 8 22.025C8 21.4229 8.15513 20.8697 8.46538 20.3654C8.77563 19.861 9.18717 19.4757 9.7 19.2094C10.7979 18.6604 11.9135 18.2489 13.0469 17.9747C14.1802 17.7006 15.3312 17.5632 16.5 17.5625C17.6687 17.5618 18.8198 17.6992 19.9531 17.9747C21.0865 18.2503 22.2021 18.6618 23.3 19.2094C23.8135 19.475 24.2254 19.8603 24.5357 20.3654C24.8459 20.8704 25.0007 21.4236 25 22.025C25 23.668 23.668 25 22.025 25H10.975Z"
                fill="#8776AA"/>
        </svg>
      </div>
      <div class="profile__name">Mr. Dubai</div>
    </div>

    <!-- Доход -->
    <div class="income">
      <div>
        <div class="income__label">Пассивный доход в месяц</div>
        <div class="income__amount">{{ store.formattedPassiveIncome }}</div>
      </div>
      <img src="@/assets/images/safe.png" alt="Доход" class="income__icon">
    </div>
  </header>

  <!-- Статус -->
  <div class="status">
    <div class="status__level">
      {{ store.level.title }}
      <svg width="12" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M11.8067 7.52646C11.8692 7.58844 11.9187 7.66217 11.9526 7.74341C11.9864 7.82465 12.0039 7.91179 12.0039 7.9998C12.0039 8.08781 11.9864 8.17494 11.9526 8.25618C11.9187 8.33742 11.8692 8.41116 11.8067 8.47313L6.47333 13.8065C6.41136 13.8689 6.33762 13.9185 6.25638 13.9524C6.17515 13.9862 6.08801 14.0037 6 14.0037C5.91199 14.0037 5.82485 13.9862 5.74362 13.9524C5.66238 13.9185 5.58864 13.8689 5.52667 13.8065C5.46418 13.7445 5.41459 13.6708 5.38074 13.5895C5.34689 13.5083 5.32947 13.4211 5.32947 13.3331C5.32947 13.2451 5.34689 13.158 5.38074 13.0767C5.41459 12.9955 5.46418 12.9218 5.52667 12.8598L10.3933 7.9998L5.52667 3.1398C5.40113 3.01426 5.33061 2.844 5.33061 2.66646C5.33061 2.48893 5.40113 2.31867 5.52667 2.19313C5.6522 2.0676 5.82247 1.99707 6 1.99707C6.17753 1.99707 6.3478 2.0676 6.47333 2.19313L11.8067 7.52646Z"
              fill="white"/>
      </svg>
    </div>
    <div class="status__level-counter">
      <span>{{ store.level.current }}</span>/<span>{{ store.level.max }}</span>
    </div>
  </div>

  <!-- Прогресс бар -->
  <div class="progress">
    <div class="progress__fill" :style="{ width: `${store.level.progress}%` }"></div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()
</script>

<style scoped>
/* CSS остается тем же */
.header {
  padding: 0.75rem 1rem 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile__avatar {
  width: 42px;
  height: 42px;
}

.profile__name {
  font-size: 12px;
  font-weight: 700;
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

.status {
  display: flex;
  padding: 0 1rem;
  justify-content: space-between;
  font-size: 10px;
  color: white;
  margin-top: 10px;
}

.status__level {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status__level-counter span:last-child {
  opacity: 0.5;
}

.progress {
  width: 93%;
  height: 12px;
  margin: 10px auto;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.progress__fill {
  height: 100%;
  background: url('@/assets/images/progress.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: left center;
  transition: width 0.5s ease-in-out;
}
</style>