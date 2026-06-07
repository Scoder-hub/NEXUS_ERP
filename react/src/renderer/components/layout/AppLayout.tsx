import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import TopBar from '../../../components/TopBar';
import LockScreen from '../../../components/LockScreen';
import AuroraBackground from '../../../components/AuroraBackground';
import { useAuthStore } from '../../stores/auth.store';
import { useUiStore } from '../../stores/ui.store';
import type { NavPage } from '../../../types';

const PATH_TO_PAGE: Record<string, NavPage> = {
  '/dashboard': 'dashboard',
  '/purchase': 'purchase',
  '/sales': 'sales',
  '/inventory': 'inventory',
  '/finance': 'finance',
  '/hr': 'hr',
  '/reports': 'reports',
  '/settings': 'settings',
  '/generation': 'generation',
  '/production-plan': 'production-plan',
  '/workshop-exec': 'workshop-exec',
  '/production-dashboard': 'production-dashboard',
  '/profile': 'profile',
  '/notifications': 'notifications',
  '/messages': 'messages',
  '/operation-logs': 'operation-logs',
  '/data-backup': 'data-backup',
};

export function AppLayout() {
  const isLocked = useAuthStore((s) => s.isLocked);
  const user = useAuthStore((s) => s.user);
  const lockScreen = useAuthStore((s) => s.lockScreen);
  const unlock = useAuthStore((s) => s.unlock);
  const logout = useAuthStore((s) => s.logout);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const navigate = useNavigate();
  const location = useLocation();

  const activePage = PATH_TO_PAGE[location.pathname] || 'dashboard';

  const handleNavigate = (page: NavPage) => {
    const pathMap: Record<string, string> = {
      dashboard: '/dashboard',
      purchase: '/purchase',
      sales: '/sales',
      inventory: '/inventory',
      finance: '/finance',
      hr: '/hr',
      reports: '/reports',
      settings: '/settings',
      generation: '/generation',
      'production-plan': '/production-plan',
      'workshop-exec': '/workshop-exec',
      'production-dashboard': '/production-dashboard',
      profile: '/profile',
      notifications: '/notifications',
      messages: '/messages',
      'operation-logs': '/operation-logs',
      'data-backup': '/data-backup',
    };
    const path = pathMap[page];
    if (path) navigate(path);
  };

  return (
    <div
      className={`flex h-screen overflow-hidden relative${theme === 'light' ? ' theme-light' : ''}`}
      style={{
        background: 'var(--background)',
        transition: 'background 0.35s ease',
      }}
    >
      <AuroraBackground />
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onLockScreen={lockScreen}
        onLogout={logout}
      />
      <div className="flex flex-col flex-1 overflow-hidden relative z-10">
        <TopBar
          activePage={activePage}
          onToggleSidebar={toggleSidebar}
          theme={theme}
          onToggleTheme={toggleTheme}
          onNavigate={handleNavigate}
          onLockScreen={lockScreen}
        />
        <div
          className="flex-1 overflow-hidden relative"
          style={{ background: 'var(--theme-content-bg)', transition: 'background 0.35s ease' }}
        >
          <div className="absolute inset-0 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </div>
        </div>
      </div>
      {isLocked && user && (
        <LockScreen
          isLocked={isLocked}
          userName={user.name}
          userAvatar={user.avatar}
          onUnlock={(pin, password) => { unlock(pin, password); }}
        />
      )}
    </div>
  );
}
