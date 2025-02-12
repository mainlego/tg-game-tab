<!-- src/components/layout/Header.vue -->
<template>
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
  padding: 0.75rem 1rem;
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
  text-align: right;
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
</style>