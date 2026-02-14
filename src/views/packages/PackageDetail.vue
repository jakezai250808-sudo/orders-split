<template>
  <el-row :gutter="12">
    <el-col :span="8"><el-card><el-tree :data="fileTree" /></el-card></el-col>
    <el-col :span="16">
      <el-card>
        <h3>预览占位</h3>
        <el-descriptions border>
          <el-descriptions-item label="包ID">{{ detail?.id }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ detail?.status }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 12px">
          <el-button @click="download('all')">下载全量</el-button>
          <el-button @click="download('delta')">下载增量</el-button>
          <el-button type="primary" @click="publish">发布到ERP/MES</el-button>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { api } from '@/api';
import type { PackageItem } from '@/api/contracts';
import { downloadText } from '@/utils/download';

const route = useRoute();
const detail = ref<PackageItem>();
const fileTree = [{ label: 'BOM.csv' }, { label: 'CNC/' }, { label: 'Label.pdf' }];
api.getPackageDetail(route.params.id as string).then((res) => (detail.value = res));

const download = (type: string) => downloadText(`${detail.value?.id}-${type}.txt`, 'mock file');
const publish = () => ElMessage.warning('请先在系统对接中配置 ERP/MES');
</script>
