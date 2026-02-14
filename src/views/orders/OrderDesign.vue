<template>
  <el-row :gutter="12">
    <el-col :span="5"><el-card class="fill-height"><el-tree :data="roomTree" node-key="id" /></el-card></el-col>
    <el-col :span="11">
      <el-card class="fill-height">
        <h3>方案文件区</h3>
        <el-table :data="files" border>
          <el-table-column prop="name" label="文件" />
          <el-table-column prop="type" label="类型" />
          <el-table-column prop="updatedAt" label="更新时间" />
        </el-table>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card class="fill-height">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h3>版本面板</h3>
          <el-button type="primary" @click="createVersion">新建版本</el-button>
        </div>
        <el-timeline>
          <el-timeline-item v-for="v in versions" :key="v.id" :timestamp="v.createdAt">
            {{ v.name }}
            <el-tag v-if="v.frozen" type="danger">已冻结</el-tag>
            <div style="margin-top:8px">
              <el-button size="small" @click="freeze(v)" :disabled="v.frozen">冻结版本</el-button>
              <el-button size="small" @click="compareDialog = true">版本对比</el-button>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </el-col>
  </el-row>

  <el-dialog v-model="compareDialog" title="版本差异摘要">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="新增柜体数量">+2</el-descriptions-item>
      <el-descriptions-item label="尺寸变更">5处</el-descriptions-item>
      <el-descriptions-item label="材质变更">3处</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { FileAsset, OrderVersion } from '@/api/contracts';
import { api } from '@/api';

const compareDialog = ref(false);
const files = ref<FileAsset[]>([]);
const versions = ref<OrderVersion[]>([]);
const roomTree = [{ id: 'r1', label: '主卧' }, { id: 'r2', label: '次卧' }, { id: 'r3', label: '厨房' }];

api.getDesignFiles('o1').then((res) => (files.value = res));
api.getVersions('o1').then((res) => (versions.value = res));

const createVersion = async () => {
  const res = await api.createVersion();
  versions.value = await api.getVersions('o1');
  ElMessage.success(`已从 ${res.from || '无'} 复制到 ${res.to}`);
};
const freeze = async (v: OrderVersion) => {
  await api.freezeVersion(v.id);
  versions.value = await api.getVersions('o1');
  ElMessage.success(`${v.name} 已冻结`);
};
</script>
