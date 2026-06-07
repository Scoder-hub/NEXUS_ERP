import { ipcMain } from 'electron';
import { IPC_PURCHASE } from '../../shared/constants/ipc-channels';
import { purchaseService } from '../services/purchase.service';

export function registerPurchaseIpc() {
  ipcMain.handle(IPC_PURCHASE.LIST_ORDERS, async (_event, args: { page?: number; pageSize?: number; status?: string; keyword?: string }) => {
    return purchaseService.listOrders(args);
  });

  ipcMain.handle(IPC_PURCHASE.GET_ORDER, async (_event, args: { id: number }) => {
    return purchaseService.getOrder(args.id);
  });

  ipcMain.handle(IPC_PURCHASE.CREATE_ORDER, async (_event, args: { data: { supplierId: number; items: { productId: number; quantity: number; unitPrice: number }[]; note?: string }; userId: number }) => {
    return purchaseService.createOrder(args.data, args.userId);
  });

  ipcMain.handle(IPC_PURCHASE.UPDATE_ORDER, async (_event, args: { id: number; status: string; userId?: number }) => {
    return purchaseService.updateOrderStatus(args.id, args.status, args.userId);
  });

  ipcMain.handle(IPC_PURCHASE.APPROVE_ORDER, async (_event, args: { id: number; userId: number }) => {
    return purchaseService.updateOrderStatus(args.id, 'approved', args.userId);
  });

  ipcMain.handle(IPC_PURCHASE.CONFIRM_ARRIVAL, async (_event, args: { id: number }) => {
    return purchaseService.updateOrderStatus(args.id, 'arrived');
  });

  ipcMain.handle(IPC_PURCHASE.LIST_SUPPLIERS, async (_event, args?: { keyword?: string }) => {
    return purchaseService.listSuppliers(args?.keyword);
  });

  ipcMain.handle(IPC_PURCHASE.GET_SUPPLIER, async (_event, args: { id: number }) => {
    return purchaseService.getSupplier(args.id);
  });

  ipcMain.handle(IPC_PURCHASE.CREATE_SUPPLIER, async (_event, args: { name: string; category?: string; contact?: string; phone?: string; email?: string; address?: string }) => {
    return purchaseService.createSupplier(args);
  });

  ipcMain.handle(IPC_PURCHASE.UPDATE_SUPPLIER, async (_event, args: { id: number; data: { name?: string; category?: string; contact?: string; phone?: string; email?: string; address?: string; rating?: number; status?: string } }) => {
    return purchaseService.updateSupplier(args.id, args.data);
  });
}
