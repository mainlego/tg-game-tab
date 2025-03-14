<!-- src/components/Products.vue -->
<template>
  <div class="products-container">
    <div class="products-header">
      <h2>Продукты и награды</h2>
      <div class="income-info">
        <div class="income-label">Ваш пассивный доход:</div>
        <div class="income-value">{{ formatMoney(passiveIncome) }}</div>
      </div>
    </div>

    <div v-if="loading" class="products-loading">
      <div class="spinner"></div>
      <div>Загрузка продуктов...</div>
    </div>

    <div v-else-if="products.length === 0" class="products-empty">
      <p>Пока нет доступных продуктов</p>
      <p class="empty-subtitle">Вам нужно увеличить пассивный доход, чтобы получить доступ к продуктам</p>
    </div>

    <div v-else class="products-grid">
      <div
          v-for="product in products"
          :key="product.id"
          class="product-card"
          :class="{ 'product-unavailable': !product.available }"
          :style="{ background: product.gradient || defaultGradient }"
          @click="selectProduct(product)"
      >
        <div class="product-content">
          <div class="product-image-container">
            <img
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                class="product-image"
            />
            <div v-else class="product-no-image">
              <i class="fas fa-gift"></i>
            </div>
          </div>

          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-type">{{ getProductType(product.type) }}</p>

            <div class="product-income-requirement">
              <span>Требуется:</span>
              <span class="income-value">{{ formatMoney(product.requiredIncome) }}</span>
            </div>

            <div
                class="product-status"
                :class="{
                'status-available': product.available,
                'status-unavailable': !product.available
              }"
            >
              {{ product.available ? 'Доступно' : 'Недоступно' }}
            </div>

            <div v-if="product.claims && product.claims.length > 0" class="product-claims">
              <div
                  v-for="claim in product.claims"
                  :key="claim.id"
                  class="claim-item"
                  :class="`claim-${claim.status}`"
              >
                {{ getClaimStatus(claim.status) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно продукта -->
    <transition name="fade">
      <div v-if="showProductModal" class="product-modal-overlay" @click="closeProductModal">
        <div class="product-modal" @click.stop>
          <div class="modal-header" :style="{ background: selectedProduct.gradient || defaultGradient }">
            <button class="close-button" @click="closeProductModal">&times;</button>
            <h3>{{ selectedProduct.name }}</h3>
          </div>

          <div class="modal-body">
            <div class="product-details">
              <div class="product-image-large-container">
                <img
                    v-if="selectedProduct.image"
                    :src="selectedProduct.image"
                    :alt="selectedProduct.name"
                    class="product-image-large"
                />
                <div v-else class="product-no-image-large">
                  <i class="fas fa-gift"></i>
                </div>
              </div>

              <div class="product-description">
                {{ selectedProduct.description }}
              </div>

              <div class="product-details-info">
                <div class="detail-item">
                  <div class="detail-label">Тип:</div>
                  <div class="detail-value">{{ getProductType(selectedProduct.type) }}</div>
                </div>

                <div class="detail-item">
                  <div class="detail-label">Требуемый доход:</div>
                  <div class="detail-value">{{ formatMoney(selectedProduct.requiredIncome) }}</div>
                </div>

                <div class="detail-item">
                  <div class="detail-label">Ваш доход:</div>
                  <div class="detail-value">{{ formatMoney(passiveIncome) }}</div>
                </div>

                <div class="detail-item">
                  <div class="detail-label">Статус:</div>
                  <div
                      class="detail-value product-status"
                      :class="{
                      'status-available': selectedProduct.available,
                      'status-unavailable': !selectedProduct.available
                    }"
                  >
                    {{ selectedProduct.available ? 'Доступно' : 'Недоступно' }}
                  </div>
                </div>
              </div>

              <div v-if="selectedProduct.claims && selectedProduct.claims.length > 0" class="user-claims">
                <h4>Ваши заявки</h4>
                <div
                    v-for="claim in selectedProduct.claims"
                    :key="claim.id"
                    class="claim-detail"
                    :class="`claim-${claim.status}`"
                >
                  <div class="claim-status">{{ getClaimStatus(claim.status) }}</div>
                  <div class="claim-date">{{ formatDate(claim.createdAt) }}</div>
                </div>
              </div>

              <div v-if="selectedProduct.claimInstructions" class="claim-instructions">
                <h4>Инструкции по получению</h4>
                <p>{{ selectedProduct.claimInstructions }}</p>
              </div>
            </div>

            <div class="modal-actions">
              <button
                  class="claim-button"
                  :disabled="!selectedProduct.available || hasActiveClaim"
                  @click="claimProduct"
              >
                {{ hasActiveClaim ? 'Заявка уже отправлена' : 'Получить' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Модальное окно подтверждения заявки -->
    <transition name="fade">
      <div v-if="showConfirmModal" class="confirm-modal-overlay" @click="closeConfirmModal">
        <div class="confirm-modal" @click.stop>
          <div class="modal-header">
            <button class="close-button" @click="closeConfirmModal">&times;</button>
            <h3>Подтверждение заявки</h3>
          </div>

          <div class="modal-body">
            <p>Вы уверены, что хотите отправить заявку на получение "{{ selectedProduct.name }}"?</p>

            <div v-if="selectedProduct.claimInstructions" class="confirm-instructions">
              <h4>Инструкции</h4>
              <p>{{ selectedProduct.claimInstructions }}</p>
            </div>

            <div class="confirm-actions">
              <button class="cancel-button" @click="closeConfirmModal">Отмена</button>
              <button
                  class="confirm-button"
                  :disabled="submittingClaim"
                  @click="submitClaim"
              >
                {{ submittingClaim ? 'Отправка...' : 'Подтвердить' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Модальное окно успешной отправки заявки -->
    <transition name="fade">
      <div v-if="showSuccessModal" class="success-modal-overlay" @click="closeSuccessModal">
        <div class="success-modal" @click.stop>
          <div class="modal-header">
            <button class="close-button" @click="closeSuccessModal">&times;</button>
            <h3>Заявка отправлена</h3>
          </div>

          <div class="modal-body">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>

            <p>Ваша заявка на "{{ selectedProduct.name }}" успешно отправлена!</p>
            <p class="success-subtitle">Мы уведомим вас о статусе заявки.</p>

            <div class="success-actions">
              <button class="success-button" @click="closeSuccessModal">Закрыть</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { useTelegram } from '../composables/useTelegram';
import { ApiService } from '../services/apiService';

const gameStore = useGameStore();
const { user } = useTelegram();

const loading = ref(true);
const products = ref([]);
const passiveIncome = ref(0);
const selectedProduct = ref(null);
const showProductModal = ref(false);
const showConfirmModal = ref(false);
const showSuccessModal = ref(false);
const submittingClaim = ref(false);
const defaultGradient = 'linear-gradient(140.83deg, rgb(111, 95, 242) 0%, rgb(73, 51, 131) 100%)';

// Загрузка продуктов
const loadProducts = async () => {
  try {
    loading.value = true;

    // Используем ID пользователя из Telegram или из локального хранилища
    const telegramId = user.value?.id || localStorage.getItem('userId');

    if (!telegramId) {
      throw new Error('ID пользователя недоступен');
    }

    const response = await ApiService.getUserProducts(telegramId);

    if (response.success && response.data) {
      products.value = response.data.products || [];
      passiveIncome.value = response.data.passiveIncome || 0;
    } else {
      throw new Error('Неверный формат ответа от API');
    }
  } catch (error) {
    console.error('Error loading products:', error);
    // Используем локальное состояние как запасной вариант
    passiveIncome.value = gameStore.passiveIncome;
  } finally {
    loading.value = false;
  }
};

// Выбор продукта для просмотра
const selectProduct = (product) => {
  selectedProduct.value = product;
  showProductModal.value = true;
};

// Закрытие модального окна продукта
const closeProductModal = () => {
  showProductModal.value = false;
};

// Инициирование процесса получения продукта
const claimProduct = () => {
  if (!selectedProduct.value.available) return;
  if (hasActiveClaim.value) return;

  showProductModal.value = false;
  showConfirmModal.value = true;
};

// Закрытие модального окна подтверждения
const closeConfirmModal = () => {
  showConfirmModal.value = false;
};

// Отправка заявки на продукт
const submitClaim = async () => {
  try {
    submittingClaim.value = true;

    const telegramId = user.value?.id || localStorage.getItem('userId');

    if (!telegramId) {
      throw new Error('ID пользователя недоступен');
    }

    const response = await ApiService.createProductClaim(
        selectedProduct.value.id,
        telegramId,
        user.value || {}
    );

    if (response.success && response.data) {
      // Добавляем новую заявку в список заявок продукта
      if (!selectedProduct.value.claims) {
        selectedProduct.value.claims = [];
      }

      selectedProduct.value.claims.push(response.data.claim);

      // Обновляем список заявок в списке продуктов
      const productIndex = products.value.findIndex(p => p.id === selectedProduct.value.id);
      if (productIndex !== -1) {
        products.value[productIndex].claims = selectedProduct.value.claims;
      }

      showConfirmModal.value = false;
      showSuccessModal.value = true;
    } else {
      throw new Error('Ошибка создания заявки');
    }
  } catch (error) {
    console.error('Error creating claim:', error);
    alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.');
    showConfirmModal.value = false;
  } finally {
    submittingClaim.value = false;
  }
};

// Закрытие модального окна успешной отправки
const closeSuccessModal = () => {
  showSuccessModal.value = false;
};

// Проверка наличия активной заявки
const hasActiveClaim = computed(() => {
  if (!selectedProduct.value || !selectedProduct.value.claims) return false;

  return selectedProduct.value.claims.some(claim =>
      claim.status === 'pending' || claim.status === 'processing'
  );
});

// Получение типа продукта
const getProductType = (type) => {
  const types = {
    physical: 'Физический товар',
    digital: 'Цифровой товар',
    service: 'Услуга'
  };
  return types[type] || type;
};

// Получение статуса заявки
const getClaimStatus = (status) => {
  const statuses = {
    pending: 'Ожидает обработки',
    processing: 'В процессе',
    completed: 'Выполнена',
    cancelled: 'Отменена'
  };
  return statuses[status] || status;
};

// Форматирование денежных значений
const formatMoney = (value) => {
  if (!value && value !== 0) return '0';

  // Форматируем с разделителем тысяч
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleString('ru-RU');
};

// Загрузка продуктов при монтировании компонента
onMounted(async () => {
  await loadProducts();
});
</script>

<style scoped>
.products-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.products-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.income-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.income-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.income-value {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.products-loading, .products-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: white;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-subtitle {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
  position: relative;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-unavailable {
  opacity: 0.7;
}

.product-unavailable::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.product-content {
  padding: 16px;
  color: white;
  position: relative;
  z-index: 2;
}

.product-image-container {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-no-image {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 32px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.product-type {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

.product-income-requirement {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  margin-top: 4px;
}

.product-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
  text-align: center;
}

.status-available {
  background: rgba(76, 175, 80, 0.3);
  color: #a5ffb4;
}

.status-unavailable {
  background: rgba(244, 67, 54, 0.3);
  color: #ffa5a5;
}

.product-claims {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.claim-item {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.claim-pending {
  background: rgba(255, 193, 7, 0.3);
  color: #ffe082;
}

.claim-processing {
  background: rgba(33, 150, 243, 0.3);
  color: #90caf9;
}

.claim-completed {
  background: rgba(76, 175, 80, 0.3);
  color: #a5d6a7;
}

.claim-cancelled {
  background: rgba(244, 67, 54, 0.3);
  color: #ef9a9a;
}

/* Модальные окна */
.product-modal-overlay,
.confirm-modal-overlay,
.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.product-modal,
.confirm-modal,
.success-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  position: relative;
  padding: 16px;
  color: white;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.modal-body {
  padding: 20px;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-image-large-container {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.product-image-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-no-image-large {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  border-radius: 50%;
  font-size: 40px;
  color: #666;
}

.product-description {
  line-height: 1.5;
  color: #333;
}

.product-details-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
}

.detail-label {
  font-weight: 500;
  color: #666;
}

.detail-value {
  font-weight: 500;
  color: #333;
}

.user-claims {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-claims h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.claim-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
}

.claim-date {
  font-size: 12px;
  color: #666;
}

.claim-instructions {
  background: #f0f7ff;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.claim-instructions h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #2196f3;
}

.claim-instructions p {
  margin: 0;
  line-height: 1.5;
  color: #333;
}

.modal-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.claim-button {
  padding: 12px 24px;
  background: #8C60E3;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.claim-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.claim-button:hover:not(:disabled) {
  background: #7641e0;
}

/* Модальное окно подтверждения */
.confirm-instructions {
  background: #f0f7ff;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
}

.confirm-instructions h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #2196f3;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-button {
  padding: 10px 20px;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-button {
  padding: 10px 20px;
  background: #8C60E3;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Модальное окно успеха */
.success-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 64px;
  color: #4caf50;
}

.success-subtitle {
  color: #666;
  text-align: center;
}

.success-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.success-button {
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Медиа-запросы для адаптивности */
@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .product-image-container {
    height: 120px;
  }

  .product-name {
    font-size: 16px;
  }

  .income-value {
    font-size: 16px;
  }

  .product-modal,
  .confirm-modal,
  .success-modal {
    max-width: 95%;
  }
}
</style>