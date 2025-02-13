<!-- src/pages/Friends.vue -->
<template>
  <div class="friends-page">
    <Header />
    <Balance />

    <div class="friends-container">
      <h2 class="friends-title">Пригласите друзей!</h2>
      <p class="friends-subtitle">Вы и ваш друг получите бонусы</p>

      <!-- Награды за приглашения -->
      <div class="rewards-list">
        <div
            v-for="reward in rewards"
            :key="reward.count"
            class="reward-item"
            :class="{ 'reward-completed': reward.completed }"
            @click="handleRewardClaim(reward)"
        >
          <div class="reward-image">
            <img :src="reward.image" :alt="'Пригласи ' + reward.count + ' друзей'">
          </div>
          <div class="reward-info">
            <div class="reward-text">Пригласи {{ reward.count }} друзей</div>
            <div class="reward-amount">
              <img src="@/assets/images/coin.png" alt="coin" class="coin-icon">
              <span>+{{ reward.amount }}K</span>
            </div>
          </div>
          <div class="reward-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Список друзей -->
      <div class="friends-section">
        <div class="friends-header">
          <h3>Список ваших друзей ({{ friends.length }})</h3>
          <button class="refresh-button" @click="loadReferrals">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="friends-list">
          <div v-if="friends.length === 0" class="no-friends">
            У вас пока нет рефералов
          </div>
          <div v-for="friend in friends" :key="friend.id" class="friend-item">
            <div class="friend-avatar">
              <svg v-if="!friend.userData?.photo_url" viewBox="0 0 32 33" fill="none">
                <rect width="32" height="33" rx="8" fill="#423361"/>
                <path d="M16.5 16.5C15.3312 16.5 14.3307 16.0839 13.4984 15.2516C12.6661 14.4193 12.25 13.4187 12.25 12.25C12.25 11.0812 12.6661 10.0807 13.4984 9.24844C14.3307 8.41615 15.3312 8 16.5 8C17.6687 8 18.6693 8.41615 19.5016 9.24844C20.3339 10.0807 20.75 11.0812 20.75 12.25C20.75 13.4187 20.3339 14.4193 19.5016 15.2516C18.6693 16.0839 17.6687 16.5 16.5 16.5Z"
                      fill="#8776AA"/>
              </svg>
              <img v-else :src="friend.userData.photo_url" :alt="friend.userData.first_name" class="avatar-image">
            </div>
            <div class="friend-info">
              <div class="friend-name">{{ friend.userData?.first_name || 'Неизвестный пользователь' }}</div>
              <div class="friend-income">
                <img src="@/assets/images/coin.png" alt="coin" class="coin-icon">
                <span>{{ formatMoney(store.passiveIncome) }}</span>
              </div>
            </div>
            <div class="friend-reward" v-if="!friend.rewardClaimed">
              <img src="@/assets/images/coin.png" alt="coin" class="coin-icon">
              <span>+175K</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопка приглашения -->
      <button class="invite-button" @click="inviteFriend">
        Пригласить друга
      </button>
    </div>

    <Navigation />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useTelegram } from '@/composables/useTelegram';
import { useApi } from '@/composables/useApi';
import Header from '@/components/layout/Header.vue';
import Balance from '@/components/game/Balance.vue';
import Navigation from '@/components/layout/Navigation.vue';

const store = useGameStore();
const { tg, user } = useTelegram();
const api = useApi();
const { log } = inject('logger');
const notifications = inject('notifications');

// Награды за приглашения
const rewards = ref([
  { count: 3, amount: 175, image: '/images/friends/1.png', completed: false },
  { count: 7, amount: 175, image: '/images/friends/2.png', completed: false },
  { count: 10, amount: 175, image: '/images/friends/3.png', completed: false },
  { count: 25, amount: 175, image: '/images/friends/4.png', completed: false }
]);

// Список друзей-рефералов
const friends = ref([]);

// Загрузка рефералов
const loadReferrals = async () => {
  if (!user.value?.id) {
    log('DEBUG: No user ID available', user.value);
    return;
  }

  try {
    log('DEBUG: Fetching referrals for user:', user.value.id);
    const response = await api.getReferrals(user.value.id);
    log('DEBUG: Referrals response:', response);

    if (response?.success && Array.isArray(response.data)) {
      friends.value = response.data;
      log('DEBUG: Updated friends list:', friends.value);
    }

    checkRewardsProgress();
  } catch (error) {
    log('DEBUG: Error loading referrals:', error);
    notifications.addNotification({
      message: 'Ошибка при загрузке рефералов',
      type: 'error'
    });
  }
};

// Форматирование чисел
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

// Проверка доступности наград
const checkRewardsProgress = () => {
  rewards.value.forEach(reward => {
    const unclaimedReferrals = friends.value.filter(f => !f.rewardClaimed);
    reward.available = unclaimedReferrals.length >= reward.count && !reward.completed;
  });
};

// Обработка получения награды
const handleRewardClaim = async (reward) => {
  if (!reward.available) {
    const unclaimedCount = friends.value.filter(f => !f.rewardClaimed).length;
    notifications.addNotification({
      message: `Пригласите ещё ${reward.count - unclaimedCount} друзей`,
      type: 'warning'
    });
    return;
  }

  try {
    // Получаем необходимое количество невознагражденных рефералов
    const unclaimedReferrals = friends.value
        .filter(f => !f.rewardClaimed)
        .slice(0, reward.count);

    // Отмечаем рефералов как вознагражденных
    for (const referral of unclaimedReferrals) {
      await api.updateReferral(referral.id, { rewardClaimed: true });
    }

    // Начисляем награду
    store.balance += reward.amount * 1000;
    reward.completed = true;
    reward.available = false;

    notifications.addNotification({
      message: `Получено ${reward.amount}K монет!`,
      type: 'success'
    });

    // Обновляем список рефералов
    await loadReferrals();
  } catch (error) {
    log('Error claiming reward:', error);
    notifications.addNotification({
      message: 'Ошибка при получении награды',
      type: 'error'
    });
  }
};

// Приглашение друга
const inviteFriend = () => {
  if (!user.value) {
    log('No user available for invite');
    return;
  }

  const startCommand = `ref_${user.value.id}`;
  const botUsername = 'your_bot_username'; // Замените на имя вашего бота
  const referralLink = `https://t.me/${botUsername}?start=${startCommand}`;

  const message = `Привет! У меня есть кое-что крутое для тебя - первая игра генерирующая пассивный доход\n\nПрисоединяйся, будем генерить доход вместе: ${referralLink}`;

  if (tg.value) {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
    window.open(shareUrl, '_blank');
  } else {
    navigator.clipboard.writeText(message);
    notifications.addNotification({
      message: 'Ссылка скопирована в буфер обмена',
      type: 'success'
    });
  }
};

// Загрузка данных при монтировании
onMounted(() => {
  if (user.value) {
    loadReferrals();
  }
});

// Следим за изменением пользователя
watch(() => user.value, (newUser) => {
  if (newUser) {
    loadReferrals();
  }
});
</script>

<style scoped>
.friends-page {
  min-height: 100vh;
  padding: 0 1rem;
  padding-bottom: 80px;
  background: url('@/assets/images/bg.jpg') center top no-repeat;
}

.friends-container {
  margin-top: 20px;
  overflow: scroll;
  height: 60vh;
}

.friends-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 8px;
}

.friends-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: 24px;
}

.rewards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.reward-item {
  background: #2A163B;
  border: 1px solid rgba(140, 96, 227, 0.3);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reward-item:hover {
  background: rgba(140, 96, 227, 0.1);
}

.reward-image {
  width: 64px;
  height: 64px;
  margin-right: 12px;
}

.reward-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.reward-info {
  flex: 1;
}

.reward-text {
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin-bottom: 4px;
}

.reward-amount {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
}

.coin-icon {
  width: 16px;
  height: 16px;
}

.reward-arrow {
  color: rgba(255, 255, 255, 0.5);
}

.friends-section {
  background: none;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
}

.friends-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.friends-header h3 {
  font-size: 14px;
  color: white;
}

.refresh-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
}

.refresh-button:hover {
  color: white;
}

.no-friends {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 20px;
}

.friends-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: none;
  border: 1px solid rgba(140, 96, 227, 0.3);
  border-radius: 12px;
}

.friend-avatar {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin-bottom: 4px;
}

.friend-income {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.friend-reward {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.invite-button {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translate(-50%, 0);
  width: 80%;
  z-index: 9999;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.invite-button:hover {
  opacity: 0.9;
}

.invite-button:active {
  transform: translate(-50%, 1px);
}

.reward-completed {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Добавляем анимации */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.reward-item.available {
  animation: pulse 2s infinite;
}

/* Стили для скроллбара */
.friends-container::-webkit-scrollbar {
  width: 6px;
}

.friends-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.friends-container::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
}

/* Адаптивность для маленьких экранов */
@media (max-width: 360px) {
  .friends-title {
    font-size: 20px;
  }

  .friends-subtitle {
    font-size: 12px;
  }

  .reward-item {
    padding: 8px;
  }

  .reward-image {
    width: 48px;
    height: 48px;
  }

  .reward-text {
    font-size: 14px;
  }

  .invite-button {
    width: 90%;
    font-size: 14px;
    padding: 12px;
  }
}

/* Дополнительные стили для состояний и анимаций */
.friend-item:hover {
  border-color: rgba(140, 96, 227, 0.5);
  background: rgba(140, 96, 227, 0.1);
}

.friend-reward:not(.claimed) {
  animation: glow 1.5s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px var(--primary-color);
  }
  to {
    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px var(--primary-color);
  }
}

.refresh-button svg {
  transition: transform 0.3s ease;
}

.refresh-button:hover svg {
  transform: rotate(180deg);
}

.reward-arrow svg {
  transition: transform 0.2s ease;
}

.reward-item:hover .reward-arrow svg {
  transform: translateX(3px);
}
</style>