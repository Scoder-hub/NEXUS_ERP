import { create } from 'zustand';
import { ipcInvoke } from '../lib/ipc';
import { IPC_DASHBOARD } from '../../shared/constants/ipc-channels';

interface DashboardKpi {
  totalRevenue: number;
  revenueChange: number;
  orderCount: number;
  orderChange: number;
  activeCustomers: number;
  customerChange: number;
  inventoryAlerts: number;
  productionRate: number;
}

interface RevenueDataPoint {
  label: string;
  value: number;
  value2?: number;
}

interface DashboardState {
  kpiData: DashboardKpi | null;
  revenueData: RevenueDataPoint[];
  recentOrders: any[];
  activities: any[];
  systemStatus: { cpu: number; memory: number; disk: number; uptime: string } | null;
  loading: boolean;
}

interface DashboardActions {
  fetchKpi: () => Promise<void>;
  fetchRevenueChart: (period: 'month' | 'quarter' | 'year') => Promise<void>;
  fetchRecentOrders: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchSystemStatus: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState & DashboardActions>()((set, get) => ({
  kpiData: null,
  revenueData: [],
  recentOrders: [],
  activities: [],
  systemStatus: null,
  loading: false,

  fetchKpi: async () => {
    const result = await ipcInvoke<DashboardKpi>(IPC_DASHBOARD.KPI);
    if (result.success && result.data) {
      set({ kpiData: result.data });
    }
  },

  fetchRevenueChart: async (period) => {
    const result = await ipcInvoke<RevenueDataPoint[]>(IPC_DASHBOARD.REVENUE_CHART, { period });
    if (result.success && result.data) {
      set({ revenueData: result.data });
    }
  },

  fetchRecentOrders: async () => {
    const result = await ipcInvoke<any[]>(IPC_DASHBOARD.RECENT_ORDERS);
    if (result.success && result.data) {
      set({ recentOrders: result.data });
    }
  },

  fetchActivities: async () => {
    const result = await ipcInvoke<any[]>(IPC_DASHBOARD.ACTIVITY_FEED);
    if (result.success && result.data) {
      set({ activities: result.data });
    }
  },

  fetchSystemStatus: async () => {
    const result = await ipcInvoke<{ cpu: number; memory: number; disk: number; uptime: string }>(IPC_DASHBOARD.SYSTEM_STATUS);
    if (result.success && result.data) {
      set({ systemStatus: result.data });
    }
  },

  refreshAll: async () => {
    set({ loading: true });
    try {
      await Promise.all([
        get().fetchKpi(),
        get().fetchRevenueChart('month'),
        get().fetchRecentOrders(),
        get().fetchActivities(),
        get().fetchSystemStatus(),
      ]);
    } finally {
      set({ loading: false });
    }
  },
}));
