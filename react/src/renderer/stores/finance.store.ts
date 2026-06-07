import { create } from 'zustand';
import { ipcInvoke } from '../lib/ipc';
import { IPC_FINANCE } from '../../shared/constants/ipc-channels';
import { useAuthStore } from './auth.store';

interface FinanceState {
  transactions: any[];
  total: number;
  page: number;
  pageSize: number;
  stats: any | null;
  loading: boolean;
}

interface FinanceActions {
  fetchTransactions: (params?: { page?: number; pageSize?: number; type?: string }) => Promise<void>;
  createTransaction: (data: { type: string; amount: number; description?: string; method?: string; relatedOrderId?: string }) => Promise<any>;
  fetchStats: () => Promise<void>;
}

export const useFinanceStore = create<FinanceState & FinanceActions>()((set, get) => ({
  transactions: [],
  total: 0,
  page: 1,
  pageSize: 20,
  stats: null,
  loading: false,

  fetchTransactions: async (params) => {
    set({ loading: true });
    const result = await ipcInvoke<any>(IPC_FINANCE.LIST_TRANSACTIONS, params);
    if (result.success && result.data) {
      set({ transactions: result.data.items, total: result.data.total, page: result.data.page, pageSize: result.data.pageSize });
    }
    set({ loading: false });
  },

  createTransaction: async (data) => {
    const userId = useAuthStore.getState().user?.id || 1;
    const result = await ipcInvoke<any>(IPC_FINANCE.CREATE_TRANSACTION, { data, userId });
    if (result.success) {
      get().fetchTransactions();
      return result.data;
    }
    throw new Error(result.error?.message || '创建失败');
  },

  fetchStats: async () => {
    const result = await ipcInvoke<any>(IPC_FINANCE.GET_STATS);
    if (result.success && result.data) {
      set({ stats: result.data });
    }
  },
}));
