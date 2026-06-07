import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LangCode } from '../../shared/types/auth';

type NavPage =
  | 'dashboard' | 'purchase' | 'sales' | 'inventory' | 'finance' | 'hr'
  | 'reports' | 'settings' | 'generation' | 'production-plan' | 'workshop-exec'
  | 'production-dashboard' | 'profile' | 'notifications' | 'messages'
  | 'operation-logs' | 'data-backup';

interface UiState {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  language: LangCode;
  activePage: NavPage;
}

interface UiActions {
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  setLanguage: (lang: LangCode) => void;
  setActivePage: (page: NavPage) => void;
}

export const useUiStore = create<UiState & UiActions>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      language: 'zh-CN' as LangCode,
      activePage: 'dashboard' as NavPage,

      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        // 更新 document class
        if (typeof document !== 'undefined') {
          document.documentElement.className = newTheme === 'light' ? 'theme-light' : '';
        }
        return { theme: newTheme };
      }),

      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          document.documentElement.className = theme === 'light' ? 'theme-light' : '';
        }
        set({ theme });
      },

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setLanguage: (language) => set({ language }),
      setActivePage: (activePage) => set({ activePage }),
    }),
    {
      name: 'nexus-ui-storage',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed, language: state.language }),
    }
  )
);
