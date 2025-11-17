<!-- src/components/StatusBadge.vue -->
<template>
  <span class="status-badge">{{ statusText }}</span>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  status: { type: Number, default: 0 }
});
const statusText = computed(() => {
  const map = { 0: '在线', 1: '离线', 2: '故障' };
  return map[props.status] || '未知';
});
</script>

<style scoped>
.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}
</style>