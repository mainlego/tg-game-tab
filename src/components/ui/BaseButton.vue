<!-- src/components/ui/BaseButton.vue -->
<template>
  <button
      class="base-button"
      :class="[type, size, { disabled }]"
      :disabled="disabled"
      @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.base-button {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.primary {
  background: var(--primary-color);
  color: white;
}

.secondary {
  background: #f5f5f5;
  color: #333;
}

.danger {
  background: #ff4444;
  color: white;
}

.small {
  padding: 6px 12px;
  font-size: 12px;
}

.medium {
  padding: 8px 16px;
  font-size: 14px;
}

.large {
  padding: 12px 24px;
  font-size: 16px;
}

.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>