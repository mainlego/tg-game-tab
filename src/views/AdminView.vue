<!-- src/views/AdminView.vue -->
<template>
  <div class="admin-view">
    <AdminPanel />
  </div>
</template>

<script setup>
import AdminPanel from '@/components/admin/AdminPanel.vue';
</script>

<style scoped>
.admin-view {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>