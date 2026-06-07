import { create } from 'zustand';
import { ipcInvoke } from '../lib/ipc';
import { IPC_REPORT } from '../../shared/constants/ipc-channels';
import { useAuthStore } from './auth.store';

interface ReportsState {
  reports: any[];
  loading: boolean;
}

interface ReportsActions {
  fetchReports: (params?: { type?: string }) => Promise<void>;
  generateReport: (data: { name: string; type: string }) => Promise<any>;
}

export const useReportsStore = create<ReportsState & ReportsActions>()((set, get) => ({
  reports: [],
  loading: false,

  fetchReports: async (params) => {
    set({ loading: true });
    const result = await ipcInvoke<any[]>(IPC_REPORT.LIST, params);
    if (result.success && result.data) {
      set({ reports: result.data });
    }
    set({ loading: false });
  },

  generateReport: async (data) => {
    const userId = useAuthStore.getState().user?.id || 1;
    const result = await ipcInvoke<any>(IPC_REPORT.GENERATE, { ...data, userId });
    if (result.success) {
      get().fetchReports();
      return result.data;
    }
    throw new Error(result.error?.message || '生成失败');
  },
}));
