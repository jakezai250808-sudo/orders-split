<template>
  <el-card>
    <el-button type="primary" @click="open()">新增模板</el-button>
    <el-table :data="list" border style="margin-top:10px">
      <el-table-column prop="category" label="品类" />
      <el-table-column prop="name" label="模板名" />
      <el-table-column prop="desc" label="描述" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small" @click="open(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <el-dialog v-model="show" title="模板编辑">
    <el-form :model="form">
      <el-form-item label="品类"><el-input v-model="form.category" /></el-form-item>
      <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
      <el-form-item label="描述"><el-input v-model="form.desc" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="save">保存</el-button></template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { api } from '@/api';
import type { TemplateItem } from '@/api/contracts';

const list = ref<TemplateItem[]>([]);
const show = ref(false);
const form = reactive<TemplateItem>({ id: '', category: '', name: '', desc: '' });
const load = () => api.getTemplates().then((r) => (list.value = r));
load();

const open = (row?: TemplateItem) => {
  Object.assign(form, row || { id: `t-${Date.now()}`, category: '', name: '', desc: '' });
  show.value = true;
};
const save = async () => {
  await api.saveTemplate({ ...form });
  show.value = false;
  load();
};
const remove = async (id: string) => {
  await api.deleteTemplate(id);
  load();
};
</script>
