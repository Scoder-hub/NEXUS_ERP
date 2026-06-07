import { ipcMain } from 'electron';
import { IPC_REPORT } from '../../shared/constants/ipc-channels';
import { reportService } from '../services/report.service';

export function registerReportIpc() {
  ipcMain.handle(IPC_REPORT.LIST, async (_event, args?: { type?: string }) => {
    return reportService.listReports(args);
  });

  ipcMain.handle(IPC_REPORT.GENERATE, async (_event, args: { name: string; type: string }) => {
    return reportService.generateReport(args);
  });

  ipcMain.handle(IPC_REPORT.DOWNLOAD, async (_event, _args: { id: number }) => {
    return { success: false, error: { code: 'NOT_IMPLEMENTED', message: '下载功能开发中' } };
  });
}
