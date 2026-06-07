import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ipcInvoke } from '../lib/ipc';
import { IPC_AUTH } from '../../shared/constants/ipc-channels';
import type { User, Permission } from '../../shared/types/auth';

interface AuthState {
  user: User | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLocked: boolean;
  loginLoading: boolean;
  token: string | null;
}

interface AuthActions {
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  lockScreen: () => void;
  unlock: (pin?: string, password?: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  changePassword: (oldPwd: string, newPwd: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      isAuthenticated: false,
      isLocked: false,
      loginLoading: false,
      token: null,

      login: async (username, password, rememberMe) => {
        set({ loginLoading: true });
        try {
          const result = await ipcInvoke<{ user: User; permissions: Permission[]; token?: string }>(
            IPC_AUTH.LOGIN,
            { username, password, rememberMe }
          );
          if (result.success && result.data) {
            set({
              user: result.data.user,
              permissions: result.data.permissions,
              isAuthenticated: true,
              isLocked: false,
              token: result.data.token || null,
            });
          } else {
            throw new Error(result.error?.message || '登录失败');
          }
        } finally {
          set({ loginLoading: false });
        }
      },

      logout: async () => {
        await ipcInvoke(IPC_AUTH.LOGOUT);
        set({ user: null, permissions: [], isAuthenticated: false, isLocked: false, token: null });
      },

      lockScreen: () => set({ isLocked: true }),

      unlock: async (pin?, password?) => {
        const userId = get().user?.id;
        if (!userId) throw new Error('未登录');
        const result = await ipcInvoke<boolean>(IPC_AUTH.UNLOCK, { userId, pin, password });
        if (result.success) {
          set({ isLocked: false });
        } else {
          throw new Error(result.error?.message || '解锁失败');
        }
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return;
        const result = await ipcInvoke<{ user: User; permissions: Permission[] }>(
          IPC_AUTH.VALIDATE_TOKEN,
          { token }
        );
        if (result.success && result.data) {
          set({ user: result.data.user, permissions: result.data.permissions, isAuthenticated: true });
        } else {
          set({ user: null, permissions: [], isAuthenticated: false, token: null });
        }
      },

      changePassword: async (oldPwd, newPwd) => {
        const userId = get().user?.id;
        if (!userId) throw new Error('未登录');
        const result = await ipcInvoke<boolean>(IPC_AUTH.CHANGE_PASSWORD, { userId, oldPassword: oldPwd, newPassword: newPwd });
        if (!result.success) throw new Error(result.error?.message || '修改密码失败');
      },

      updateProfile: async (data) => {
        const userId = get().user?.id;
        if (!userId) throw new Error('未登录');
        const result = await ipcInvoke<boolean>(IPC_AUTH.UPDATE_PROFILE, { userId, data });
        if (result.success) {
          set({ user: get().user ? { ...get().user!, ...data } : null });
        }
      },

      hasPermission: (resource, action) => {
        const { permissions } = get();
        return permissions.some(p => p.resource === resource && p.action === action);
      },
    }),
    {
      name: 'porcelain-auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
