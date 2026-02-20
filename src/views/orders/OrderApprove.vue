<template>
  <div v-loading="loading">
    <el-row :gutter="12">
      <el-col :span="6">
        <el-card>
          <template #header>订单概览</template>
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="订单号">{{ order?.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="客户">{{ order?.customer }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ order?.address }}</el-descriptions-item>
            <el-descriptions-item label="小区">{{ order?.community }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ order?.principal || order?.owner }}</el-descriptions-item>
            <el-descriptions-item label="当前状态"><el-tag>{{ order?.approvalStatus }}</el-tag></el-descriptions-item>
          </el-descriptions>
          <el-divider />
          <div>量房完成：{{ flow?.milestones.measuredAt || '-' }}</div>
          <div>预计交付：{{ flow?.milestones.expectedDeliveryAt || '-' }}</div>
          <el-alert style="margin-top:8px" type="warning" :title="riskTip" :closable="false" show-icon />
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card>
          <template #header>审批流程时间轴</template>
          <approval-timeline :nodes="flow?.nodes || []" @select="(type) => (activeNodeType = type)" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>节点详情与会签</template>
          <node-detail-panel
            v-if="activeNode"
            :node="activeNode"
            :records="nodeRecords"
            :users="approvalStore.users"
            :operator="operator"
            :can-final-sign="approvalStore.canFinalSign"
            :sign-summaries="signSummaries"
            @refresh="refresh"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/api';
import type { ApprovalNodeType, OrderItem } from '@/api/contracts';
import { useApprovalStore } from '@/stores/approval';
import ApprovalTimeline from '@/components/approval/ApprovalTimeline.vue';
import NodeDetailPanel from '@/components/approval/NodeDetailPanel.vue';

const route = useRoute();
const orderId = route.params.id as string;
const loading = ref(true);
const order = ref<OrderItem>();
const approvalStore = useApprovalStore();
const operator = '李工';
const activeNodeType = ref<ApprovalNodeType>('MATERIALS');

const init = async () => {
  loading.value = true;
  order.value = await api.getOrder(orderId);
  await approvalStore.init(orderId);
  loading.value = false;
};
init();

const refresh = async () => {
  await approvalStore.refreshFromApi();
  order.value = await api.getOrder(orderId);
};

const flow = computed(() => approvalStore.flow);
const activeNode = computed(() => flow.value?.nodes.find((n) => n.type === activeNodeType.value));
const nodeRecords = computed(() => flow.value?.records.filter((r) => r.nodeType === activeNodeType.value) || []);
const riskTip = computed(() => {
  const node = activeNode.value;
  if (!node) return '无';
  if (node.requiredAttachments && node.attachments.length === 0) return '风险：缺附件';
  if (node.approvers.some((a) => a.decision === 'REJECTED')) return '风险：存在拒绝意见';
  if (node.lastSubmittedAt && Date.now() - new Date(node.lastSubmittedAt).getTime() > 48 * 3600 * 1000) return '风险：节点超时超过48h';
  return '风险可控';
});
const signSummaries = computed(() =>
  ['MATERIALS', 'DELIVERY', 'INSTALL'].map((type) => {
    const node = flow.value?.nodes.find((n) => n.type === type);
    return { title: node?.title || type, value: `${node?.status || '-'} / 附件 ${node?.attachments.length || 0} 个` };
  })
);
</script>
