import { getSqlite } from '../../db';
import { getSystemStatus } from '../utils/system-info';
import type { IpcResult } from '../../shared/types/common';

export interface DashboardKpi {
  totalRevenue: number;
  revenueChange: number;
  orderCount: number;
  orderChange: number;
  activeCustomers: number;
  customerChange: number;
  inventoryAlerts: number;
  productionRate: number;
}

export interface RevenueDataPoint {
  label: string;
  value: number;
  value2?: number;
}

export class DashboardService {
  private get db() {
    return getSqlite();
  }

  async getKpi(): Promise<IpcResult<DashboardKpi>> {
    try {
      // 本月营收
      const revenueResult = this.db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as total
        FROM sales_orders
        WHERE status != 'cancelled' AND created_at >= date('now', 'start of month')
      `).get() as { total: number };

      // 上月营收（用于计算变化率）
      const lastMonthRevenue = this.db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as total
        FROM sales_orders
        WHERE status != 'cancelled'
        AND created_at >= date('now', 'start of month', '-1 month')
        AND created_at < date('now', 'start of month')
      `).get() as { total: number };

      // 订单数
      const orderResult = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM sales_orders
        WHERE status != 'cancelled' AND created_at >= date('now', 'start of month')
      `).get() as { count: number };

      const lastMonthOrders = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM sales_orders
        WHERE status != 'cancelled'
        AND created_at >= date('now', 'start of month', '-1 month')
        AND created_at < date('now', 'start of month')
      `).get() as { count: number };

      // 活跃客户数
      const customerResult = this.db.prepare(`
        SELECT COUNT(DISTINCT customer_id) as count
        FROM sales_orders
        WHERE created_at >= date('now', '-30 days')
      `).get() as { count: number };

      // 库存预警
      const alertResult = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        WHERE ii.stock < p.min_stock
      `).get() as { count: number };

      // 生产达成率
      const productionResult = this.db.prepare(`
        SELECT COALESCE(AVG(progress), 0) as rate
        FROM work_orders
        WHERE status IN ('in-progress', 'completed')
      `).get() as { rate: number };

      const revenueChange = lastMonthRevenue.total > 0
        ? Math.round(((revenueResult.total - lastMonthRevenue.total) / lastMonthRevenue.total) * 100)
        : 0;
      const orderChange = lastMonthOrders.count > 0
        ? Math.round(((orderResult.count - lastMonthOrders.count) / lastMonthOrders.count) * 100)
        : 0;

      return {
        success: true,
        data: {
          totalRevenue: revenueResult.total,
          revenueChange,
          orderCount: orderResult.count,
          orderChange,
          activeCustomers: customerResult.count,
          customerChange: 0,
          inventoryAlerts: alertResult.count,
          productionRate: Math.round(productionResult.rate),
        },
      };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getRevenueChart(period: 'month' | 'quarter' | 'year'): Promise<IpcResult<RevenueDataPoint[]>> {
    try {
      let groupBy: string;
      let limit: number;

      switch (period) {
        case 'month':
          groupBy = "%Y-%m";
          limit = 12;
          break;
        case 'quarter':
          groupBy = "%Y-Q";
          limit = 8;
          break;
        case 'year':
          groupBy = "%Y";
          limit = 5;
          break;
      }

      const rows = this.db.prepare(`
        SELECT strftime('${groupBy}', created_at) as label,
               COALESCE(SUM(total_amount), 0) as value
        FROM sales_orders
        WHERE status != 'cancelled'
        GROUP BY label
        ORDER BY label DESC
        LIMIT ?
      `).all(limit) as { label: string; value: number }[];

      // 反转使时间正序
      const data = rows.reverse().map(r => ({
        label: r.label,
        value: r.value,
      }));

      return { success: true, data };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getRecentOrders(): Promise<IpcResult<any[]>> {
    try {
      const orders = this.db.prepare(`
        SELECT so.*, c.name as customer_name
        FROM sales_orders so
        JOIN customers c ON so.customer_id = c.id
        ORDER BY so.created_at DESC
        LIMIT 10
      `).all();

      return { success: true, data: orders };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getActivityFeed(): Promise<IpcResult<any[]>> {
    try {
      const activities = this.db.prepare(`
        SELECT * FROM operation_logs
        ORDER BY created_at DESC
        LIMIT 20
      `).all();

      return { success: true, data: activities };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getSystemStatus(): Promise<IpcResult<any>> {
    try {
      const status = getSystemStatus();
      return { success: true, data: status };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }
}

export const dashboardService = new DashboardService();
