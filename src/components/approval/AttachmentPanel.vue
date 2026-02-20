<template>
  <div>
    <el-upload :http-request="doUpload" :show-file-list="false" :before-upload="beforeUpload" multiple>
      <el-button type="primary" plain>上传交付件</el-button>
    </el-upload>
    <el-table :data="attachments" size="small" style="margin-top: 12px" border>
      <el-table-column prop="fileName" label="文件名" min-width="180" />
      <el-table-column label="大小" width="100">
        <template #default="{ row }">{{ (row.fileSize / 1024 / 1024).toFixed(2) }} MB</template>
      </el-table-column>
      <el-table-column prop="uploader" label="上传人" width="90" />
      <el-table-column prop="uploadedAt" label="上传时间" width="170" />
      <el-table-column prop="remark" label="备注" min-width="120" />
      <el-table-column label="操作" width="170">
        <template #default="{ row }">
          <el-button text size="small" @click="preview(row)">预览</el-button>
          <el-button text size="small" @click="download(row)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="previewDialog" title="附件预览" width="50%">
      <template v-if="previewItem?.mimeType.startsWith('image')">
        <img :src="previewItem.previewUrl" style="max-width: 100%" />
      </template>
      <template v-else>
        <el-empty description="当前文件仅提供占位预览" />
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { Attachment, ApprovalNodeType } from '@/api/contracts';
import { useApprovalStore } from '@/stores/approval';
import { api } from '@/api';

const props = defineProps<{ nodeType: ApprovalNodeType; attachments: Attachment[]; operator: string }>();
const store = useApprovalStore();
const previewDialog = ref(false);
const previewItem = ref<Attachment>();

const allowed = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'xlsx', 'xls', 'zip', 'rar'];
const beforeUpload = (file: File) => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!allowed.includes(ext)) {
    ElMessage.error('仅支持 PDF/图片/Excel/压缩包');
    return false;
  }
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.error('附件不能超过 50MB');
    return false;
  }
  return true;
};

const doUpload = async (option: any) => {
  const file = option.file as File;
  const attachment: Attachment = {
    id: `${Date.now()}`,
    nodeType: props.nodeType,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
    uploader: props.operator,
    uploadedAt: new Date().toLocaleString('zh-CN'),
    remark: 'mock 上传',
    previewUrl: file.type.startsWith('image') ? URL.createObjectURL(file) : ''
  };
  await store.uploadAttachment(props.nodeType, attachment, props.operator);
  ElMessage.success('上传成功');
  option.onSuccess?.(attachment);
};

const preview = (item: Attachment) => {
  previewItem.value = item;
  previewDialog.value = true;
};

const download = async (item: Attachment) => {
  const blob = await api.downloadAttachmentMock(item);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = item.fileName;
  a.click();
  URL.revokeObjectURL(url);
};
</script>
