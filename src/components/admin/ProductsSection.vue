<!-- src/components/admin/ProductsSection.vue -->
<template>
  <div class="products-section">
    <div class="section-header">
      <h2>Управление продуктами</h2>
      <button class="btn-primary" @click="showProductModal = true">
        Добавить продукт
      </button>
    </div>

    <!-- Список продуктов -->
    <div class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="product-image">
          <img :src="product.image" :alt="product.name">
        </div>

        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>

          <div class="product-stats">
            <div class="stat-item">
              <span class="stat-label">Необходимый доход:</span>
              <span class="stat-value">{{ formatMoney(product.requiredIncome) }}</span>
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
              {{ product.active ? 'Скрыть' : 'Показать' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для создания/редактирования продукта -->
    <ProductModal
        v-if="showProductModal"
        :product="editingProduct"
        @close="closeProductModal"
        @save="saveProduct"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import ProductModal from './ProductModal.vue'

const adminStore = useAdminStore()
const products = ref([])
const showProductModal = ref(false)
const editingProduct = ref(null)

onMounted(async () => {
  await loadProducts()
})

const loadProducts = async () => {
  await adminStore.fetchProducts()
  products.value = adminStore.products
}

const editProduct = (product) => {
  editingProduct.value = product
  showProductModal.value = true
}

const closeProductModal = () => {
  showProductModal.value = false
  editingProduct.value = null
}

const saveProduct = async (productData) => {
  if (editingProduct.value) {
    await adminStore.updateProduct(editingProduct.value.id, productData)
  } else {
    await adminStore.createProduct(productData)
  }
  await loadProducts()
}

const toggleProduct = async (product) => {
  await adminStore.toggleProduct(product.id)
  await loadProducts()
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

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 20px;
}

.product-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
}

.product-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.4;
}

.product-stats {
  margin-bottom: 16px;
}

.stat-item {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #666;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #f8f9fa;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
}

.btn-action {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
}

.btn-deactivate {
  background: #f44336;
}

@media (max-width: 768px) {
  .products-section {
    padding: 10px;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-image {
    height: 150px;
  }

  .product-info {
    padding: 15px;
  }

  .product-actions {
    flex-direction: column;
  }

  .product-actions button {
    width: 100%;
  }
}
</style>