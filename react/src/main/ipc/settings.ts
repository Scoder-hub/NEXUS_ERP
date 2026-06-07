import { ipcMain } from 'electron';
import { IPC_SETTINGS } from '../../shared/constants/ipc-channels';
import { settingsService } from '../services/settings.service';

export function registerSettingsIpc() {
  ipcMain.handle(IPC_SETTINGS.GET_ALL, async () => {
    return settingsService.getAll();
  });

  ipcMain.handle(IPC_SETTINGS.GET_BY_KEY, async (_event, args: { key: string }) => {
    return settingsService.getByKey(args.key);
  });

  ipcMain.handle(IPC_SETTINGS.UPDATE, async (_event, args: { key: string; value: string }) => {
    return settingsService.update(args.key, args.value);
  });
}
