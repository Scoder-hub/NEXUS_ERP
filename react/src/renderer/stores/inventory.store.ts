import { create } from 'zustand';
import { ipcInvoke } from '../lib/ipc';
import { IPC_INVENTORY } from '../../shared/constants/ipc-channels';

interface InventoryState {
  items: any[];
  total: number;
  page: number;
  pageSize: number;
  transactions: any[];
  warehouses: any[];
  stats: any | null;
  loading: boolean;
}

interface InventoryActions {
  fetchItems: (params?: { page?: number; pageSize?: number; keyword?: string; category?: string }) => Promise<void>;
  fetchTransactions: (params?: { page?: number; pageSize?: number; type?: string }) => Promise<void>;
  stockIn: (data: any) => Promise<any>;
  stockOut: (data: any) => Promise<any>;
  fetchWarehouses: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState & InventoryActions>()((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  transactions: [],
  warehouses: [],
  stats: null,
  loading: false,

  fetchItems: async (params) => {
    set({ loading: true });
    const result = await ipcInvoke<any>(IPC_INVENTORY.LIST_ITEMS, params);
    if (result.success && result.data) {
      set({ items: result.data.items, total: result.data.total, page: result.data.page, pageSize: result.data.pageSize });
    }
    set({ loading: false });
  },

  fetchTransactions: async (params) => {
    const result = await ipcInvoke<any>(IPC_INVENTORY.LIST_TRANSACTIONS, params);
    if (result.success && result.data) {
      set({ transactions: result.data.items ?? result.data });
    }
  },

  stockIn: async (data) => {
    const result = await ipcInvoke<any>(IPC_INVENTORY.STOCK_IN, data);
    if (result.success) {
      get().fetchItems();
      return result.data;
    }
    throw new Error(result.error?.message || '入库失败');
  },

  stockOut: async (data) => {
    const result = await ipcInvoke<any>(IPC_INVENTORY.STOCK_OUT, data);
    if (result.success) {
      get().fetchItems();
      return result.data;
    }
    throw new Error(result.error?.message || '出库失败');
  },

  fetchWarehouses: async () => {
    const result = await ipcInvoke<any[]>(IPC_INVENTORY.LIST_WAREHOUSES);
    if (result.success && result.data) {
      set({ warehouses: result.data });
    }
  },

  fetchStats: async () => {
    const result = await ipcInvoke<any>(IPC_INVENTORY.LIST_ITEMS, { page: 1, pageSize: 1 });
    if (result.success && result.data) {
      set({ stats: result.data.stats ?? null });
    }
  },
}));
