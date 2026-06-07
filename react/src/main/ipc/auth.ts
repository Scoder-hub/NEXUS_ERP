import { ipcMain } from 'electron';
import { IPC_AUTH } from '../../shared/constants/ipc-channels';
import { authService } from '../services/auth.service';

export function registerAuthIpc() {
  ipcMain.handle(IPC_AUTH.LOGIN, async (_event, args: { username: string; password: string; rememberMe: boolean }) => {
    return authService.login(args.username, args.password, args.rememberMe);
  });

  ipcMain.handle(IPC_AUTH.LOGOUT, async () => {
    return { success: true };
  });

  ipcMain.handle(IPC_AUTH.VALIDATE_TOKEN, async (_event, args: { token: string }) => {
    return authService.validateToken(args.token);
  });

  ipcMain.handle(IPC_AUTH.UNLOCK, async (_event, args: { userId: number; pin?: string; password?: string }) => {
    return authService.unlock(args.userId, args.pin, args.password);
  });

  ipcMain.handle(IPC_AUTH.GET_CURRENT_USER, async (_event, args: { userId: number }) => {
    return authService.getCurrentUser(args.userId);
  });

  ipcMain.handle(IPC_AUTH.CHANGE_PASSWORD, async (_event, args: { userId: number; oldPassword: string; newPassword: string }) => {
    return authService.changePassword(args.userId, args.oldPassword, args.newPassword);
  });

  ipcMain.handle(IPC_AUTH.UPDATE_PROFILE, async (_event, args: { userId: number; data: { name?: string; phone?: string; bio?: string; avatar?: string } }) => {
    return authService.updateProfile(args.userId, args.data);
  });
}
