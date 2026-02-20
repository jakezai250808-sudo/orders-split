import type {
  ApprovalFlow,
  ApprovalNode,
  ApprovalNodeType,
  Attachment,
  CabinetTreeNode,
  FileAsset,
  HardwareItem,
  IntegrationConfig,
  MaterialItem,
  OrderApprovalStatus,
  OrderDetail,
  OrderItem,
  OrderVersion,
  PackageItem,
  PanelItem,
  RepairPlan,
  RuleDef,
  RuleResult,
  TemplateItem,
  UserOption
} from './contracts';
import orders from '@/mock/orders.json';
import orderDetail from '@/mock/orderDetail.json';
import splitModels from '@/mock/splitModels.json';
import packages from '@/mock/packages.json';
import rules from '@/mock/rules.json';
import templates from '@/mock/templates.json';
import materials from '@/mock/materials.json';
import hardware from '@/mock/hardware.json';
import users from '@/mock/users.json';
import approvalFlow from '@/mock/approvalFlow.json';
import { withDelay } from './mockAdapter';

const packageStore = [...(packages as PackageItem[])];
let versionStore = [...((splitModels as any).versions as OrderVersion[])];
let ruleDefStore = [...(rules as RuleDef[])];
let templateStore = [...(templates as TemplateItem[])];
let integrationStore: IntegrationConfig[] = [
  { id: 'ERP', enabled: true, mappings: [{ key: 'orderNo', value: 'erp_order_code' }] },
  { id: 'MES', enabled: false, mappings: [{ key: 'packageId', value: 'mes_pack' }] },
  { id: 'CNC', enabled: true, mappings: [{ key: 'panelCode', value: 'cnc_panel_no' }] }
];
let orderStore = [...(orders as OrderItem[])];
const flowTemplate = approvalFlow as Record<string, ApprovalFlow>;

const nodeTitles: Record<ApprovalNodeType, string> = {
  MEASURE: '量房完成',
  MATERIALS: '物料清单',
  DELIVERY: '交付计划',
  INSTALL: '安装计划',
  SIGN: '最终签单'
};

const baseNodes = (): ApprovalNode[] => [
  {
    type: 'MEASURE',
    title: nodeTitles.MEASURE,
    status: 'APPROVED',
    requiredAttachments: false,
    attachments: [],
    approvers: [],
    ccUsers: [],
    submissionCount: 1,
    form: {}
  },
  {
    type: 'MATERIALS',
    title: nodeTitles.MATERIALS,
    status: 'PENDING',
    requiredAttachments: true,
    attachments: [],
    approvers: [],
    ccUsers: [],
    submissionCount: 0,
    form: { bomVersion: '', itemCount: null, estimatedCost: null, remark: '' }
  },
  {
    type: 'DELIVERY',
    title: nodeTitles.DELIVERY,
    status: 'PENDING',
    requiredAttachments: true,
    attachments: [],
    approvers: [],
    ccUsers: [],
    submissionCount: 0,
    form: {
      productionStartDate: '',
      factoryDate: '',
      logisticsDate: '',
      installStartDate: '',
      expectedFinishDate: '',
      riskNote: ''
    }
  },
  {
    type: 'INSTALL',
    title: nodeTitles.INSTALL,
    status: 'PENDING',
    requiredAttachments: true,
    attachments: [],
    approvers: [],
    ccUsers: [],
    submissionCount: 0,
    form: { teamName: '', estimatedDurationDays: null, dailySchedules: [], siteConditions: [] }
  },
  {
    type: 'SIGN',
    title: nodeTitles.SIGN,
    status: 'PENDING',
    requiredAttachments: false,
    attachments: [],
    approvers: [],
    ccUsers: [],
    submissionCount: 0,
    form: { contractRemark: '' }
  }
];

const statusFromProgress = (flow: ApprovalFlow): OrderApprovalStatus => {
  const m = flow.nodes.find((n) => n.type === 'MATERIALS')!;
  const d = flow.nodes.find((n) => n.type === 'DELIVERY')!;
  const i = flow.nodes.find((n) => n.type === 'INSTALL')!;
  if (i.status === 'APPROVED' && d.status === 'APPROVED' && m.status === 'APPROVED') return 'INSTALL_APPROVED';
  if (i.status === 'APPROVING') return 'INSTALL_APPROVING';
  if (d.status === 'APPROVED' && m.status === 'APPROVED') return 'INSTALL_PENDING';
  if (d.status === 'APPROVING') return 'DELIVERY_APPROVING';
  if (m.status === 'APPROVED') return 'DELIVERY_PENDING';
  if (m.status === 'APPROVING') return 'MATERIALS_APPROVING';
  return 'MATERIALS_PENDING';
};

const buildDefaultFlow = (orderId: string): ApprovalFlow => {
  const order = orderStore.find((o) => o.id === orderId);
  const flow: ApprovalFlow = {
    orderId,
    milestones: {
      measuredAt: order?.measuredAt || new Date().toISOString(),
      expectedDeliveryAt: order?.expectedDeliveryAt || ''
    },
    nodes: baseNodes(),
    records: []
  };
  if (order?.approvalStatus === 'DRAFT') {
    flow.nodes[0].status = 'PENDING';
  }
  if (order?.approvalStatus === 'MATERIALS_APPROVING') flow.nodes[1].status = 'APPROVING';
  if (order?.approvalStatus === 'MATERIALS_APPROVED') flow.nodes[1].status = 'APPROVED';
  if (order?.approvalStatus === 'INSTALL_APPROVING') {
    flow.nodes[1].status = 'APPROVED';
    flow.nodes[2].status = 'APPROVED';
    flow.nodes[3].status = 'APPROVING';
  }
  if (order?.approvalStatus === 'SIGNED') {
    flow.nodes[1].status = 'APPROVED';
    flow.nodes[2].status = 'APPROVED';
    flow.nodes[3].status = 'APPROVED';
    flow.nodes[4].status = 'APPROVED';
  }
  return flow;
};

let flowStore: Record<string, ApprovalFlow> = Object.fromEntries(
  Object.entries(flowTemplate).map(([k, v]) => [k, { ...buildDefaultFlow(k), ...v, nodes: v.nodes?.length ? v.nodes : buildDefaultFlow(k).nodes }])
);

const ensureFlow = (orderId: string) => {
  if (!flowStore[orderId]) flowStore[orderId] = buildDefaultFlow(orderId);
  return flowStore[orderId];
};

const pushRecord = (flow: ApprovalFlow, input: Omit<ApprovalFlow['records'][number], 'id' | 'createdAt' | 'orderId'>) => {
  flow.records.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    orderId: flow.orderId,
    createdAt: new Date().toISOString(),
    ...input
  });
};

const updateOrderApprovalStatus = (orderId: string, status: OrderApprovalStatus, text: string) => {
  orderStore = orderStore.map((o) =>
    o.id === orderId ? { ...o, approvalStatus: status, status: text, updatedAt: new Date().toLocaleString('zh-CN') } : o
  );
};

export const api = {
  getOrders: () => withDelay(orderStore),
  getOrder: (id: string) => withDelay(orderStore.find((o) => o.id === id)),
  getOrderDetail: (id: string) => withDelay((orderDetail as Record<string, OrderDetail>)[id]),
  getApprovalFlow: (orderId: string) => withDelay(ensureFlow(orderId)),
  getUsers: () => withDelay(users as UserOption[]),
  saveNodeDraft: async (orderId: string, nodeType: ApprovalNodeType, form: Record<string, any>, operator: string) => {
    const flow = ensureFlow(orderId);
    const node = flow.nodes.find((n) => n.type === nodeType);
    if (!node) throw new Error('节点不存在');
    node.form = { ...node.form, ...form };
    pushRecord(flow, { nodeType, action: 'SAVE_DRAFT', operator, summary: `${node.title}保存草稿` });
    return withDelay(node);
  },
  submitNode: async (orderId: string, nodeType: ApprovalNodeType, approverIds: string[], ccUserIds: string[], operator: string) => {
    const flow = ensureFlow(orderId);
    const node = flow.nodes.find((n) => n.type === nodeType);
    if (!node) throw new Error('节点不存在');
    if (node.requiredAttachments && node.attachments.length === 0) throw new Error('请先上传交付件');
    node.status = 'APPROVING';
    node.submissionCount += 1;
    node.lastSubmittedAt = new Date().toISOString();
    node.submitter = operator;
    const userList = users as UserOption[];
    node.approvers = approverIds.map((id) => {
      const u = userList.find((item) => item.id === id);
      return { id, name: u?.name || id, role: u?.role || '审批人', decision: 'PENDING' as const };
    });
    node.ccUsers = ccUserIds.map((id) => userList.find((item) => item.id === id)?.name || id);
    pushRecord(flow, {
      nodeType,
      action: 'SUBMIT',
      operator,
      summary: `${node.title}提交会签 #${node.submissionCount}`,
      submissionNo: node.submissionCount
    });
    updateOrderApprovalStatus(orderId, statusFromProgress(flow), `${node.title}会签中`);
    return withDelay(node);
  },
  approveNode: async (orderId: string, nodeType: ApprovalNodeType, approverId: string, opinion: string) => {
    const flow = ensureFlow(orderId);
    const node = flow.nodes.find((n) => n.type === nodeType);
    if (!node) throw new Error('节点不存在');
    const approver = node.approvers.find((a) => a.id === approverId);
    if (!approver) throw new Error('审批人不在会签列表');
    approver.decision = 'APPROVED';
    approver.comment = opinion;
    approver.decidedAt = new Date().toISOString();
    if (node.approvers.every((a) => a.decision === 'APPROVED')) {
      node.status = 'APPROVED';
      pushRecord(flow, { nodeType, action: 'APPROVE', operator: approver.name, summary: `${node.title}会签通过`, opinion });
      updateOrderApprovalStatus(orderId, statusFromProgress(flow), `${node.title}已通过`);
    } else {
      pushRecord(flow, { nodeType, action: 'APPROVE', operator: approver.name, summary: `${node.title}同意`, opinion });
    }
    return withDelay(node);
  },
  rejectNode: async (orderId: string, nodeType: ApprovalNodeType, approverId: string, opinion: string) => {
    const flow = ensureFlow(orderId);
    const node = flow.nodes.find((n) => n.type === nodeType);
    if (!node) throw new Error('节点不存在');
    const approver = node.approvers.find((a) => a.id === approverId);
    if (!approver) throw new Error('审批人不在会签列表');
    approver.decision = 'REJECTED';
    approver.comment = opinion;
    approver.decidedAt = new Date().toISOString();
    node.status = 'PENDING';
    node.rejectionReason = opinion;
    pushRecord(flow, { nodeType, action: 'REJECT', operator: approver.name, summary: `${node.title}被拒绝并退回`, opinion });
    updateOrderApprovalStatus(orderId, statusFromProgress(flow), `${node.title}待提交`);
    return withDelay(node);
  },
  rollbackNode: async (orderId: string, nodeType: ApprovalNodeType, operator: string, opinion: string) => {
    const flow = ensureFlow(orderId);
    const node = flow.nodes.find((n) => n.type === nodeType);
    if (!node) throw new Error('节点不存在');
    node.status = 'PENDING';
    pushRecord(flow, { nodeType, action: 'ROLLBACK', operator, summary: `${node.title}退回修改`, opinion });
    updateOrderApprovalStatus(orderId, statusFromProgress(flow), `${node.title}待提交`);
    return withDelay(node);
  },
  addSigners: async (orderId: string, nodeType: ApprovalNodeType, signerIds: string[], ccIds: string[], operator: string) => {
    const flow = ensureFlow(orderId);
    const node = flow.nodes.find((n) => n.type === nodeType);
    if (!node) throw new Error('节点不存在');
    const userList = users as UserOption[];
    signerIds.forEach((id) => {
      if (!node.approvers.some((a) => a.id === id)) {
        const u = userList.find((x) => x.id === id);
        node.approvers.push({ id, name: u?.name || id, role: u?.role || '审批人', decision: 'PENDING', isAdded: true });
      }
    });
    ccIds.forEach((id) => {
      const name = userList.find((x) => x.id === id)?.name || id;
      if (!node.ccUsers.includes(name)) node.ccUsers.push(name);
    });
    if (signerIds.length) pushRecord(flow, { nodeType, action: 'ADD_SIGNER', operator, summary: `加签：${signerIds.join('、')}` });
    if (ccIds.length) pushRecord(flow, { nodeType, action: 'CC', operator, summary: `抄送：${ccIds.join('、')}` });
    return withDelay(node);
  },
  uploadAttachment: async (orderId: string, nodeType: ApprovalNodeType, attachment: Attachment, operator: string) => {
    const flow = ensureFlow(orderId);
    const node = flow.nodes.find((n) => n.type === nodeType);
    if (!node) throw new Error('节点不存在');
    node.attachments.unshift(attachment);
    pushRecord(flow, { nodeType, action: 'UPLOAD_ATTACHMENT', operator, summary: `上传附件：${attachment.fileName}` });
    return withDelay(attachment);
  },
  downloadAttachmentMock: async (attachment: Attachment) => {
    const blob = new Blob([`Mock file: ${attachment.fileName}`], { type: attachment.mimeType || 'text/plain' });
    return withDelay(blob);
  },
  signOrder: async (orderId: string, operator: string) => {
    const flow = ensureFlow(orderId);
    const ready = ['MATERIALS', 'DELIVERY', 'INSTALL'].every(
      (type) => flow.nodes.find((n) => n.type === type)?.status === 'APPROVED'
    );
    if (!ready) throw new Error('请先完成物料清单、交付计划、安装计划会签');
    const signNode = flow.nodes.find((n) => n.type === 'SIGN');
    if (signNode) signNode.status = 'APPROVED';
    updateOrderApprovalStatus(orderId, 'SIGNED', '已签单');
    pushRecord(flow, { nodeType: 'SIGN', action: 'FINAL_SIGN', operator, summary: '签单完成' });
    return withDelay(true);
  },
  getVersions: (_id: string) => withDelay(versionStore),
  createVersion: async () => {
    const last = versionStore[versionStore.length - 1];
    const next: OrderVersion = {
      id: `v${versionStore.length + 1}`,
      name: `V${versionStore.length + 1}`,
      frozen: false,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    versionStore.push(next);
    return withDelay({ from: last?.name, to: next.name });
  },
  freezeVersion: async (id: string) => {
    versionStore = versionStore.map((v) => (v.id === id ? { ...v, frozen: true } : v));
    return withDelay(true);
  },
  getDesignFiles: (_id: string) => withDelay((splitModels as any).files as FileAsset[]),
  getSplitTree: (_id: string) => withDelay((splitModels as any).tree as CabinetTreeNode[]),
  getPanels: (_id: string) => withDelay((splitModels as any).panels as PanelItem[]),
  getRuleResults: (_id: string) => withDelay((splitModels as any).rules as RuleResult[]),
  getRepairPlans: (_id: string) => withDelay((splitModels as any).plans as RepairPlan[]),
  getPackages: () => withDelay(packageStore),
  getPackageDetail: (id: string) => withDelay(packageStore.find((p) => p.id === id)),
  createPackage: async (item: PackageItem) => {
    packageStore.unshift(item);
    return withDelay(item);
  },
  getTemplates: () => withDelay(templateStore),
  saveTemplate: async (payload: TemplateItem) => {
    const i = templateStore.findIndex((t) => t.id === payload.id);
    if (i >= 0) templateStore[i] = payload;
    else templateStore.push(payload);
    return withDelay(payload);
  },
  deleteTemplate: async (id: string) => {
    templateStore = templateStore.filter((t) => t.id !== id);
    return withDelay(true);
  },
  getRules: () => withDelay(ruleDefStore),
  saveRule: async (payload: RuleDef) => {
    const i = ruleDefStore.findIndex((r) => r.id === payload.id);
    if (i >= 0) ruleDefStore[i] = payload;
    else ruleDefStore.push(payload);
    return withDelay(payload);
  },
  getMaterials: () => withDelay(materials as MaterialItem[]),
  getHardware: () => withDelay(hardware as HardwareItem[]),
  getIntegrations: () => withDelay(integrationStore),
  saveIntegration: async (payload: IntegrationConfig) => {
    integrationStore = integrationStore.map((i) => (i.id === payload.id ? payload : i));
    return withDelay(payload);
  },
  testIntegration: async () => withDelay({ success: true, message: '连接成功（mock）' })
};
