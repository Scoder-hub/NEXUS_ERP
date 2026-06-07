import { getSqlite } from '../../db';
import type { IpcResult } from '../../shared/types/common';

export class ProductionService {
  private get db() { return getSqlite(); }

  async listWorkOrders(params: { page?: number; pageSize?: number; status?: string; keyword?: string }): Promise<IpcResult<any>> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;

      let where = '1=1';
      const values: any[] = [];

      if (params.status) {
        where += ' AND wo.status = ?';
        values.push(params.status);
      }
      if (params.keyword) {
        where += ' AND (wo.order_no LIKE ? OR wo.name LIKE ? OR p.name LIKE ?)';
        values.push(`%${params.keyword}%`, `%${params.keyword}%`, `%${params.keyword}%`);
      }

      const total = (this.db.prepare(`
        SELECT COUNT(*) as count FROM work_orders wo
        JOIN products p ON wo.product_id = p.id
        WHERE ${where}
      `).get(...values) as any).count;

      const items = this.db.prepare(`
        SELECT wo.*, p.name as product_name
        FROM work_orders wo
        JOIN products p ON wo.product_id = p.id
        WHERE ${where}
        ORDER BY wo.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);

      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getWorkOrder(id: number): Promise<IpcResult<any>> {
    try {
      const order = this.db.prepare(`
        SELECT wo.*, p.name as product_name, p.sku, p.unit
        FROM work_orders wo
        JOIN products p ON wo.product_id = p.id
        WHERE wo.id = ?
      `).get(id);
      if (!order) return { success: false, error: { code: 'NOT_FOUND', message: '工单不存在' } };

      const processCards = this.db.prepare(
        'SELECT * FROM process_cards WHERE work_order_id = ? ORDER BY seq'
      ).all(id);

      const reports = this.db.prepare(`
        SELECT rr.*, ws.name as station_name
        FROM report_records rr
        LEFT JOIN work_stations ws ON rr.station_id = ws.id
        WHERE rr.work_order_id = ?
        ORDER BY rr.created_at DESC
      `).all(id);

      return { success: true, data: { ...order, processCards, reports } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async createWorkOrder(data: {
    name: string; productId: number; quantity: number; unit?: string;
    priority?: string; workshop?: string; startDate?: string; endDate?: string;
    note?: string;
  }, userId: number): Promise<IpcResult<any>> {
    try {
      const transaction = this.db.transaction(() => {
        const count = (this.db.prepare('SELECT COUNT(*) as c FROM work_orders').get() as any).c;
        const orderNo = `WO-${String(count + 1).padStart(5, '0')}`;

        const result = this.db.prepare(`
          INSERT INTO work_orders (order_no, name, product_id, quantity, unit, status, priority, workshop, start_date, end_date, created_by, note)
          VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
        `).run(orderNo, data.name, data.productId, data.quantity, data.unit || '个', data.priority || 'medium', data.workshop || null, data.startDate || null, data.endDate || null, userId, data.note || null);

        return { id: result.lastInsertRowid, orderNo };
      });

      const result = transaction();
      return { success: true, data: result };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async updateWorkOrder(id: number, data: {
    status?: string; progress?: number; name?: string; priority?: string;
    workshop?: string; startDate?: string; endDate?: string; note?: string;
  }): Promise<IpcResult<boolean>> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status); }
      if (data.progress !== undefined) { updates.push('progress = ?'); values.push(data.progress); }
      if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
      if (data.priority !== undefined) { updates.push('priority = ?'); values.push(data.priority); }
      if (data.workshop !== undefined) { updates.push('workshop = ?'); values.push(data.workshop); }
      if (data.startDate !== undefined) { updates.push('start_date = ?'); values.push(data.startDate); }
      if (data.endDate !== undefined) { updates.push('end_date = ?'); values.push(data.endDate); }
      if (data.note !== undefined) { updates.push('note = ?'); values.push(data.note); }

      if (updates.length === 0) return { success: true, data: true };

      updates.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      this.db.prepare(`UPDATE work_orders SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async listWorkStations(): Promise<IpcResult<any[]>> {
    try {
      const items = this.db.prepare('SELECT * FROM work_stations ORDER BY name').all();
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async listProcessCards(workOrderId: number): Promise<IpcResult<any[]>> {
    try {
      const items = this.db.prepare(
        'SELECT * FROM process_cards WHERE work_order_id = ? ORDER BY seq'
      ).all(workOrderId);
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async submitReport(data: { workOrderId: number; stationId?: number; operator: string; quantity: number; defect?: number; note?: string }): Promise<IpcResult<any>> {
    try {
      const result = this.db.prepare(`
        INSERT INTO report_records (work_order_id, station_id, operator, quantity, defect, note)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(data.workOrderId, data.stationId || null, data.operator, data.quantity, data.defect || 0, data.note || null);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async listReports(workOrderId: number): Promise<IpcResult<any[]>> {
    try {
      const items = this.db.prepare(`
        SELECT rr.*, ws.name as station_name
        FROM report_records rr
        LEFT JOIN work_stations ws ON rr.station_id = ws.id
        WHERE rr.work_order_id = ?
        ORDER BY rr.created_at DESC
      `).all(workOrderId);
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getProductionStats(): Promise<IpcResult<any>> {
    try {
      const inProgressCount = (this.db.prepare(
        "SELECT COUNT(*) as count FROM work_orders WHERE status = 'in-progress'"
      ).get() as any).count;

      const completedCount = (this.db.prepare(
        "SELECT COUNT(*) as count FROM work_orders WHERE status = 'completed'"
      ).get() as any).count;

      const totalCount = (this.db.prepare(
        'SELECT COUNT(*) as count FROM work_orders'
      ).get() as any).count;

      const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const stationStats = this.db.prepare(
        "SELECT status, COUNT(*) as count FROM work_stations GROUP BY status"
      ).all() as { status: string; count: number }[];

      const runningStations = stationStats.find(s => s.status === 'running')?.count || 0;
      const totalStations = stationStats.reduce((sum, s) => sum + s.count, 0);
      const utilizationRate = totalStations > 0 ? Math.round((runningStations / totalStations) * 100) : 0;

      return { success: true, data: { inProgressCount, completionRate, utilizationRate } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }
}

export const productionService = new ProductionService();
