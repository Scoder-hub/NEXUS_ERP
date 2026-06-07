import { create } from 'zustand';
import { ipcInvoke } from '../lib/ipc';
import { IPC_SALES } from '../../shared/constants/ipc-channels';
import { useAuthStore } from './auth.store';

interface SalesState {
  orders: any[];
  total: number;
  page: number;
  pageSize: number;
  customers: any[];
  currentOrder: any | null;
  loading: boolean;
}

interface SalesActions {
  fetchOrders: (params?: { page?: number; pageSize?: number; status?: string; keyword?: string }) => Promise<void>;
  fetchOrder: (id: number) => Promise<void>;
  createOrder: (data: any) => Promise<any>;
  updateOrderStatus: (id: number, status: string) => Promise<void>;
  fetchCustomers: (keyword?: string) => Promise<void>;
  createCustomer: (data: any) => Promise<any>;
}

export const useSalesStore = create<SalesState & SalesActions>()((set, get) => ({
  orders: [],
  total: 0,
  page: 1,
  pageSize: 20,
  customers: [],
  currentOrder: null,
  loading: false,

  fetchOrders: async (params) => {
    set({ loading: true });
    const result = await ipcInvoke<any>(IPC_SALES.LIST_ORDERS, params);
    if (result.success && result.data) {
      set({ orders: result.data.items, total: result.data.total, page: result.data.page, pageSize: result.data.pageSize });
    }
    set({ loading: false });
  },

  fetchOrder: async (id) => {
    const result = await ipcInvoke<any>(IPC_SALES.GET_ORDER, { id });
    if (result.success && result.data) {
      set({ currentOrder: result.data });
    }
  },

  createOrder: async (data) => {
    const userId = useAuthStore.getState().user?.id || 1;
    const result = await ipcInvoke<any>(IPC_SALES.CREATE_ORDER, { ...data, userId });
    if (result.success) {
      get().fetchOrders();
      return result.data;
    }
    throw new Error(result.error?.message || '创建失败');
  },

  updateOrderStatus: async (id, status) => {
    const result = await ipcInvoke<boolean>(IPC_SALES.UPDATE_ORDER, { id, status });
    if (result.success) {
      get().fetchOrders();
    }
  },

  fetchCustomers: async (keyword) => {
    const result = await ipcInvoke<any[]>(IPC_SALES.LIST_CUSTOMERS, { keyword });
    if (result.success && result.data) {
      set({ customers: result.data });
    }
  },

  createCustomer: async (data) => {
    const result = await ipcInvoke<any>(IPC_SALES.CREATE_CUSTOMER, data);
    if (result.success) {
      get().fetchCustomers();
      return result.data;
    }
    throw new Error(result.error?.message || '创建失败');
  },
}));
