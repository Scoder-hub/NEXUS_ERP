import { useAuthStore } from '../stores/auth.store';

export function useAuth() {
  const store = useAuthStore();
  return {
    user: store.user,
    permissions: store.permissions,
    isAuthenticated: store.isAuthenticated,
    isLocked: store.isLocked,
    loginLoading: store.loginLoading,
    login: store.login,
    logout: store.logout,
    lockScreen: store.lockScreen,
    unlock: store.unlock,
    checkAuth: store.checkAuth,
    changePassword: store.changePassword,
    updateProfile: store.updateProfile,
  };
}
