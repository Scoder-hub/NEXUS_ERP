// 采购单状态
export type PurchaseOrderStatus = 'draft' | 'pending-approval' | 'approved' | 'purchasing' | 'shipping' | 'arrived' | 'stocked' | 'completed' | 'cancelled';

// 销售单状态
export type SalesOrderStatus = 'draft' | 'pending-approval' | 'approved' | 'processing' | 'shipped' | 'completed' | 'cancelled';

// 工单状态
export type WorkOrderStatus = 'pending' | 'in-progress' | 'completed';

// 工位状态
export type WorkStationStatus = 'running' | 'idle' | 'maintenance' | 'warning';

// 审批状态
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// 员工状态
export type EmployeeStatus = 'active' | 'leave' | 'remote' | 'resigned';

// 备份状态
export type BackupStatus = 'completed' | 'running' | 'failed' | 'scheduled';

// 日志级别
export type LogLevel = 'info' | 'warning' | 'error' | 'success';

// 优先级
export type Priority = 'high' | 'medium' | 'low';
