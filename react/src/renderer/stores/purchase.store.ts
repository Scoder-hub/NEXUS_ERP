import { create } from 'zustand';
import { ipcInvoke } from '../lib/ipc';
import { IPC_PURCHASE } from '../../shared/constants/ipc-channels';
import { useAuthStore } from './auth.store';

interface PurchaseState {
  orders: any[];
  total: number;
  page: number;
  pageSize: number;
  suppliers: any[];
  loading: boolean;
  currentOrder: any | null;
}

interface PurchaseActions {
  fetchOrders: (params?: { page?: number; pageSize?: number; status?: string; keyword?: string }) => Promise<void>;
  fetchOrder: (id: number) => Promise<void>;
  createOrder: (data: any) => Promise<any>;
  updateOrderStatus: (id: number, status: string) => Promise<void>;
  fetchSuppliers: (keyword?: string) => Promise<void>;
  createSupplier: (data: any) => Promise<any>;
}

export const usePurchaseStore = create<PurchaseState & PurchaseActions>()((set, get) => ({
  orders: [],
  total: 0,
  page: 1,
  pageSize: 20,
  suppliers: [],
  loading: false,
  currentOrder: null,

  fetchOrders: async (params) => {
    set({ loading: true });
    const result = await ipcInvoke<any>(IPC_PURCHASE.LIST_ORDERS, params);
    if (result.success && result.data) {
      set({ orders: result.data.items, total: result.data.total, page: result.data.page, pageSize: result.data.pageSize });
    }
    set({ loading: false });
  },

  fetchOrder: async (id) => {
    const result = await ipcInvoke<any>(IPC_PURCHASE.GET_ORDER, { id });
    if (result.success && result.data) {
      set({ currentOrder: result.data });
    }
  },

  createOrder: async (data) => {
    const userId = useAuthStore.getState().user?.id || 1;
    const result = await ipcInvoke<any>(IPC_PURCHASE.CREATE_ORDER, { ...data, userId });
    if (result.success) {
      get().fetchOrders();
      return result.data;
    }
    throw new Error(result.error?.message || '创建失败');
  },

  updateOrderStatus: async (id, status) => {
    const result = await ipcInvoke<boolean>(IPC_PURCHASE.UPDATE_ORDER, { id, status });
    if (result.success) {
      get().fetchOrders();
    }
  },

  fetchSuppliers: async (keyword) => {
    const result = await ipcInvoke<any[]>(IPC_PURCHASE.LIST_SUPPLIERS, { keyword });
    if (result.success && result.data) {
      set({ suppliers: result.data });
    }
  },

  createSupplier: async (data) => {
    const result = await ipcInvoke<any>(IPC_PURCHASE.CREATE_SUPPLIER, data);
    if (result.success) {
      get().fetchSuppliers();
      return result.data;
    }
    throw new Error(result.error?.message || '创建失败');
  },
}));
