export type CommonStatus = 'draft' | 'running' | 'warning' | 'failed' | 'done';

export interface OrderItem {
  id: string;
  orderNo: string;
  customer: string;
  community: string;
  currentVersion: string;
  status: string;
  risk: string;
  owner: string;
  updatedAt: string;
  slaLeftHours: number;
}

export interface RoomItem {
  id: string;
  name: string;
  status: 'ok' | 'warn' | 'error';
}

export interface TimelineItem {
  time: string;
  title: string;
  desc: string;
}

export interface OrderDetail {
  id: string;
  orderNo: string;
  rooms: RoomItem[];
  timeline: TimelineItem[];
}

export interface OrderVersion {
  id: string;
  name: string;
  frozen: boolean;
  createdAt: string;
}

export interface FileAsset {
  id: string;
  name: string;
  type: 'CAD' | '3D' | 'MEASURE';
  updatedAt: string;
}

export interface CabinetTreeNode {
  id: string;
  label: string;
  type: 'room' | 'cabinet' | 'module' | 'panel' | 'hardware';
  status: 'ok' | 'warn' | 'error';
  children?: CabinetTreeNode[];
}

export interface PanelItem {
  id: string;
  name: string;
  width: number;
  height: number;
  material: string;
  selected?: boolean;
}

export interface HardwareItem {
  id: string;
  name: string;
  brand: string;
  spec: string;
  direction: string;
  load: string;
  summary: string;
}

export interface RuleResult {
  id: string;
  name: string;
  level: 'pass' | 'warning' | 'fail';
  targetNodeId: string;
  message: string;
  suggestion?: string;
}

export interface RepairPlan {
  id: string;
  name: string;
  changes: string[];
  costDelta: number;
  riskScore: number;
}

export interface PackageItem {
  id: string;
  orderNo: string;
  version: string;
  generatedAt: string;
  generatedBy: string;
  fileCount: number;
  checkSummary: string;
  status: '草稿' | '已发布' | '作废';
}

export interface TemplateItem {
  id: string;
  category: string;
  name: string;
  desc: string;
}

export interface RuleDef {
  id: string;
  field: string;
  operator: string;
  threshold: string;
  action: '报错' | '警告' | '推荐' | '自动修复';
  enabled: boolean;
  priority: number;
}

export interface MaterialItem {
  id: string;
  model: string;
  thickness: number;
  color: string;
  supplier: string;
  cost: number;
  edgeBanding: string;
}

export interface IntegrationConfig {
  id: 'ERP' | 'MES' | 'CNC';
  enabled: boolean;
  mappings: { key: string; value: string }[];
}
