import type {
  CabinetTreeNode,
  FileAsset,
  HardwareItem,
  IntegrationConfig,
  MaterialItem,
  OrderDetail,
  OrderItem,
  OrderVersion,
  PackageItem,
  PanelItem,
  RepairPlan,
  RuleDef,
  RuleResult,
  TemplateItem
} from './contracts';
import orders from '@/mock/orders.json';
import orderDetail from '@/mock/orderDetail.json';
import splitModels from '@/mock/splitModels.json';
import packages from '@/mock/packages.json';
import rules from '@/mock/rules.json';
import templates from '@/mock/templates.json';
import materials from '@/mock/materials.json';
import hardware from '@/mock/hardware.json';
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

export const api = {
  getOrders: () => withDelay(orders as OrderItem[]),
  getOrderDetail: (id: string) => withDelay((orderDetail as Record<string, OrderDetail>)[id]),
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
