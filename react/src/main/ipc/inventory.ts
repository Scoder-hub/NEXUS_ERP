import { ipcMain } from 'electron';
import { IPC_INVENTORY } from '../../shared/constants/ipc-channels';
import { inventoryService } from '../services/inventory.service';

export function registerInventoryIpc() {
  ipcMain.handle(IPC_INVENTORY.LIST_ITEMS, async (_event, args: { page?: number; pageSize?: number; keyword?: string; warehouseId?: number }) => {
    return inventoryService.listItems(args);
  });

  ipcMain.handle(IPC_INVENTORY.GET_ITEM, async (_event, args: { id: number }) => {
    return inventoryService.getItem(args.id);
  });

  ipcMain.handle(IPC_INVENTORY.LIST_TRANSACTIONS, async (_event, args: { page?: number; pageSize?: number; type?: string; productId?: number; warehouseId?: number }) => {
    return inventoryService.listTransactions(args);
  });

  ipcMain.handle(IPC_INVENTORY.STOCK_IN, async (_event, args: { productId: number; warehouseId: number; quantity: number; relatedOrderId?: string; operatorId: number; note?: string }) => {
    return inventoryService.stockIn(args);
  });

  ipcMain.handle(IPC_INVENTORY.STOCK_OUT, async (_event, args: { productId: number; warehouseId: number; quantity: number; relatedOrderId?: string; operatorId: number; note?: string }) => {
    return inventoryService.stockOut(args);
  });

  ipcMain.handle(IPC_INVENTORY.LIST_WAREHOUSES, async () => {
    return inventoryService.listWarehouses();
  });
}
