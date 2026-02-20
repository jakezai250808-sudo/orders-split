import { defineStore } from 'pinia';
import { api } from '@/api';
import type { OrderItem, OrderApprovalStatus } from '@/api/contracts';

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    list: [] as OrderItem[],
    loading: false
  }),
  actions: {
    async fetchOrders() {
      this.loading = true;
      try {
        this.list = await api.getOrders();
      } finally {
        this.loading = false;
      }
    },
    async refreshOrder(id: string) {
      const detail = await api.getOrder(id);
      if (!detail) return;
      const idx = this.list.findIndex((o) => o.id === id);
      if (idx >= 0) this.list[idx] = detail;
      else this.list.push(detail);
    },
    updateOrderStatus(id: string, status: OrderApprovalStatus, label: string) {
      const order = this.list.find((o) => o.id === id);
      if (!order) return;
      order.approvalStatus = status;
      order.status = label;
      order.updatedAt = new Date().toLocaleString('zh-CN');
    }
  }
});
