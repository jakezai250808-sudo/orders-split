<template>
  <div>
    <el-card class="page-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="订单号"><el-input v-model="filters.orderNo" /></el-form-item>
        <el-form-item label="客户"><el-input v-model="filters.customer" /></el-form-item>
        <el-form-item label="小区"><el-input v-model="filters.community" /></el-form-item>
        <el-form-item label="状态"><el-input v-model="filters.status" /></el-form-item>
        <el-form-item label="负责人"><el-input v-model="filters.owner" /></el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="filteredOrders" border>
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="customer" label="客户" />
        <el-table-column prop="community" label="小区" />
        <el-table-column prop="currentVersion" label="当前版本" />
        <el-table-column label="状态"><template #default="{row}"><el-tag>{{ row.approvalStatus || row.status }}</el-tag></template></el-table-column>
        <el-table-column label="审批进度"><template #default="{row}">{{ progressLabel(row.approvalStatus) }}</template></el-table-column>
        <el-table-column prop="risk" label="风险提示" />
        <el-table-column prop="owner" label="负责人" />
        <el-table-column prop="updatedAt" label="更新时间" />
        <el-table-column label="操作" width="420">
          <template #default="{ row }">
            <el-button size="small" @click="goApprove(row)">进入审批流</el-button>
            <el-button size="small" @click="goDeliverables(row)">交付件</el-button>
            <el-button size="small" @click="goSplit(row)">进入拆单</el-button>
            <el-button size="small" @click="goDesign(row)">查看版本</el-button>
            <el-button size="small" @click="downloadPkg(row)">下载最新生产包</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import type { OrderApprovalStatus, OrderItem } from '@/api/contracts';
import { useOrderStore } from '@/stores/order';
import { useOrdersStore } from '@/stores/orders';
import { downloadText } from '@/utils/download';

const router = useRouter();
const orderStore = useOrderStore();
const ordersStore = useOrdersStore();
const filters = reactive({ orderNo: '', customer: '', community: '', status: '', owner: '' });
ordersStore.fetchOrders();

const filteredOrders = computed(() =>
  ordersStore.list.filter(
    (o) =>
      (!filters.orderNo || o.orderNo.includes(filters.orderNo)) &&
      (!filters.customer || o.customer.includes(filters.customer)) &&
      (!filters.community || o.community.includes(filters.community)) &&
      (!filters.status || (o.approvalStatus || o.status).includes(filters.status)) &&
      (!filters.owner || o.owner.includes(filters.owner))
  )
);

const progressLabel = (status?: OrderApprovalStatus) => {
  if (!status) return '-';
  if (status === 'SIGNED') return '已签';
  if (status.includes('INSTALL')) return '安装';
  if (status.includes('DELIVERY')) return '交付';
  if (status.includes('MATERIALS')) return '物料';
  return '量房';
};

const goSplit = (row: OrderItem) => {
  orderStore.setOrder(row);
  router.push(`/orders/${row.id}/split`);
};
const goDesign = (row: OrderItem) => router.push(`/orders/${row.id}/design`);
const goApprove = (row: OrderItem) => router.push(`/orders/${row.id}/approve`);
const goDeliverables = (row: OrderItem) => router.push(`/orders/${row.id}/deliverables`);
const downloadPkg = (row: OrderItem) => downloadText(`${row.orderNo}-latest-package.json`, JSON.stringify(row, null, 2));
</script>
