<template>
  <div v-if="node">
    <el-tabs v-model="active">
      <el-tab-pane label="节点表单" name="form">
        <template v-if="node.type === 'MATERIALS'">
          <el-form :model="form" label-width="120px">
            <el-form-item label="BOM 版本号" required><el-input v-model="form.bomVersion" /></el-form-item>
            <el-form-item label="物料总项数" required><el-input-number v-model="form.itemCount" :min="1" /></el-form-item>
            <el-form-item label="预估材料成本" required><el-input-number v-model="form.estimatedCost" :min="0" /></el-form-item>
            <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
          </el-form>
        </template>
        <template v-else-if="node.type === 'DELIVERY'">
          <el-form :model="form" label-width="140px">
            <el-form-item label="生产开始日期" required><el-date-picker v-model="form.productionStartDate" value-format="YYYY-MM-DD" /></el-form-item>
            <el-form-item label="出厂日期" required><el-date-picker v-model="form.factoryDate" value-format="YYYY-MM-DD" /></el-form-item>
            <el-form-item label="物流到场日期" required><el-date-picker v-model="form.logisticsDate" value-format="YYYY-MM-DD" /></el-form-item>
            <el-form-item label="预计安装开始日期" required><el-date-picker v-model="form.installStartDate" value-format="YYYY-MM-DD" /></el-form-item>
            <el-form-item label="预计交付完成日期" required><el-date-picker v-model="form.expectedFinishDate" value-format="YYYY-MM-DD" /></el-form-item>
            <el-form-item label="风险说明"><el-input v-model="form.riskNote" type="textarea" /></el-form-item>
          </el-form>
        </template>
        <template v-else-if="node.type === 'INSTALL'">
          <el-form :model="form" label-width="120px">
            <el-form-item label="安装团队" required><el-input v-model="form.teamName" /></el-form-item>
            <el-form-item label="预计安装工期" required><el-input-number v-model="form.estimatedDurationDays" :min="1" /></el-form-item>
            <el-form-item label="现场条件确认" required>
              <el-checkbox-group v-model="form.siteConditions">
                <el-checkbox label="水电" />
                <el-checkbox label="墙面" />
                <el-checkbox label="地面" />
                <el-checkbox label="可进场" />
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </template>
        <template v-else-if="node.type === 'SIGN'">
          <el-alert :type="canFinalSign ? 'success' : 'warning'" :title="canFinalSign ? '可执行最终签单' : '前三节点未全部通过'" show-icon />
          <el-descriptions :column="1" border style="margin-top:10px">
            <el-descriptions-item v-for="summary in signSummaries" :key="summary.title" :label="summary.title">{{ summary.value }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </el-tab-pane>
      <el-tab-pane label="附件" name="attachments">
        <attachment-panel :node-type="node.type" :attachments="node.attachments" :operator="operator" />
      </el-tab-pane>
      <el-tab-pane label="会签记录" name="records">
        <el-timeline>
          <el-timeline-item v-for="r in records" :key="r.id" :timestamp="r.createdAt">{{ r.summary }}（{{ r.operator }}）</el-timeline-item>
        </el-timeline>
      </el-tab-pane>
    </el-tabs>

    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
      <el-button @click="saveDraft">保存草稿</el-button>
      <el-tooltip :disabled="canSubmit" :content="submitBlockedReason">
        <el-button type="primary" :disabled="!canSubmit" @click="submit">提交会签</el-button>
      </el-tooltip>
      <el-select v-model="actingApprover" placeholder="会签人视角" style="width:180px">
        <el-option v-for="a in node.approvers" :key="a.id" :label="a.name" :value="a.id" />
      </el-select>
      <el-button type="success" :disabled="!actingApprover" @click="approve">同意</el-button>
      <el-button type="danger" :disabled="!actingApprover" @click="reject">拒绝</el-button>
      <el-button @click="rollback">退回修改</el-button>
      <el-button @click="openSignerDialog">加签/抄送</el-button>
      <el-button type="success" :disabled="!canFinalSign || node.type !== 'SIGN'" @click="finalSign">最终签单</el-button>
    </div>

    <el-dialog v-model="signerDialog" title="加签/抄送">
      <el-form>
        <el-form-item label="加签人员"><el-select v-model="signerIds" multiple><el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.id" /></el-select></el-form-item>
        <el-form-item label="抄送人员"><el-select v-model="ccIds" multiple><el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.id" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="signerDialog=false">取消</el-button><el-button type="primary" @click="confirmSigner">确认</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ApprovalNode, ApprovalRecord } from '@/api/contracts';
import AttachmentPanel from './AttachmentPanel.vue';
import { useApprovalStore } from '@/stores/approval';

const props = defineProps<{ node: ApprovalNode; records: ApprovalRecord[]; users: { id: string; name: string }[]; operator: string; canFinalSign: boolean; signSummaries: { title: string; value: string }[] }>();
const emit = defineEmits<{ (e: 'refresh'): void }>();
const store = useApprovalStore();
const active = ref('form');
const actingApprover = ref('');
const signerDialog = ref(false);
const signerIds = ref<string[]>([]);
const ccIds = ref<string[]>([]);
const form = ref<Record<string, any>>({});

watch(
  () => props.node,
  (n) => {
    form.value = { ...n.form };
    actingApprover.value = n.approvers[0]?.id || '';
  },
  { immediate: true, deep: true }
);

const submitBlockedReason = computed(() => {
  if (props.node.requiredAttachments && props.node.attachments.length === 0) return '请先上传交付件';
  if (!validateForm(false)) return '请完善必填项';
  return '';
});
const canSubmit = computed(() => !submitBlockedReason.value && props.node.type !== 'MEASURE' && props.node.type !== 'SIGN');

const validateForm = (showMessage = true) => {
  const n = props.node.type;
  if (n === 'MATERIALS') {
    const ok = form.value.bomVersion && form.value.itemCount && form.value.estimatedCost !== null;
    if (!ok && showMessage) ElMessage.error('请填写完整物料清单信息');
    return !!ok;
  }
  if (n === 'DELIVERY') {
    const fields = ['productionStartDate', 'factoryDate', 'logisticsDate', 'installStartDate', 'expectedFinishDate'];
    const filled = fields.every((k) => !!form.value[k]);
    const sorted = [form.value.productionStartDate, form.value.factoryDate, form.value.logisticsDate, form.value.installStartDate, form.value.expectedFinishDate]
      .filter(Boolean)
      .every((d: string, i: number, arr: string[]) => i === 0 || d >= arr[i - 1]);
    if ((!filled || !sorted) && showMessage) ElMessage.error('请填写交付计划且日期需递增');
    return filled && sorted;
  }
  if (n === 'INSTALL') {
    const ok = form.value.teamName && form.value.estimatedDurationDays && (form.value.siteConditions || []).length === 4;
    if (!ok && showMessage) ElMessage.error('安装计划必填项未完成（现场条件需全选）');
    return !!ok;
  }
  return true;
};

const saveDraft = async () => {
  await store.saveDraft(props.node.type, form.value, props.operator);
  ElMessage.success('草稿已保存');
  emit('refresh');
};

const submit = async () => {
  if (!canSubmit.value || !validateForm()) return;
  await ElMessageBox.confirm('确认提交会签？', '提示', { type: 'warning' });
  await store.saveDraft(props.node.type, form.value, props.operator);
  const approvers = props.node.approvers.length ? props.node.approvers.map((a) => a.id) : props.users.slice(0, 2).map((u) => u.id);
  await store.submit(props.node.type, approvers, [], props.operator);
  ElMessage.success('已提交会签');
  emit('refresh');
};

const approve = async () => {
  if (!actingApprover.value) return;
  await ElMessageBox.confirm('确认同意？', '审批确认');
  await store.approve(props.node.type, actingApprover.value, '同意');
  emit('refresh');
};
const reject = async () => {
  if (!actingApprover.value) return;
  await ElMessageBox.confirm('确认拒绝并退回？', '审批确认', { type: 'warning' });
  await store.reject(props.node.type, actingApprover.value, '资料需补充');
  emit('refresh');
};
const rollback = async () => {
  await store.rollback(props.node.type, props.operator, '发起人退回修改');
  emit('refresh');
};

const openSignerDialog = () => {
  signerDialog.value = true;
  signerIds.value = [];
  ccIds.value = [];
};
const confirmSigner = async () => {
  await store.addSigners(props.node.type, signerIds.value, ccIds.value, props.operator);
  signerDialog.value = false;
  emit('refresh');
};

const finalSign = async () => {
  await ElMessageBox.confirm('确认执行最终签单？', '签单确认', { type: 'warning' });
  await store.finalSign(props.operator);
  emit('refresh');
};
</script>
