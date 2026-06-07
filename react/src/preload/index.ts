import { contextBridge, ipcRenderer } from 'electron';

const api = {
  invoke: (channel: string, args?: any) => {
    // 通道白名单
    const allowedChannels = [
      'auth:login', 'auth:logout', 'auth:validate-token', 'auth:unlock',
      'auth:get-current-user', 'auth:change-password', 'auth:update-profile',
      'dashboard:kpi', 'dashboard:revenue-chart', 'dashboard:recent-orders',
      'dashboard:activity-feed', 'dashboard:system-status',
      'settings:get-all', 'settings:get-by-key', 'settings:update',
      'purchase:list-orders', 'purchase:get-order', 'purchase:create-order',
      'purchase:update-order', 'purchase:approve-order', 'purchase:confirm-arrival',
      'purchase:list-suppliers', 'purchase:get-supplier', 'purchase:create-supplier',
      'purchase:update-supplier',
      'sales:list-orders', 'sales:get-order', 'sales:create-order',
      'sales:update-order', 'sales:approve-order',
      'sales:list-customers', 'sales:get-customer', 'sales:create-customer',
      'sales:update-customer',
      'inventory:list-items', 'inventory:get-item', 'inventory:list-transactions',
      'inventory:stock-in', 'inventory:stock-out', 'inventory:list-warehouses',
      'production:list-work-orders', 'production:get-work-order',
      'production:create-work-order', 'production:update-work-order',
      'production:list-work-stations', 'production:list-process-cards',
      'production:submit-report', 'production:list-reports',
      'finance:list-transactions', 'finance:create-transaction', 'finance:get-stats',
      'hr:list-employees', 'hr:get-employee', 'hr:create-employee',
      'hr:update-employee', 'hr:list-departments',
      'report:list', 'report:generate', 'report:download',
    ];

    if (!allowedChannels.includes(channel)) {
      return Promise.reject(new Error(`IPC channel not allowed: ${channel}`));
    }

    return ipcRenderer.invoke(channel, args);
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    const allowedChannels = ['auth:force-logout', 'auth:force-lock'];
    if (!allowedChannels.includes(channel)) return;
    const listener = (_event: any, ...args: any[]) => callback(...args);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
};

contextBridge.exposeInMainWorld('ipc', api);
