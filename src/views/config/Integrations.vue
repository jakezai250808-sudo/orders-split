<template>
  <el-row :gutter="12">
    <el-col :span="8" v-for="item in list" :key="item.id">
      <el-card>
        <h3>{{ item.id }}</h3>
        <el-switch v-model="item.enabled" active-text="启用" />
        <el-table :data="item.mappings" size="small" border style="margin-top:8px">
          <el-table-column prop="key" label="key" />
          <el-table-column prop="value" label="value" />
        </el-table>
        <div style="margin-top:8px">
          <el-button @click="test(item.id)">测试连接</el-button>
          <el-button type="primary" @click="save(item)">保存</el-button>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { api } from '@/api';
import type { IntegrationConfig } from '@/api/contracts';

const list = ref<IntegrationConfig[]>([]);
api.getIntegrations().then((r) => (list.value = r));

const save = async (item: IntegrationConfig) => {
  await api.saveIntegration(item);
  ElMessage.success(`${item.id} 保存成功`);
};
const test = async (_id: string) => {
  const r = await api.testIntegration();
  ElMessage.success(r.message);
};
</script>
