import { useUiStore } from '../stores/ui.store';

export function useTheme() {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const setTheme = useUiStore((state) => state.setTheme);

  return { theme, toggleTheme, setTheme, isDark: theme === 'dark', isLight: theme === 'light' };
}
