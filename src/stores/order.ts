import { defineStore } from 'pinia';
import type { OrderItem, OrderVersion } from '@/api/contracts';

export const useOrderStore = defineStore('order', {
  state: () => ({
    currentOrder: null as OrderItem | null,
    currentVersion: null as OrderVersion | null
  }),
  actions: {
    setOrder(order: OrderItem | null) {
      this.currentOrder = order;
    },
    setVersion(version: OrderVersion | null) {
      this.currentVersion = version;
    }
  }
});
