<template>
  <el-timeline>
    <el-timeline-item v-for="node in nodes" :key="node.type" :timestamp="statusText(node.status)" :type="timelineType(node.status)">
      <el-card shadow="hover" class="timeline-card" @click="$emit('select', node.type)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong>{{ node.title }}</strong>
            <el-tag size="small" style="margin-left:8px">提交 #{{ node.submissionCount }}</el-tag>
          </div>
          <el-tag :type="tagType(node.status)">{{ statusText(node.status) }}</el-tag>
        </div>
        <div style="margin-top:8px;color:#666">附件 {{ node.attachments.length }} 个，最近上传：{{ node.attachments[0]?.uploadedAt || '-' }}</div>
        <div style="margin-top:8px">
          <el-tag v-for="ap in node.approvers" :key="ap.id" size="small" style="margin-right:6px" :type="ap.decision==='APPROVED'?'success':ap.decision==='REJECTED'?'danger':'info'">
            {{ ap.name }}: {{ ap.decision === 'APPROVED' ? '同意' : ap.decision === 'REJECTED' ? '拒绝' : '待处理' }}
          </el-tag>
        </div>
      </el-card>
    </el-timeline-item>
  </el-timeline>
</template>

<script setup lang="ts">
import type { ApprovalNode, ApprovalNodeStatus, ApprovalNodeType } from '@/api/contracts';

defineProps<{ nodes: ApprovalNode[] }>();
defineEmits<{ (e: 'select', type: ApprovalNodeType): void }>();

const statusText = (status: ApprovalNodeStatus) => {
  const map = { PENDING: '待提交', APPROVING: '会签中', APPROVED: '已通过', REJECTED: '已拒绝' };
  return map[status];
};
const tagType = (status: ApprovalNodeStatus) => {
  const map = { PENDING: 'info', APPROVING: 'warning', APPROVED: 'success', REJECTED: 'danger' };
  return map[status];
};
const timelineType = (status: ApprovalNodeStatus) => {
  const map = { PENDING: 'primary', APPROVING: 'warning', APPROVED: 'success', REJECTED: 'danger' };
  return map[status];
};
</script>

<style scoped>
.timeline-card { cursor: pointer; }
</style>
