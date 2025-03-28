<!-- src/pages/OnboardingPage.vue -->
<template>
  <div class="onboarding-container">
    <div class="onboarding-slides" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
      <div class="onboarding-slide" v-for="(slide, index) in slides" :key="index">
        <img :src="slide.image" :alt="`Слайд ${index + 1}`" class="slide-image" />
        <div class="slide-content">
          <h2 class="slide-title">{{ slide.title }}</h2>
          <p class="slide-description">{{ slide.description }}</p>
        </div>
      </div>
    </div>

    <div class="onboarding-controls">
      <div class="dots">
        <div
            v-for="(slide, index) in slides"
            :key="`dot-${index}`"
            class="dot"
            :class="{ active: currentSlide === index }"
            @click="goToSlide(index)"
        ></div>
      </div>

      <button
          v-if="currentSlide < slides.length - 1"
          class="next-button"
          @click="nextSlide"
      >
        Далее
      </button>

      <button
          v-else
          class="start-button"
          @click="finishOnboarding"
      >
        Начать игру
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentSlide = ref(0);

const slides = [
  {
    image: '/images/onboarding/1.jpg',
    title: 'Добро пожаловать!',
    description: 'Начни свой путь к финансовой независимости в увлекательной игровой форме.'
  },
  {
    image: '/images/onboarding/2.jpg',
    title: 'Развивай свой бизнес',
    description: 'Покупай активы, увеличивай пассивный доход и становись успешным.'
  },
  {
    image: '/images/onboarding/3.jpg',
    title: 'Выбирай свой стиль',
    description: 'По мере роста дохода ты сможешь сменить свой стиль и стать настоящим миллиардером.'
  },
  {
    image: '/images/onboarding/4.jpg',
    title: 'Особые награды',
    description: 'Разблокируй особые награды и участвуй в розыгрышах ценных призов.'
  }
];

function nextSlide() {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++;
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
}

function goToSlide(index) {
  currentSlide.value = index;
}

function finishOnboarding() {
  console.log('[ONBOARDING] Завершение онбординга');

  // Отмечаем, что пользователь прошел онбординг
  localStorage.setItem('onboardingCompleted', 'true');

  // Используем метод replace вместо push, чтобы заменить текущий маршрут
  // и избежать ненужных записей в истории браузера
  router.replace('/');
}
</script>

<style scoped>
.onboarding-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: var(--background-color);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.onboarding-slides {
  display: flex;
  flex: 1;
  transition: transform 0.4s ease;
}

.onboarding-slide {
  min-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
}

.slide-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  margin-bottom: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.slide-content {
  text-align: center;
  max-width: 300px;
}

.slide-title {
  font-size: 24px;
  margin-bottom: 12px;
  color: white;
  font-weight: 600;
}

.slide-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.onboarding-controls {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dots {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 6px;
  cursor: pointer;
}

.dot.active {
  background: var(--primary-color);
  width: 20px;
  border-radius: 4px;
}

.next-button, .start-button {
  padding: 12px 48px;
  border-radius: 24px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.next-button {
  background: var(--primary-color);
  color: white;
}

.start-button {
  background: linear-gradient(140.83deg, rgb(155, 105, 254) 0%, rgb(109, 67, 196) 100%);
  color: white;
}

.next-button:hover, .start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(140, 96, 227, 0.3);
}
</style>