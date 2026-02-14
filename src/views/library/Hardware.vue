<template>
  <el-card>
    <el-input v-model="keyword" placeholder="搜索型号/品牌" style="width:260px;margin-bottom:10px" />
    <el-table :data="paged" border @row-click="open">
      <el-table-column prop="name" label="型号" />
      <el-table-column prop="brand" label="品牌" />
      <el-table-column prop="spec" label="规格" />
      <el-table-column prop="direction" label="开门方向" />
      <el-table-column prop="load" label="承重" />
      <el-table-column prop="summary" label="推荐规则摘要" />
    </el-table>
    <el-pagination :page-size="5" :total="filtered.length" layout="prev, pager, next" @current-change="page=$event" />
  </el-card>
  <el-dialog v-model="show" title="五金详情"><pre>{{ current }}</pre></el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { api } from '@/api';
import type { HardwareItem } from '@/api/contracts';

const list = ref<HardwareItem[]>([]);
const keyword = ref('');
const page = ref(1);
const show = ref(false);
const current = ref<HardwareItem>();
api.getHardware().then((r) => (list.value = r));
const filtered = computed(() => list.value.filter((i) => `${i.name}${i.brand}`.includes(keyword.value)));
const paged = computed(() => filtered.value.slice((page.value - 1) * 5, page.value * 5));
const open = (row: HardwareItem) => {
  current.value = row;
  show.value = true;
};
</script>
