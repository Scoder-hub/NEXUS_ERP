import { create } from 'zustand';
import { ipcInvoke } from '../lib/ipc';
import { IPC_SETTINGS } from '../../shared/constants/ipc-channels';

interface SettingsState {
  settings: Record<string, string>;
  loading: boolean;
}

interface SettingsActions {
  fetchSettings: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  getSetting: (key: string) => string | undefined;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()((set, get) => ({
  settings: {},
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    const result = await ipcInvoke<Record<string, string>>(IPC_SETTINGS.GET_ALL);
    if (result.success && result.data) {
      set({ settings: result.data });
    }
    set({ loading: false });
  },

  updateSetting: async (key, value) => {
    const result = await ipcInvoke<boolean>(IPC_SETTINGS.UPDATE, { key, value });
    if (result.success) {
      set((state) => ({ settings: { ...state.settings, [key]: value } }));
    }
  },

  getSetting: (key) => get().settings[key],
}));
