<template>
  <el-card>
    <el-button type="primary" @click="open()">新增规则</el-button>
    <el-table :data="list" border style="margin-top:10px">
      <el-table-column prop="enabled" label="启用"><template #default="{ row }"><el-switch v-model="row.enabled" /></template></el-table-column>
      <el-table-column prop="priority" label="优先级" />
      <el-table-column prop="field" label="字段" />
      <el-table-column prop="operator" label="运算符" />
      <el-table-column prop="threshold" label="阈值" />
      <el-table-column prop="action" label="动作" />
      <el-table-column label="操作"><template #default="{ row }"><el-button @click="open(row)">编辑</el-button></template></el-table-column>
    </el-table>
  </el-card>
  <el-dialog v-model="show" title="规则编辑">
    <el-form :model="form">
      <el-form-item label="字段"><el-input v-model="form.field" /></el-form-item>
      <el-form-item label="运算符"><el-select v-model="form.operator"><el-option value=">=" /><el-option value="<=" /><el-option value="==" /></el-select></el-form-item>
      <el-form-item label="阈值"><el-input v-model="form.threshold" /></el-form-item>
      <el-form-item label="动作"><el-select v-model="form.action"><el-option label="报错" value="报错" /><el-option label="警告" value="警告" /><el-option label="推荐" value="推荐" /><el-option label="自动修复" value="自动修复" /></el-select></el-form-item>
      <el-form-item label="优先级"><el-input-number v-model="form.priority" :min="1" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="save">保存</el-button></template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { api } from '@/api';
import type { RuleDef } from '@/api/contracts';

const list = ref<RuleDef[]>([]);
const show = ref(false);
const form = reactive<RuleDef>({ id: '', field: '', operator: '', threshold: '', action: '报错', enabled: true, priority: 1 });
const load = () => api.getRules().then((r) => (list.value = r));
load();

const open = (row?: RuleDef) => {
  Object.assign(form, row || { id: `r-${Date.now()}`, field: '', operator: '>=', threshold: '', action: '报错', enabled: true, priority: 1 });
  show.value = true;
};
const save = async () => {
  await api.saveRule({ ...form });
  show.value = false;
  load();
};
</script>
