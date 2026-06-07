import { ipcMain } from 'electron';
import { IPC_DASHBOARD } from '../../shared/constants/ipc-channels';
import { dashboardService } from '../services/dashboard.service';

export function registerDashboardIpc() {
  ipcMain.handle(IPC_DASHBOARD.KPI, async () => {
    return dashboardService.getKpi();
  });

  ipcMain.handle(IPC_DASHBOARD.REVENUE_CHART, async (_event, args: { period: 'month' | 'quarter' | 'year' }) => {
    return dashboardService.getRevenueChart(args.period);
  });

  ipcMain.handle(IPC_DASHBOARD.RECENT_ORDERS, async () => {
    return dashboardService.getRecentOrders();
  });

  ipcMain.handle(IPC_DASHBOARD.ACTIVITY_FEED, async () => {
    return dashboardService.getActivityFeed();
  });

  ipcMain.handle(IPC_DASHBOARD.SYSTEM_STATUS, async () => {
    return dashboardService.getSystemStatus();
  });
}
