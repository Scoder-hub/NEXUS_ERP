import { ipcMain } from 'electron';
import { IPC_HR } from '../../shared/constants/ipc-channels';
import { hrService } from '../services/hr.service';

export function registerHrIpc() {
  ipcMain.handle(IPC_HR.LIST_EMPLOYEES, async (_event, args: { page?: number; pageSize?: number; dept?: string; keyword?: string }) => {
    return hrService.listEmployees(args);
  });

  ipcMain.handle(IPC_HR.GET_EMPLOYEE, async (_event, args: { id: number }) => {
    return hrService.getEmployee(args.id);
  });

  ipcMain.handle(IPC_HR.CREATE_EMPLOYEE, async (_event, args: { name: string; role?: string; dept?: string; email?: string; phone?: string; salary?: number; status?: string; joinDate?: string; avatar?: string }) => {
    return hrService.createEmployee(args);
  });

  ipcMain.handle(IPC_HR.UPDATE_EMPLOYEE, async (_event, args: { id: number; data: { name?: string; role?: string; dept?: string; email?: string; phone?: string; salary?: number; status?: string; joinDate?: string; avatar?: string } }) => {
    return hrService.updateEmployee(args.id, args.data);
  });

  ipcMain.handle(IPC_HR.LIST_DEPARTMENTS, async () => {
    return hrService.listDepartments();
  });
}
