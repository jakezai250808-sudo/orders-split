<template>
  <div>
    <el-card class="page-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="订单号"><el-input v-model="filters.orderNo" /></el-form-item>
        <el-form-item label="客户"><el-input v-model="filters.customer" /></el-form-item>
        <el-form-item label="小区"><el-input v-model="filters.community" /></el-form-item>
        <el-form-item label="状态"><el-input v-model="filters.status" /></el-form-item>
        <el-form-item label="负责人"><el-input v-model="filters.owner" /></el-form-item>
        <el-form-item label="更新时间"><el-date-picker v-model="filters.range" type="daterange" /></el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="filteredOrders" border>
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="customer" label="客户" />
        <el-table-column prop="community" label="小区" />
        <el-table-column prop="currentVersion" label="当前版本" />
        <el-table-column prop="status" label="状态" />
        <el-table-column prop="risk" label="风险提示" />
        <el-table-column prop="owner" label="负责人" />
        <el-table-column prop="updatedAt" label="更新时间" />
        <el-table-column prop="slaLeftHours" label="SLA剩余时间(h)" />
        <el-table-column label="操作" width="380">
          <template #default="{ row }">
            <el-button size="small" @click="goSplit(row)">进入拆单</el-button>
            <el-button size="small" @click="goDesign(row)">查看版本</el-button>
            <el-button size="small" @click="downloadPkg(row)">下载最新生产包</el-button>
            <el-button size="small" @click="changeDialog = true">发起变更</el-button>
            <el-button size="small" type="primary" @click="openDrawer(row)">概览</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer v-model="drawer" title="订单概览" size="420px">
      <el-timeline>
        <el-timeline-item v-for="t in detail?.timeline || []" :key="t.time" :timestamp="t.time">{{ t.title }} - {{ t.desc }}</el-timeline-item>
      </el-timeline>
      <el-divider />
      <el-tag
        v-for="r in detail?.rooms || []"
        :key="r.id"
        style="margin-right:8px;cursor:pointer"
        @click="locateRoom(r.id)"
      >{{ r.name }}</el-tag>
    </el-drawer>

    <el-dialog v-model="changeDialog" title="发起变更"><el-input type="textarea" placeholder="变更说明（占位）" /></el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';
import type { OrderDetail, OrderItem } from '@/api/contracts';
import { useOrderStore } from '@/stores/order';
import { downloadText } from '@/utils/download';

const router = useRouter();
const orderStore = useOrderStore();
const orders = ref<OrderItem[]>([]);
const drawer = ref(false);
const detail = ref<OrderDetail>();
const changeDialog = ref(false);
const filters = reactive({ orderNo: '', customer: '', community: '', status: '', owner: '', range: [] as any[] });

api.getOrders().then((res) => (orders.value = res));

const filteredOrders = computed(() =>
  orders.value.filter(
    (o) =>
      (!filters.orderNo || o.orderNo.includes(filters.orderNo)) &&
      (!filters.customer || o.customer.includes(filters.customer)) &&
      (!filters.community || o.community.includes(filters.community)) &&
      (!filters.status || o.status.includes(filters.status)) &&
      (!filters.owner || o.owner.includes(filters.owner))
  )
);

const openDrawer = async (row: OrderItem) => {
  detail.value = await api.getOrderDetail(row.id);
  drawer.value = true;
};
const goSplit = (row: OrderItem) => {
  orderStore.setOrder(row);
  router.push(`/orders/${row.id}/split`);
};
const goDesign = (row: OrderItem) => router.push(`/orders/${row.id}/design`);
const locateRoom = (id: string) => router.push(`/orders/o1/split?roomId=${id}`);
const downloadPkg = (row: OrderItem) => downloadText(`${row.orderNo}-latest-package.json`, JSON.stringify(row, null, 2));
</script>
