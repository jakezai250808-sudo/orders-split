<template>
  <el-card>
    <template #header>
      交付件管理
      <el-button style="float:right" @click="exportCsv">导出 CSV</el-button>
    </template>
    <el-form inline>
      <el-form-item label="搜索"><el-input v-model="keyword" placeholder="文件名/上传人" /></el-form-item>
      <el-form-item label="节点"><el-select v-model="nodeFilter" clearable><el-option v-for="n in nodes" :key="n" :label="n" :value="n" /></el-select></el-form-item>
    </el-form>
    <el-table :data="filtered" border>
      <el-table-column prop="nodeTitle" label="节点" width="120" />
      <el-table-column prop="fileName" label="文件名" min-width="200" />
      <el-table-column prop="uploader" label="上传人" width="100" />
      <el-table-column prop="uploadedAt" label="上传时间" width="170" />
      <el-table-column prop="remark" label="备注" min-width="140" />
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useApprovalStore } from '@/stores/approval';
import { downloadText } from '@/utils/download';

const route = useRoute();
const store = useApprovalStore();
const keyword = ref('');
const nodeFilter = ref('');
await store.init(route.params.id as string);

const flat = computed(() =>
  (store.flow?.nodes || []).flatMap((node) => node.attachments.map((a) => ({ ...a, nodeTitle: node.title })))
);
const nodes = computed(() => [...new Set(flat.value.map((f) => f.nodeTitle))]);
const filtered = computed(() =>
  flat.value.filter(
    (f) =>
      (!keyword.value || f.fileName.includes(keyword.value) || f.uploader.includes(keyword.value)) &&
      (!nodeFilter.value || f.nodeTitle === nodeFilter.value)
  )
);

const exportCsv = () => {
  const header = '节点,文件名,上传人,上传时间,备注\n';
  const body = filtered.value.map((x) => `${x.nodeTitle},${x.fileName},${x.uploader},${x.uploadedAt},${x.remark || ''}`).join('\n');
  downloadText(`deliverables-${route.params.id}.csv`, header + body);
};
</script>
