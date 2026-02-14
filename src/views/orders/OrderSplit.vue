<template>
  <div class="split-layout">
    <el-card class="fill-height">
      <el-input v-model="search" placeholder="搜索对象" />
      <el-tree :data="filteredTree" node-key="id" :props="{ label: 'label' }" @node-click="selectNode">
        <template #default="{ data }">{{ icon(data.status) }} {{ data.label }}</template>
      </el-tree>
    </el-card>

    <el-card class="fill-height">
      <el-tabs>
        <el-tab-pane label="结构预览">
          <svg width="100%" height="320">
            <rect x="30" y="20" width="220" height="280" fill="#e6f7ff" stroke="#1890ff" />
            <rect x="270" y="40" width="160" height="240" fill="#fff7e6" stroke="#fa8c16" />
            <text x="40" y="40">600*2400</text><text x="280" y="60">580*2380</text>
          </svg>
        </el-tab-pane>
        <el-tab-pane label="板件展开图">
          <el-table :data="panels" @row-click="(row:any)=>splitStore.selectedPanelId=row.id">
            <el-table-column prop="name" label="板件" />
            <el-table-column prop="width" label="宽" />
            <el-table-column prop="height" label="高" />
            <el-table-column prop="material" label="材质" />
          </el-table>
          <div>当前高亮板件：{{ splitStore.selectedPanelId }}</div>
        </el-tab-pane>
        <el-tab-pane label="加工预览">加工路径预览占位</el-tab-pane>
      </el-tabs>
    </el-card>

    <el-card class="fill-height">
      <el-tabs>
        <el-tab-pane label="参数">
          <el-form :model="params" label-width="92px">
            <el-form-item label="宽度" :error="!params.width ? '必填' : ''"><el-input-number v-model="params.width" :min="0" /></el-form-item>
            <el-form-item label="高度" :error="!params.height ? '必填' : ''"><el-input-number v-model="params.height" :min="0" /></el-form-item>
            <el-form-item label="材质"><el-input v-model="params.material" /></el-form-item>
            <el-form-item label="五金"><el-input v-model="params.hardware" /></el-form-item>
            <el-form-item label="生产策略"><el-select v-model="params.strategy"><el-option label="标准" value="std" /><el-option label="经济" value="eco" /></el-select></el-form-item>
            <el-button @click="fillRecommended">一键补齐推荐值</el-button>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="规则检查">
          <el-table :data="splitStore.ruleResults">
            <el-table-column prop="name" label="规则" />
            <el-table-column prop="level" label="结果" />
            <el-table-column prop="message" label="说明" />
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button size="small" @click="locateByRule(row.targetNodeId)">定位</el-button>
                <el-button size="small" @click="fixRule(row)">一键修复</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="自动修复建议">
          <el-card v-for="p in plans" :key="p.id" style="margin-bottom:8px">
            <div>{{ p.name }} | 成本变化: {{ p.costDelta }} | 风险评分: {{ p.riskScore }}</div>
            <div>{{ p.changes.join('、') }}</div>
            <el-button size="small" @click="applyPlan(p.id)">应用方案</el-button>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="输出">
          <el-select v-model="outputType"><el-option label="全部" value="all" /><el-option label="板件" value="panel" /><el-option label="五金" value="hardware" /></el-select>
          <el-alert v-if="!splitStore.canGenerate" type="error" :closable="false" :title="lockReasons.join('；')" />
          <el-alert v-if="!currentVersionFrozen" type="warning" :closable="false" title="当前版本未冻结，禁止发布生产包" />
          <el-button type="primary" :disabled="!splitStore.canGenerate || !currentVersionFrozen" @click="generatePkg">生成生产包</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { api } from '@/api';
import type { CabinetTreeNode, PackageItem, PanelItem, RepairPlan, RuleResult } from '@/api/contracts';
import { useSplitStore } from '@/stores/split';

const router = useRouter();
const splitStore = useSplitStore();
const search = ref('');
const tree = ref<CabinetTreeNode[]>([]);
const panels = ref<PanelItem[]>([]);
const plans = ref<RepairPlan[]>([]);
const outputType = ref('all');
const currentVersionFrozen = ref(false);
const params = reactive({ width: 0, height: 0, material: '', hardware: '', strategy: '' });

api.getSplitTree('o1').then((r) => (tree.value = r));
api.getPanels('o1').then((r) => (panels.value = r));
api.getRuleResults('o1').then((r) => splitStore.setRuleResults(r));
api.getRepairPlans('o1').then((r) => (plans.value = r));
api.getVersions('o1').then((r) => (currentVersionFrozen.value = r[r.length - 1]?.frozen));

const filteredTree = computed(() => {
  if (!search.value) return tree.value;
  return tree.value.filter((n) => JSON.stringify(n).includes(search.value));
});
const lockReasons = computed(() => [splitStore.hasMissingParams ? '存在缺参' : '', splitStore.hasFailedRules ? '存在失败规则' : ''].filter(Boolean));
const icon = (s: string) => (s === 'ok' ? '✅' : s === 'warn' ? '⚠️' : '❌');

const selectNode = (node: CabinetTreeNode) => (splitStore.selectedNodeId = node.id);
const locateByRule = (target: string) => {
  splitStore.selectedNodeId = target;
  splitStore.selectedPanelId = target;
  ElMessage.info(`已定位 ${target}`);
};
const fillRecommended = () => {
  Object.assign(params, { width: 600, height: 2400, material: '颗粒板', hardware: '缓冲铰链', strategy: 'std' });
  splitStore.hasMissingParams = false;
};
const fixRule = (rule: RuleResult) => {
  rule.level = 'pass';
  splitStore.hasFailedRules = splitStore.ruleResults.some((r) => r.level === 'fail');
};
const applyPlan = (id: string) => {
  fillRecommended();
  splitStore.ruleResults = splitStore.ruleResults.map((r) => ({ ...r, level: r.id === 'rr2' ? 'pass' : 'warning' }));
  splitStore.hasFailedRules = false;
  ElMessage.success(`已应用方案 ${id}`);
};

const generatePkg = async () => {
  const item: PackageItem = {
    id: `PKG-${Date.now().toString().slice(-4)}`,
    orderNo: 'ORD-2026-001',
    version: 'V2',
    generatedAt: new Date().toLocaleString(),
    generatedBy: '当前用户',
    fileCount: outputType.value === 'all' ? 36 : 18,
    checkSummary: '全部通过',
    status: '草稿'
  };
  await api.createPackage(item);
  ElMessage.success('生产包已生成');
  router.push('/packages');
};
</script>
