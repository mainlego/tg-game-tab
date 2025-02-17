<!-- src/components/ui/BaseCard.vue -->
<template>
  <div class="base-card" :class="classes">
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  classes: {
    type: [String, Array, Object],
    default: ''
  }
})
</script>

<style scoped>
.base-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>