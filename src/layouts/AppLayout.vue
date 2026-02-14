<template>
  <el-container style="height: 100vh">
    <el-aside width="220px" style="background: #001529">
      <div style="color: #fff; padding: 16px; font-weight: 700">自动拆单系统</div>
      <el-menu :default-active="route.path" router background-color="#001529" text-color="#c0c4cc" active-text-color="#ffd04b">
        <el-menu-item v-for="m in menus" :key="m.path" :index="m.path">{{ m.label }}</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="display:flex;align-items:center;justify-content:space-between;background:#fff;border-bottom:1px solid #eee">
        <app-breadcrumb />
        <el-tag type="success">MVP + Mock</el-tag>
      </el-header>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import AppBreadcrumb from '@/components/AppBreadcrumb.vue';

const route = useRoute();
const menus = [
  { path: '/orders', label: '订单工作台' },
  { path: '/packages', label: '生产包与交付' },
  { path: '/templates', label: '模板管理' },
  { path: '/rules', label: '规则管理' },
  { path: '/materials', label: '物料库' },
  { path: '/hardware', label: '五金库' },
  { path: '/integrations', label: '系统对接' },
  { path: '/settings', label: '系统设置' }
];
</script>
