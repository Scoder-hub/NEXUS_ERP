import { registerAuthIpc } from './auth';
import { registerDashboardIpc } from './dashboard';
import { registerSettingsIpc } from './settings';
import { registerPurchaseIpc } from './purchase';
import { registerSalesIpc } from './sales';
import { registerInventoryIpc } from './inventory';
import { registerProductionIpc } from './production';
import { registerFinanceIpc } from './finance';
import { registerHrIpc } from './hr';
import { registerReportIpc } from './report';

export function registerIpcHandlers() {
  registerAuthIpc();
  registerDashboardIpc();
  registerSettingsIpc();
  registerPurchaseIpc();
  registerSalesIpc();
  registerInventoryIpc();
  registerProductionIpc();
  registerFinanceIpc();
  registerHrIpc();
  registerReportIpc();
}
