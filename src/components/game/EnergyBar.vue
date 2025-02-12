<!-- src/components/game/EnergyBar.vue -->
<template>
  <div class="energy-boost">
    <!-- Энергия -->
    <div class="energy-item" :class="{ 'no-energy': store.energy.current < 1 }">
      <div class="item-icon">
        <img src="@/assets/images/energy.png" alt="energy">
      </div>
      <div class="item-count">{{ store.formattedEnergy }}</div>
    </div>

    <!-- Ускорение -->
    <div class="energy-item" @click="$router.push('/boost')">
      <div class="item-icon">
        <img src="@/assets/images/money.png" alt="money">
      </div>
      <div class="item-text">Ускорение</div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/gameStore'

const store = useGameStore()
</script>

<style scoped>
.energy-boost {
  position: fixed;
  bottom: 4.8rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.energy-item {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s ease;
}

.energy-item:active {
  transform: scale(0.95);
}

.item-icon img {
  width: 28px;
  height: 28px;
}

.item-count,
.item-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
  text-shadow:
      1px 1px 0 black,
      -1px -1px 0 black,
      -1px 1px 0 black,
      1px -1px 0 black;
}

.item-text {
  cursor: pointer;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.no-energy {
  animation: shake 0.5s ease-in-out;
}
</style>