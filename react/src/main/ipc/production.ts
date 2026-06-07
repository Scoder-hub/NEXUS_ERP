import { ipcMain } from 'electron';
import { IPC_PRODUCTION } from '../../shared/constants/ipc-channels';
import { productionService } from '../services/production.service';

export function registerProductionIpc() {
  ipcMain.handle(IPC_PRODUCTION.LIST_WORK_ORDERS, async (_event, args: { page?: number; pageSize?: number; status?: string; keyword?: string }) => {
    return productionService.listWorkOrders(args);
  });

  ipcMain.handle(IPC_PRODUCTION.GET_WORK_ORDER, async (_event, args: { id: number }) => {
    return productionService.getWorkOrder(args.id);
  });

  ipcMain.handle(IPC_PRODUCTION.CREATE_WORK_ORDER, async (_event, args: { data: { name: string; productId: number; quantity: number; unit?: string; priority?: string; workshop?: string; startDate?: string; endDate?: string; note?: string }; userId: number }) => {
    return productionService.createWorkOrder(args.data, args.userId);
  });

  ipcMain.handle(IPC_PRODUCTION.UPDATE_WORK_ORDER, async (_event, args: { id: number; data: { status?: string; progress?: number; name?: string; priority?: string; workshop?: string; startDate?: string; endDate?: string; note?: string } }) => {
    return productionService.updateWorkOrder(args.id, args.data);
  });

  ipcMain.handle(IPC_PRODUCTION.LIST_WORK_STATIONS, async () => {
    return productionService.listWorkStations();
  });

  ipcMain.handle(IPC_PRODUCTION.LIST_PROCESS_CARDS, async (_event, args: { workOrderId: number }) => {
    return productionService.listProcessCards(args.workOrderId);
  });

  ipcMain.handle(IPC_PRODUCTION.SUBMIT_REPORT, async (_event, args: { workOrderId: number; stationId?: number; operator: string; quantity: number; defect?: number; note?: string }) => {
    return productionService.submitReport(args);
  });

  ipcMain.handle(IPC_PRODUCTION.LIST_REPORTS, async (_event, args: { workOrderId: number }) => {
    return productionService.listReports(args.workOrderId);
  });
}
