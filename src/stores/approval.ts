import { defineStore } from 'pinia';
import { api } from '@/api';
import type { ApprovalFlow, ApprovalNodeType, Attachment } from '@/api/contracts';

const keyOf = (orderId: string) => `approval-flow-${orderId}`;

export const useApprovalStore = defineStore('approval', {
  state: () => ({
    orderId: '',
    flow: null as ApprovalFlow | null,
    users: [] as { id: string; name: string; role: string }[]
  }),
  getters: {
    currentNode: (s) => (type: ApprovalNodeType) => s.flow?.nodes.find((n) => n.type === type),
    canFinalSign: (s) =>
      ['MATERIALS', 'DELIVERY', 'INSTALL'].every((type) => s.flow?.nodes.find((n) => n.type === type)?.status === 'APPROVED')
  },
  actions: {
    async init(orderId: string) {
      this.orderId = orderId;
      this.users = await api.getUsers();
      const local = localStorage.getItem(keyOf(orderId));
      if (local) {
        this.flow = JSON.parse(local);
      } else {
        this.flow = await api.getApprovalFlow(orderId);
        this.persist();
      }
    },
    persist() {
      if (!this.orderId || !this.flow) return;
      localStorage.setItem(keyOf(this.orderId), JSON.stringify(this.flow));
    },
    async refreshFromApi() {
      if (!this.orderId) return;
      this.flow = await api.getApprovalFlow(this.orderId);
      this.persist();
    },
    async saveDraft(nodeType: ApprovalNodeType, form: Record<string, any>, operator: string) {
      if (!this.orderId || !this.flow) return;
      await api.saveNodeDraft(this.orderId, nodeType, form, operator);
      await this.refreshFromApi();
    },
    async submit(nodeType: ApprovalNodeType, approverIds: string[], ccUserIds: string[], operator: string) {
      if (!this.orderId || !this.flow) return;
      await api.submitNode(this.orderId, nodeType, approverIds, ccUserIds, operator);
      await this.refreshFromApi();
    },
    async approve(nodeType: ApprovalNodeType, approverId: string, opinion: string) {
      if (!this.orderId || !this.flow) return;
      await api.approveNode(this.orderId, nodeType, approverId, opinion);
      await this.refreshFromApi();
    },
    async reject(nodeType: ApprovalNodeType, approverId: string, opinion: string) {
      if (!this.orderId || !this.flow) return;
      await api.rejectNode(this.orderId, nodeType, approverId, opinion);
      await this.refreshFromApi();
    },
    async rollback(nodeType: ApprovalNodeType, operator: string, opinion: string) {
      if (!this.orderId || !this.flow) return;
      await api.rollbackNode(this.orderId, nodeType, operator, opinion);
      await this.refreshFromApi();
    },
    async addSigners(nodeType: ApprovalNodeType, signerIds: string[], ccIds: string[], operator: string) {
      if (!this.orderId || !this.flow) return;
      await api.addSigners(this.orderId, nodeType, signerIds, ccIds, operator);
      await this.refreshFromApi();
    },
    async uploadAttachment(nodeType: ApprovalNodeType, attachment: Attachment, operator: string) {
      if (!this.orderId || !this.flow) return;
      await api.uploadAttachment(this.orderId, nodeType, attachment, operator);
      await this.refreshFromApi();
    },
    async finalSign(operator: string) {
      if (!this.orderId || !this.flow) return;
      await api.signOrder(this.orderId, operator);
      await this.refreshFromApi();
    }
  }
});
