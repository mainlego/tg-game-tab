<!-- src/components/admin/ProductsSection.vue -->
<template>
  <div class="products-section">
    <div class="section-header">
      <h2>Управление продуктами</h2>
      <button class="create-button" @click="showProductModal = true">
        Добавить продукт
      </button>
    </div>

    <!-- Список продуктов -->
    <div class="products-list"
         :class="{ 'dragging': isDragging }"
         @dragover.prevent
         @drop.prevent="handleDrop"
    >
      <div
          v-for="product in products"
          :key="product._id"
          class="product-card"
          draggable="true"
          @dragstart="handleDragStart($event, product)"
          @dragend="handleDragEnd"
          @dragover.prevent="handleDragOver($event, product)"
      >
        <div class="product-image">
          <img :src="product.image" :alt="product.name">
          <div class="drag-handle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 6H16M8 12H16M8 18H16" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>

        <div class="product-header">
          <h3>{{ product.name }}</h3>
          <span :class="['status-badge', { active: product.active }]">
            {{ product.active ? 'Активен' : 'Неактивен' }}
          </span>
        </div>

        <p class="product-description">{{ product.description }}</p>

        <div class="product-details">
          <div class="detail-item">
            <span class="detail-label">Требуемый доход:</span>
            <span class="detail-value">{{ formatMoney(product.requiredIncome) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Тип:</span>
            <span class="detail-value">{{ getProductType(product.type) }}</span>
          </div>
        </div>

        <div v-if="product.claimInstructions" class="claim-instructions">
          <span class="instructions-label">Инструкции:</span>
          <p>{{ product.claimInstructions }}</p>
        </div>

        <div class="product-stats">
          <div class="stat-item">
            <span class="stat-label">Всего заявок:</span>
            <span class="stat-value">{{ product.claims?.length || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">В обработке:</span>
            <span class="stat-value">{{ getPendingClaims(product) }}</span>
          </div>
        </div>

        <div class="product-actions">
          <button class="btn-secondary" @click="editProduct(product)">
            Редактировать
          </button>
          <button
              class="btn-action"
              :class="{ 'btn-deactivate': product.active }"
              @click="toggleProduct(product)"
          >
            {{ product.active ? 'Деактивировать' : 'Активировать' }}
          </button>
          <button class="btn-delete" @click="confirmDelete(product)">
            Удалить
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования -->
    <ProductModal
        v-if="showProductModal"
        :product="editingProduct"
        @close="closeProductModal"
        @save="saveProduct"
    />

    <!-- Модальное окно подтверждения удаления -->
    <ConfirmModal
        v-if="showDeleteModal"
        :title="'Удаление продукта'"
        :message="'Вы уверены, что хотите удалить этот продукт?'"
        @confirm="deleteProduct"
        @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ApiService } from '@/services/apiService'
import ProductModal from './modals/ProductModal.vue'
import ConfirmModal from './modals/ConfirmModal.vue'

const products = ref([])
const showProductModal = ref(false)
const showDeleteModal = ref(false)
const editingProduct = ref(null)
const productToDelete = ref(null)
const isDragging = ref(false)
const draggedProduct = ref(null)

onMounted(async () => {
  await loadProducts()
})

const loadProducts = async () => {
  try {
    const data = await ApiService.getProducts()
    products.value = data
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

const editProduct = (product) => {
  editingProduct.value = { ...product }
  showProductModal.value = true
}

const closeProductModal = () => {
  showProductModal.value = false
  editingProduct.value = null
}

const saveProduct = async (productData) => {
  try {
    if (editingProduct.value) {
      await ApiService.updateProduct(editingProduct.value._id, productData)
    } else {
      await ApiService.createProduct(productData)
    }
    await loadProducts()
    closeProductModal()
  } catch (error) {
    console.error('Error saving product:', error)
  }
}

const toggleProduct = async (product) => {
  try {
    await ApiService.updateProduct(product._id, {
      active: !product.active
    })
    await loadProducts()
  } catch (error) {
    console.error('Error toggling product status:', error)
  }
}

const confirmDelete = (product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const deleteProduct = async () => {
  try {
    await ApiService.deleteProduct(productToDelete.value._id)
    await loadProducts()
    showDeleteModal.value = false
    productToDelete.value = null
  } catch (error) {
    console.error('Error deleting product:', error)
  }
}

// Обработка drag & drop для сортировки
const handleDragStart = (event, product) => {
  isDragging.value = true
  draggedProduct.value = product
  event.dataTransfer.effectAllowed = 'move'
}

const handleDragEnd = () => {
  isDragging.value = false
  draggedProduct.value = null
}

const handleDragOver = (event, product) => {
  if (!draggedProduct.value || draggedProduct.value._id === product._id) return

  const draggedIndex = products.value.findIndex(p => p._id === draggedProduct.value._id)
  const targetIndex = products.value.findIndex(p => p._id === product._id)

  if (draggedIndex !== targetIndex) {
    // Перемещаем элемент
    const items = [...products.value]
    items.splice(draggedIndex, 1)
    items.splice(targetIndex, 0, draggedProduct.value)
    products.value = items
  }
}

const handleDrop = async () => {
  try {
    const orderedIds = products.value.map(p => p._id)
    await ApiService.reorderProducts(orderedIds)
  } catch (error) {
    console.error('Error reordering products:', error)
    // Перезагружаем список в случае ошибки
    await loadProducts()
  }
}

const getProductType = (type) => {
  const types = {
    physical: 'Физический',
    digital: 'Цифровой',
    service: 'Услуга'
  }
  return types[type] || type
}

const getPendingClaims = (product) => {
  return product.claims?.filter(claim => claim.status === 'pending').length || 0
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
</script>

<style scoped>
.products-section {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.create-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.products-list.dragging {
  opacity: 0.7;
}

.product-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: move;
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drag-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0,0,0,0.5);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: move;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.product-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #eee;
  color: #666;
}

.status-badge.active {
  background: #4CAF50;
  color: white;
}

.product-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.4;
}

.product-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #666;
}

.detail-value {
  font-weight: 500;
}

.claim-instructions {
  margin-bottom: 16px;
  padding: 12px;
  background: #fff8e1;
  border-radius: 6px;
}

.instructions-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.product-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-weight: 500;
}

.product-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.btn-secondary,
.btn-action,
.btn-delete {
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #f8f9fa;
  color: #333;
}

.btn-action {
  background: #4CAF50;
  color: white;
}

.btn-action.btn-deactivate {
  background: #ff9800;
}

.btn-delete {
  background: #f44336;
  color: white;
}

@media (max-width: 768px) {
  .products-section {
    padding: 10px;
  }

  .products-list {
    grid-template-columns: 1fr;
  }

  .product-details {
    grid-template-columns: 1fr;
  }

  .product-stats {
    grid-template-columns: 1fr;
  }

  .product-actions {
    grid-template-columns: 1fr;
  }
}
</style>