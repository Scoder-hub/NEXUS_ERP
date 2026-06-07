import { create } from 'zustand';
import { ipcInvoke } from '../lib/ipc';
import { IPC_HR } from '../../shared/constants/ipc-channels';
import { useAuthStore } from './auth.store';

interface HrState {
  employees: any[];
  total: number;
  page: number;
  pageSize: number;
  departments: any[];
  loading: boolean;
  currentEmployee: any | null;
}

interface HrActions {
  fetchEmployees: (params?: { page?: number; pageSize?: number; dept?: string; keyword?: string }) => Promise<void>;
  fetchEmployee: (id: number) => Promise<void>;
  createEmployee: (data: any) => Promise<any>;
  updateEmployee: (id: number, data: any) => Promise<void>;
  fetchDepartments: () => Promise<void>;
}

export const useHrStore = create<HrState & HrActions>()((set, get) => ({
  employees: [],
  total: 0,
  page: 1,
  pageSize: 20,
  departments: [],
  loading: false,
  currentEmployee: null,

  fetchEmployees: async (params) => {
    set({ loading: true });
    const result = await ipcInvoke<any>(IPC_HR.LIST_EMPLOYEES, params);
    if (result.success && result.data) {
      set({ employees: result.data.items, total: result.data.total, page: result.data.page, pageSize: result.data.pageSize });
    }
    set({ loading: false });
  },

  fetchEmployee: async (id) => {
    const result = await ipcInvoke<any>(IPC_HR.GET_EMPLOYEE, { id });
    if (result.success && result.data) {
      set({ currentEmployee: result.data });
    }
  },

  createEmployee: async (data) => {
    const userId = useAuthStore.getState().user?.id || 1;
    const result = await ipcInvoke<any>(IPC_HR.CREATE_EMPLOYEE, { ...data, userId });
    if (result.success) {
      get().fetchEmployees();
      return result.data;
    }
    throw new Error(result.error?.message || '创建失败');
  },

  updateEmployee: async (id, data) => {
    const result = await ipcInvoke<boolean>(IPC_HR.UPDATE_EMPLOYEE, { id, data });
    if (result.success) {
      get().fetchEmployees();
    }
  },

  fetchDepartments: async () => {
    const result = await ipcInvoke<any[]>(IPC_HR.LIST_DEPARTMENTS);
    if (result.success && result.data) {
      set({ departments: result.data });
    }
  },
}));
