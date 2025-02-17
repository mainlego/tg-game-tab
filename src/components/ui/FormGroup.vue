<!-- src/components/ui/FormGroup.vue -->
<template>
  <div class="form-group">
    <label v-if="label">{{ label }}</label>
    <slot></slot>
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  error: String
})
</script>

<style scoped>
.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.error {
  color: #ff4444;
  font-size: 12px;
  margin-top: 4px;
}
</style>