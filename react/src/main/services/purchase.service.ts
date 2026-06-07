import { getSqlite } from '../../db';
import type { IpcResult } from '../../shared/types/common';

export class PurchaseService {
  private get db() { return getSqlite(); }

  async listOrders(params: { page?: number; pageSize?: number; status?: string; keyword?: string }): Promise<IpcResult<any>> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;

      let where = '1=1';
      const values: any[] = [];

      if (params.status) {
        where += ' AND po.status = ?';
        values.push(params.status);
      }
      if (params.keyword) {
        where += ' AND (po.order_no LIKE ? OR s.name LIKE ?)';
        values.push(`%${params.keyword}%`, `%${params.keyword}%`);
      }

      const total = (this.db.prepare(`SELECT COUNT(*) as count FROM purchase_orders po JOIN suppliers s ON po.supplier_id = s.id WHERE ${where}`).get(...values) as any).count;
      const items = this.db.prepare(`
        SELECT po.*, s.name as supplier_name
        FROM purchase_orders po
        JOIN suppliers s ON po.supplier_id = s.id
        WHERE ${where}
        ORDER BY po.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);

      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getOrder(id: number): Promise<IpcResult<any>> {
    try {
      const order = this.db.prepare(`
        SELECT po.*, s.name as supplier_name, s.contact as supplier_contact, s.phone as supplier_phone
        FROM purchase_orders po
        JOIN suppliers s ON po.supplier_id = s.id
        WHERE po.id = ?
      `).get(id);
      if (!order) return { success: false, error: { code: 'NOT_FOUND', message: '订单不存在' } };

      const items = this.db.prepare(`
        SELECT poi.*, p.name as product_name, p.sku, p.unit
        FROM purchase_order_items poi
        JOIN products p ON poi.product_id = p.id
        WHERE poi.order_id = ?
      `).all(id);

      return { success: true, data: { ...order, items } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async createOrder(data: { supplierId: number; items: { productId: number; quantity: number; unitPrice: number }[]; note?: string }, userId: number): Promise<IpcResult<any>> {
    try {
      const transaction = this.db.transaction(() => {
        const count = (this.db.prepare('SELECT COUNT(*) as c FROM purchase_orders').get() as any).c;
        const orderNo = `PO-${String(count + 1).padStart(5, '0')}`;

        const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

        const result = this.db.prepare(`
          INSERT INTO purchase_orders (order_no, supplier_id, total_amount, status, created_by, note)
          VALUES (?, ?, ?, 'draft', ?, ?)
        `).run(orderNo, data.supplierId, totalAmount, userId, data.note || null);

        const orderId = result.lastInsertRowid;

        const insertItem = this.db.prepare(`
          INSERT INTO purchase_order_items (order_id, product_id, quantity, unit_price, amount)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const item of data.items) {
          insertItem.run(orderId, item.productId, item.quantity, item.unitPrice, item.quantity * item.unitPrice);
        }

        return { id: orderId, orderNo };
      });

      const result = transaction();
      return { success: true, data: result };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async updateOrderStatus(id: number, status: string, userId?: number): Promise<IpcResult<boolean>> {
    try {
      const updates: string[] = ['status = ?', 'updated_at = ?'];
      const values: any[] = [status, new Date().toISOString()];

      if (status === 'approved' && userId) {
        updates.push('approved_by = ?', 'approved_at = ?');
        values.push(userId, new Date().toISOString());
      }
      values.push(id);

      this.db.prepare(`UPDATE purchase_orders SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async listSuppliers(keyword?: string): Promise<IpcResult<any[]>> {
    try {
      let sql = 'SELECT * FROM suppliers WHERE status = ?';
      const values: any[] = ['active'];
      if (keyword) {
        sql += ' AND (name LIKE ? OR contact LIKE ?)';
        values.push(`%${keyword}%`, `%${keyword}%`);
      }
      sql += ' ORDER BY rating DESC';
      const items = this.db.prepare(sql).all(...values);
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getSupplier(id: number): Promise<IpcResult<any>> {
    try {
      const supplier = this.db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
      if (!supplier) return { success: false, error: { code: 'NOT_FOUND', message: '供应商不存在' } };
      return { success: true, data: supplier };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async createSupplier(data: { name: string; category?: string; contact?: string; phone?: string; email?: string; address?: string }): Promise<IpcResult<any>> {
    try {
      const result = this.db.prepare(`
        INSERT INTO suppliers (name, category, contact, phone, email, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(data.name, data.category || null, data.contact || null, data.phone || null, data.email || null, data.address || null);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async updateSupplier(id: number, data: { name?: string; category?: string; contact?: string; phone?: string; email?: string; address?: string; rating?: number; status?: string }): Promise<IpcResult<boolean>> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
      if (data.category !== undefined) { updates.push('category = ?'); values.push(data.category); }
      if (data.contact !== undefined) { updates.push('contact = ?'); values.push(data.contact); }
      if (data.phone !== undefined) { updates.push('phone = ?'); values.push(data.phone); }
      if (data.email !== undefined) { updates.push('email = ?'); values.push(data.email); }
      if (data.address !== undefined) { updates.push('address = ?'); values.push(data.address); }
      if (data.rating !== undefined) { updates.push('rating = ?'); values.push(data.rating); }
      if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status); }

      if (updates.length === 0) return { success: true, data: true };

      updates.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      this.db.prepare(`UPDATE suppliers SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }
}

export const purchaseService = new PurchaseService();
