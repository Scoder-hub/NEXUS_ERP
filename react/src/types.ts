// ─── ERP Global Types ───────────────────────────────────────────────────────

export type NavPage =
  | 'dashboard'
  | 'purchase'
  | 'sales'
  | 'inventory'
  | 'finance'
  | 'hr'
  | 'reports'
  | 'settings'
  | 'generation'
  | 'production-plan'
  | 'workshop-exec'
  | 'production-dashboard'
  | 'profile'
  | 'notifications'
  | 'messages'
  | 'operation-logs'
  | 'data-backup';

// ─── Auth / User Types ───────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  dept: string;
  avatar: string;
  bio: string;
  joinDate: string;
  lastLogin: string;
}

export type LangCode = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'de-DE' | 'fr-FR';

export interface Language {
  code: LangCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

// ─── Notification / Approval Types ──────────────────────────────────────────
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalItem {
  id: string;
  title: string;
  submitter: string;
  dept: string;
  amount?: string;
  type: string;
  status: ApprovalStatus;
  time: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'approval';
  title: string;
  content: string;
  time: string;
  read: boolean;
  sender: string;
}

// ─── Message / Chat Types ────────────────────────────────────────────────────
export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export interface ChatMessage {
  id: string;
  contactId: string;
  content: string;
  time: string;
  isMine: boolean;
  type: 'text' | 'image' | 'file';
}

// ─── Operation Log Types ─────────────────────────────────────────────────────
export type LogLevel = 'info' | 'warning' | 'error' | 'success';

export interface OperationLog {
  id: string;
  user: string;
  action: string;
  module: string;
  detail: string;
  ip: string;
  time: string;
  level: LogLevel;
  duration: number;
}

// ─── Backup Types ────────────────────────────────────────────────────────────
export type BackupStatus = 'completed' | 'running' | 'failed' | 'scheduled';

export interface BackupRecord {
  id: string;
  name: string;
  size: string;
  time: string;
  type: 'full' | 'incremental' | 'differential';
  status: BackupStatus;
  modules: string[];
}

// ─── Production Types ────────────────────────────────────────────────────────

export type WorkOrderStatus = 'pending' | 'in-progress' | 'completed';

export interface WorkOrder {
  id: string;
  name: string;
  product: string;
  qty: number;
  unit: string;
  status: WorkOrderStatus;
  startDate: string;
  endDate: string;
  progress: number;
  workshop: string;
  priority: 'high' | 'medium' | 'low';
}

export type StationStatus = 'running' | 'idle' | 'maintenance' | 'warning';

export interface WorkStation {
  id: string;
  name: string;
  type: string;
  operator: string;
  currentJob: string;
  status: StationStatus;
  efficiency: number;
  temp: number;
  load: number;
}

export interface ProcessCard {
  id: string;
  name: string;
  seq: number;
  status: 'pending' | 'in-progress' | 'completed';
  duration: number;
  actualDuration: number;
  station: string;
  note: string;
}

export interface ReportRecord {
  id: string;
  workOrderId: string;
  station: string;
  operator: string;
  qty: number;
  defect: number;
  time: string;
  note: string;
}

export interface NavItem {
  id: NavPage;
  label: string;
  icon: string;
  badge?: number;
}

export interface KpiCard {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  color: 'primary' | 'cyan' | 'violet' | 'green' | 'orange' | 'red';
}

export interface Order {
  id: string;
  customer: string;
  amount: string;
  status: 'completed' | 'pending' | 'cancelled' | 'processing';
  date: string;
  items: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  dept: string;
  status: 'active' | 'leave' | 'remote';
  avatar: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  price: string;
  category: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  value2?: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  time: string;
}
