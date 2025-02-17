<!-- src/components/ui/BaseForm.vue -->
<template>
  <form @submit.prevent="$emit('submit')" class="base-form">
    <slot></slot>
  </form>
</template>

<script setup>
defineEmits(['submit'])
</script>

<style scoped>
.base-form {
  max-width: 800px;
  margin: 0 auto;
}
</style>