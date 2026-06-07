import { create } from 'zustand';
import { ipcInvoke } from '../lib/ipc';
import { IPC_PRODUCTION } from '../../shared/constants/ipc-channels';
import { useAuthStore } from './auth.store';

interface ProductionState {
  workOrders: any[];
  total: number;
  page: number;
  pageSize: number;
  workStations: any[];
  processCards: any[];
  reportRecords: any[];
  stats: any | null;
  loading: boolean;
}

interface ProductionActions {
  fetchWorkOrders: (params?: { page?: number; pageSize?: number; status?: string; keyword?: string }) => Promise<void>;
  fetchWorkOrder: (id: number) => Promise<void>;
  createWorkOrder: (data: any) => Promise<any>;
  updateWorkOrder: (id: number, data: any) => Promise<void>;
  fetchWorkStations: () => Promise<void>;
  fetchProcessCards: (workOrderId: string) => Promise<void>;
  submitReport: (data: any) => Promise<any>;
  fetchStats: () => Promise<void>;
}

export const useProductionStore = create<ProductionState & ProductionActions>()((set, get) => ({
  workOrders: [],
  total: 0,
  page: 1,
  pageSize: 20,
  workStations: [],
  processCards: [],
  reportRecords: [],
  stats: null,
  loading: false,

  fetchWorkOrders: async (params) => {
    set({ loading: true });
    const result = await ipcInvoke<any>(IPC_PRODUCTION.LIST_WORK_ORDERS, params);
    if (result.success && result.data) {
      set({ workOrders: result.data.items, total: result.data.total, page: result.data.page, pageSize: result.data.pageSize });
    }
    set({ loading: false });
  },

  fetchWorkOrder: async (id) => {
    const result = await ipcInvoke<any>(IPC_PRODUCTION.GET_WORK_ORDER, { id });
    if (result.success && result.data) {
      set({ stats: result.data }); // store single order detail
    }
  },

  createWorkOrder: async (data) => {
    const userId = useAuthStore.getState().user?.id || 1;
    const result = await ipcInvoke<any>(IPC_PRODUCTION.CREATE_WORK_ORDER, { ...data, userId });
    if (result.success) {
      get().fetchWorkOrders();
      return result.data;
    }
    throw new Error(result.error?.message || '创建工单失败');
  },

  updateWorkOrder: async (id, data) => {
    const result = await ipcInvoke<boolean>(IPC_PRODUCTION.UPDATE_WORK_ORDER, { id, ...data });
    if (result.success) {
      get().fetchWorkOrders();
    }
  },

  fetchWorkStations: async () => {
    const result = await ipcInvoke<any[]>(IPC_PRODUCTION.LIST_WORK_STATIONS);
    if (result.success && result.data) {
      set({ workStations: result.data });
    }
  },

  fetchProcessCards: async (workOrderId) => {
    const result = await ipcInvoke<any[]>(IPC_PRODUCTION.LIST_PROCESS_CARDS, { workOrderId });
    if (result.success && result.data) {
      set({ processCards: result.data });
    }
  },

  submitReport: async (data) => {
    const result = await ipcInvoke<any>(IPC_PRODUCTION.SUBMIT_REPORT, data);
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error?.message || '报工提交失败');
  },

  fetchStats: async () => {
    const result = await ipcInvoke<any>(IPC_PRODUCTION.LIST_REPORTS, { page: 1, pageSize: 1 });
    if (result.success && result.data) {
      set({ reportRecords: result.data.items ?? result.data, stats: result.data.stats ?? null });
    }
  },
}));
