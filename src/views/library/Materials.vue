<template>
  <el-card>
    <el-input v-model="keyword" placeholder="搜索型号/花色" style="width:260px;margin-bottom:10px" />
    <el-table :data="paged" border @row-click="open">
      <el-table-column prop="model" label="型号" />
      <el-table-column prop="thickness" label="厚度" />
      <el-table-column prop="color" label="花色" />
      <el-table-column prop="supplier" label="供应商" />
      <el-table-column prop="cost" label="成本" />
      <el-table-column prop="edgeBanding" label="兼容封边" />
    </el-table>
    <el-pagination :page-size="5" :total="filtered.length" layout="prev, pager, next" @current-change="page=$event" />
  </el-card>
  <el-dialog v-model="show" title="物料详情"><pre>{{ current }}</pre></el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { api } from '@/api';
import type { MaterialItem } from '@/api/contracts';

const list = ref<MaterialItem[]>([]);
const keyword = ref('');
const page = ref(1);
const show = ref(false);
const current = ref<MaterialItem>();
api.getMaterials().then((r) => (list.value = r));
const filtered = computed(() => list.value.filter((i) => `${i.model}${i.color}`.includes(keyword.value)));
const paged = computed(() => filtered.value.slice((page.value - 1) * 5, page.value * 5));
const open = (row: MaterialItem) => {
  current.value = row;
  show.value = true;
};
</script>
