import { getSqlite } from '../../db';
import type { IpcResult } from '../../shared/types/common';

export class InventoryService {
  private get db() { return getSqlite(); }

  async listItems(params: { page?: number; pageSize?: number; keyword?: string; warehouseId?: number }): Promise<IpcResult<any>> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;

      let where = '1=1';
      const values: any[] = [];

      if (params.warehouseId) {
        where += ' AND ii.warehouse_id = ?';
        values.push(params.warehouseId);
      }
      if (params.keyword) {
        where += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
        values.push(`%${params.keyword}%`, `%${params.keyword}%`);
      }

      const total = (this.db.prepare(`
        SELECT COUNT(*) as count FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        JOIN warehouses w ON ii.warehouse_id = w.id
        WHERE ${where}
      `).get(...values) as any).count;

      const items = this.db.prepare(`
        SELECT ii.*, p.name as product_name, p.sku, p.unit, p.min_stock, w.name as warehouse_name
        FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        JOIN warehouses w ON ii.warehouse_id = w.id
        WHERE ${where}
        ORDER BY ii.updated_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);

      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getItem(id: number): Promise<IpcResult<any>> {
    try {
      const item = this.db.prepare(`
        SELECT ii.*, p.name as product_name, p.sku, p.unit, p.min_stock, w.name as warehouse_name
        FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        JOIN warehouses w ON ii.warehouse_id = w.id
        WHERE ii.id = ?
      `).get(id);
      if (!item) return { success: false, error: { code: 'NOT_FOUND', message: '库存记录不存在' } };
      return { success: true, data: item };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async listTransactions(params: { page?: number; pageSize?: number; type?: string; productId?: number; warehouseId?: number }): Promise<IpcResult<any>> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;

      let where = '1=1';
      const values: any[] = [];

      if (params.type) {
        where += ' AND it.type = ?';
        values.push(params.type);
      }
      if (params.productId) {
        where += ' AND it.product_id = ?';
        values.push(params.productId);
      }
      if (params.warehouseId) {
        where += ' AND it.warehouse_id = ?';
        values.push(params.warehouseId);
      }

      const total = (this.db.prepare(`
        SELECT COUNT(*) as count FROM inventory_transactions it
        WHERE ${where}
      `).get(...values) as any).count;

      const items = this.db.prepare(`
        SELECT it.*, p.name as product_name, p.sku, w.name as warehouse_name
        FROM inventory_transactions it
        LEFT JOIN products p ON it.product_id = p.id
        LEFT JOIN warehouses w ON it.warehouse_id = w.id
        WHERE ${where}
        ORDER BY it.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);

      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async stockIn(data: { productId: number; warehouseId: number; quantity: number; relatedOrderId?: string; operatorId: number; note?: string }): Promise<IpcResult<any>> {
    try {
      const transaction = this.db.transaction(() => {
        // 查找或创建库存记录
        const existing = this.db.prepare(
          'SELECT * FROM inventory_items WHERE product_id = ? AND warehouse_id = ?'
        ).get(data.productId, data.warehouseId) as any;

        let inventoryId: number;
        if (existing) {
          this.db.prepare(
            'UPDATE inventory_items SET stock = stock + ?, updated_at = ? WHERE id = ?'
          ).run(data.quantity, new Date().toISOString(), existing.id);
          inventoryId = existing.id;
        } else {
          const result = this.db.prepare(
            'INSERT INTO inventory_items (product_id, warehouse_id, stock, updated_at) VALUES (?, ?, ?, ?)'
          ).run(data.productId, data.warehouseId, data.quantity, new Date().toISOString());
          inventoryId = Number(result.lastInsertRowid);
        }

        // 记录事务
        this.db.prepare(`
          INSERT INTO inventory_transactions (type, product_id, warehouse_id, quantity, related_order_id, operator_id, note)
          VALUES ('in', ?, ?, ?, ?, ?, ?)
        `).run(data.productId, data.warehouseId, data.quantity, data.relatedOrderId || null, data.operatorId, data.note || null);

        return { id: inventoryId };
      });

      const result = transaction();
      return { success: true, data: result };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async stockOut(data: { productId: number; warehouseId: number; quantity: number; relatedOrderId?: string; operatorId: number; note?: string }): Promise<IpcResult<any>> {
    try {
      const transaction = this.db.transaction(() => {
        // 查找库存记录
        const existing = this.db.prepare(
          'SELECT * FROM inventory_items WHERE product_id = ? AND warehouse_id = ?'
        ).get(data.productId, data.warehouseId) as any;

        if (!existing) {
          throw new Error('INSUFFICIENT_STOCK');
        }

        if (existing.stock < data.quantity) {
          throw new Error('INSUFFICIENT_STOCK');
        }

        // 更新库存
        this.db.prepare(
          'UPDATE inventory_items SET stock = stock - ?, updated_at = ? WHERE id = ?'
        ).run(data.quantity, new Date().toISOString(), existing.id);

        // 记录事务
        this.db.prepare(`
          INSERT INTO inventory_transactions (type, product_id, warehouse_id, quantity, related_order_id, operator_id, note)
          VALUES ('out', ?, ?, ?, ?, ?, ?)
        `).run(data.productId, data.warehouseId, data.quantity, data.relatedOrderId || null, data.operatorId, data.note || null);

        return { id: existing.id };
      });

      const result = transaction();
      return { success: true, data: result };
    } catch (err: any) {
      if (err?.message === 'INSUFFICIENT_STOCK') {
        return { success: false, error: { code: 'INSUFFICIENT_STOCK', message: '库存不足' } };
      }
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async listWarehouses(): Promise<IpcResult<any[]>> {
    try {
      const items = this.db.prepare('SELECT * FROM warehouses WHERE status = ? ORDER BY created_at DESC').all('active');
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getInventoryStats(): Promise<IpcResult<any>> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const totalStock = (this.db.prepare(
        'SELECT COALESCE(SUM(stock), 0) as total FROM inventory_items'
      ).get() as any).total;

      const lowStockCount = (this.db.prepare(`
        SELECT COUNT(*) as count FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        WHERE ii.stock <= p.min_stock
      `).get() as any).count;

      const monthStockIn = (this.db.prepare(
        `SELECT COALESCE(SUM(quantity), 0) as total FROM inventory_transactions WHERE type = 'in' AND created_at >= ?`
      ).get(monthStart) as any).total;

      const monthStockOut = (this.db.prepare(
        `SELECT COALESCE(SUM(quantity), 0) as total FROM inventory_transactions WHERE type = 'out' AND created_at >= ?`
      ).get(monthStart) as any).total;

      return { success: true, data: { totalStock, lowStockCount, monthStockIn, monthStockOut } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }
}

export const inventoryService = new InventoryService();
