import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './routes';
import { useEffect } from 'react';
import { useAuthStore } from './stores/auth.store';
import { useUiStore } from './stores/ui.store';

function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const theme = useUiStore((s) => s.theme);

  // 初始化主题
  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'theme-light' : '';
  }, [theme]);

  // 检查登录状态
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isLight = theme === 'light';

  return (
    <>
      <Toaster
        position="top-right"
        offset={16}
        toastOptions={{
          style: {
            background: 'var(--popover)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border-glow)',
            color: 'var(--foreground)',
            maxWidth: 'min(420px, calc(100vw - 32px))',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            zIndex: 99999,
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
