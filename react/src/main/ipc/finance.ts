import { ipcMain } from 'electron';
import { IPC_FINANCE } from '../../shared/constants/ipc-channels';
import { financeService } from '../services/finance.service';

export function registerFinanceIpc() {
  ipcMain.handle(IPC_FINANCE.LIST_TRANSACTIONS, async (_event, args: { page?: number; pageSize?: number; type?: string }) => {
    return financeService.listTransactions(args);
  });

  ipcMain.handle(IPC_FINANCE.CREATE_TRANSACTION, async (_event, args: { data: { type: string; amount: number; description?: string; method?: string; relatedOrderId?: string }; userId: number }) => {
    return financeService.createTransaction(args.data, args.userId);
  });

  ipcMain.handle(IPC_FINANCE.GET_STATS, async () => {
    return financeService.getStats();
  });
}
