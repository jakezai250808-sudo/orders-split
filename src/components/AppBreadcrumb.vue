<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="item in crumbs" :key="item.path">{{ item.meta.title }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const crumbs = computed(() => {
  const matched = route.matched.filter((m) => m.meta?.title);
  if (route.path.includes('/approve')) {
    return [
      { path: '/orders', meta: { title: '订单工作台' } },
      { path: route.path.replace('/approve', ''), meta: { title: '订单详情' } },
      { path: route.path, meta: { title: '审批流' } }
    ];
  }
  return matched;
});
</script>
