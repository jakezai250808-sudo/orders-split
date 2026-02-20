export type CommonStatus = 'draft' | 'running' | 'warning' | 'failed' | 'done';

export type OrderApprovalStatus =
  | 'DRAFT'
  | 'MEASURED'
  | 'MATERIALS_PENDING'
  | 'MATERIALS_APPROVING'
  | 'MATERIALS_APPROVED'
  | 'DELIVERY_PENDING'
  | 'DELIVERY_APPROVING'
  | 'DELIVERY_APPROVED'
  | 'INSTALL_PENDING'
  | 'INSTALL_APPROVING'
  | 'INSTALL_APPROVED'
  | 'SIGNED';

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
  address?: string;
  principal?: string;
  measuredAt?: string;
  expectedDeliveryAt?: string;
  approvalStatus?: OrderApprovalStatus;
}

export type ApprovalNodeType = 'MEASURE' | 'MATERIALS' | 'DELIVERY' | 'INSTALL' | 'SIGN';
export type ApprovalNodeStatus = 'PENDING' | 'APPROVING' | 'APPROVED' | 'REJECTED';
export type ApproverDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Approver {
  id: string;
  name: string;
  role: string;
  decision: ApproverDecision;
  comment?: string;
  decidedAt?: string;
  isAdded?: boolean;
}

export interface Attachment {
  id: string;
  nodeType: ApprovalNodeType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploader: string;
  uploadedAt: string;
  remark?: string;
  previewUrl?: string;
}

export interface ApprovalRecord {
  id: string;
  orderId: string;
  nodeType: ApprovalNodeType;
  action:
    | 'SAVE_DRAFT'
    | 'SUBMIT'
    | 'APPROVE'
    | 'REJECT'
    | 'ROLLBACK'
    | 'ADD_SIGNER'
    | 'CC'
    | 'UPLOAD_ATTACHMENT'
    | 'FINAL_SIGN';
  operator: string;
  summary: string;
  opinion?: string;
  createdAt: string;
  submissionNo?: number;
}

export interface MaterialsForm {
  bomVersion: string;
  itemCount: number | null;
  estimatedCost: number | null;
  remark?: string;
}

export interface DeliveryForm {
  productionStartDate: string;
  factoryDate: string;
  logisticsDate: string;
  installStartDate: string;
  expectedFinishDate: string;
  riskNote?: string;
}

export interface InstallDailyPlan {
  date: string;
  workers: number | null;
  task: string;
}

export interface InstallForm {
  teamName: string;
  estimatedDurationDays: number | null;
  dailySchedules: InstallDailyPlan[];
  siteConditions: string[];
}

export interface SignForm {
  contractRemark?: string;
}

export interface ApprovalNode {
  type: ApprovalNodeType;
  title: string;
  status: ApprovalNodeStatus;
  requiredAttachments: boolean;
  attachments: Attachment[];
  approvers: Approver[];
  ccUsers: string[];
  submitter?: string;
  submissionCount: number;
  lastSubmittedAt?: string;
  rejectionReason?: string;
  timeoutWarning?: boolean;
  form: MaterialsForm | DeliveryForm | InstallForm | SignForm | Record<string, never>;
}

export interface DeliverableSummary {
  nodeType: ApprovalNodeType;
  nodeTitle: string;
  count: number;
  latestUploadedAt?: string;
}

export interface ApprovalFlow {
  orderId: string;
  milestones: {
    measuredAt: string;
    expectedDeliveryAt: string;
  };
  nodes: ApprovalNode[];
  records: ApprovalRecord[];
}

export interface UserOption {
  id: string;
  name: string;
  role: string;
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
