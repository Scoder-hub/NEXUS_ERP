import { ipcMain } from 'electron';
import { IPC_SALES } from '../../shared/constants/ipc-channels';
import { salesService } from '../services/sales.service';

export function registerSalesIpc() {
  ipcMain.handle(IPC_SALES.LIST_ORDERS, async (_event, args: { page?: number; pageSize?: number; status?: string; keyword?: string }) => {
    return salesService.listOrders(args);
  });

  ipcMain.handle(IPC_SALES.GET_ORDER, async (_event, args: { id: number }) => {
    return salesService.getOrder(args.id);
  });

  ipcMain.handle(IPC_SALES.CREATE_ORDER, async (_event, args: { data: { customerId: number; items: { productId: number; quantity: number; unitPrice: number }[]; note?: string }; userId: number }) => {
    return salesService.createOrder(args.data, args.userId);
  });

  ipcMain.handle(IPC_SALES.UPDATE_ORDER, async (_event, args: { id: number; status: string; userId?: number }) => {
    return salesService.updateOrderStatus(args.id, args.status, args.userId);
  });

  ipcMain.handle(IPC_SALES.APPROVE_ORDER, async (_event, args: { id: number; userId: number }) => {
    return salesService.updateOrderStatus(args.id, 'approved', args.userId);
  });

  ipcMain.handle(IPC_SALES.LIST_CUSTOMERS, async (_event, args?: { keyword?: string; page?: number; pageSize?: number }) => {
    return salesService.listCustomers(args);
  });

  ipcMain.handle(IPC_SALES.GET_CUSTOMER, async (_event, args: { id: number }) => {
    return salesService.getCustomer(args.id);
  });

  ipcMain.handle(IPC_SALES.CREATE_CUSTOMER, async (_event, args: { name: string; tier?: string; contact?: string; phone?: string; email?: string; address?: string; creditLimit?: number }) => {
    return salesService.createCustomer(args);
  });

  ipcMain.handle(IPC_SALES.UPDATE_CUSTOMER, async (_event, args: { id: number; data: { name?: string; tier?: string; contact?: string; phone?: string; email?: string; address?: string; creditLimit?: number; status?: string } }) => {
    return salesService.updateCustomer(args.id, args.data);
  });
}
