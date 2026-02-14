<template>
  <el-card>
    <el-table :data="list" border>
      <el-table-column prop="id" label="包ID" />
      <el-table-column prop="orderNo" label="订单号" />
      <el-table-column prop="version" label="版本" />
      <el-table-column prop="generatedAt" label="生成时间" />
      <el-table-column prop="generatedBy" label="生成者" />
      <el-table-column prop="fileCount" label="文件数量" />
      <el-table-column prop="checkSummary" label="校验摘要" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作"><template #default="{ row }"><el-button @click="go(row.id)">详情</el-button></template></el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';
import type { PackageItem } from '@/api/contracts';

const router = useRouter();
const list = ref<PackageItem[]>([]);
api.getPackages().then((res) => (list.value = res));
const go = (id: string) => router.push(`/packages/${id}`);
</script>
