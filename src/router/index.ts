import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        { path: '', redirect: '/orders' },
        { path: 'orders', meta: { title: '订单工作台' }, component: () => import('@/views/orders/OrdersList.vue') },
        { path: 'orders/:id/design', meta: { title: '方案与版本' }, component: () => import('@/views/orders/OrderDesign.vue') },
        { path: 'orders/:id/split', meta: { title: '自动拆单' }, component: () => import('@/views/orders/OrderSplit.vue') },
        { path: 'packages', meta: { title: '生产包与交付' }, component: () => import('@/views/packages/PackagesList.vue') },
        { path: 'packages/:id', meta: { title: '生产包详情' }, component: () => import('@/views/packages/PackageDetail.vue') },
        { path: 'templates', meta: { title: '模板管理' }, component: () => import('@/views/rules/Templates.vue') },
        { path: 'rules', meta: { title: '规则管理' }, component: () => import('@/views/rules/Rules.vue') },
        { path: 'materials', meta: { title: '物料库' }, component: () => import('@/views/library/Materials.vue') },
        { path: 'hardware', meta: { title: '五金库' }, component: () => import('@/views/library/Hardware.vue') },
        { path: 'integrations', meta: { title: '系统对接' }, component: () => import('@/views/config/Integrations.vue') },
        { path: 'settings', meta: { title: '系统设置' }, component: () => import('@/views/config/Settings.vue') }
      ]
    }
  ]
});

export default router;
