// 认证相关
export const IPC_AUTH = {
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
  VALIDATE_TOKEN: 'auth:validate-token',
  UNLOCK: 'auth:unlock',
  GET_CURRENT_USER: 'auth:get-current-user',
  CHANGE_PASSWORD: 'auth:change-password',
  UPDATE_PROFILE: 'auth:update-profile',
} as const;

// 仪表板相关
export const IPC_DASHBOARD = {
  KPI: 'dashboard:kpi',
  REVENUE_CHART: 'dashboard:revenue-chart',
  RECENT_ORDERS: 'dashboard:recent-orders',
  ACTIVITY_FEED: 'dashboard:activity-feed',
  SYSTEM_STATUS: 'dashboard:system-status',
} as const;

// 设置相关
export const IPC_SETTINGS = {
  GET_ALL: 'settings:get-all',
  GET_BY_KEY: 'settings:get-by-key',
  UPDATE: 'settings:update',
} as const;

// 采购相关
export const IPC_PURCHASE = {
  LIST_ORDERS: 'purchase:list-orders',
  GET_ORDER: 'purchase:get-order',
  CREATE_ORDER: 'purchase:create-order',
  UPDATE_ORDER: 'purchase:update-order',
  APPROVE_ORDER: 'purchase:approve-order',
  CONFIRM_ARRIVAL: 'purchase:confirm-arrival',
  LIST_SUPPLIERS: 'purchase:list-suppliers',
  GET_SUPPLIER: 'purchase:get-supplier',
  CREATE_SUPPLIER: 'purchase:create-supplier',
  UPDATE_SUPPLIER: 'purchase:update-supplier',
} as const;

// 销售相关
export const IPC_SALES = {
  LIST_ORDERS: 'sales:list-orders',
  GET_ORDER: 'sales:get-order',
  CREATE_ORDER: 'sales:create-order',
  UPDATE_ORDER: 'sales:update-order',
  APPROVE_ORDER: 'sales:approve-order',
  LIST_CUSTOMERS: 'sales:list-customers',
  GET_CUSTOMER: 'sales:get-customer',
  CREATE_CUSTOMER: 'sales:create-customer',
  UPDATE_CUSTOMER: 'sales:update-customer',
} as const;

// 库存相关
export const IPC_INVENTORY = {
  LIST_ITEMS: 'inventory:list-items',
  GET_ITEM: 'inventory:get-item',
  LIST_TRANSACTIONS: 'inventory:list-transactions',
  STOCK_IN: 'inventory:stock-in',
  STOCK_OUT: 'inventory:stock-out',
  LIST_WAREHOUSES: 'inventory:list-warehouses',
} as const;

// 生产相关
export const IPC_PRODUCTION = {
  LIST_WORK_ORDERS: 'production:list-work-orders',
  GET_WORK_ORDER: 'production:get-work-order',
  CREATE_WORK_ORDER: 'production:create-work-order',
  UPDATE_WORK_ORDER: 'production:update-work-order',
  LIST_WORK_STATIONS: 'production:list-work-stations',
  LIST_PROCESS_CARDS: 'production:list-process-cards',
  SUBMIT_REPORT: 'production:submit-report',
  LIST_REPORTS: 'production:list-reports',
} as const;

// 财务相关
export const IPC_FINANCE = {
  LIST_TRANSACTIONS: 'finance:list-transactions',
  CREATE_TRANSACTION: 'finance:create-transaction',
  GET_STATS: 'finance:get-stats',
} as const;

// HR 相关
export const IPC_HR = {
  LIST_EMPLOYEES: 'hr:list-employees',
  GET_EMPLOYEE: 'hr:get-employee',
  CREATE_EMPLOYEE: 'hr:create-employee',
  UPDATE_EMPLOYEE: 'hr:update-employee',
  LIST_DEPARTMENTS: 'hr:list-departments',
} as const;

// 通知相关
export const IPC_NOTIFICATION = {
  LIST: 'notification:list',
  LIST_APPROVALS: 'notification:list-approvals',
  MARK_READ: 'notification:mark-read',
  MARK_ALL_READ: 'notification:mark-all-read',
  APPROVE: 'notification:approve',
  REJECT: 'notification:reject',
  UNREAD_COUNT: 'notification:unread-count',
} as const;

// 消息相关
export const IPC_MESSAGE = {
  LIST_CONTACTS: 'message:list-contacts',
  LIST_MESSAGES: 'message:list-messages',
  SEND: 'message:send',
} as const;

// 日志相关
export const IPC_LOG = {
  LIST: 'log:list',
  EXPORT: 'log:export',
} as const;

// 备份相关
export const IPC_BACKUP = {
  LIST: 'backup:list',
  CREATE: 'backup:create',
  RESTORE: 'backup:restore',
  GET_SCHEDULE: 'backup:get-schedule',
  UPDATE_SCHEDULE: 'backup:update-schedule',
} as const;

// 报表相关
export const IPC_REPORT = {
  LIST: 'report:list',
  GENERATE: 'report:generate',
  DOWNLOAD: 'report:download',
} as const;
