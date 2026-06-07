import { getSqlite } from '../../db';
import type { IpcResult } from '../../shared/types/common';

export class SalesService {
  private get db() { return getSqlite(); }

  async listOrders(params: { page?: number; pageSize?: number; status?: string; keyword?: string }): Promise<IpcResult<any>> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;

      let where = '1=1';
      const values: any[] = [];

      if (params.status) {
        where += ' AND so.status = ?';
        values.push(params.status);
      }
      if (params.keyword) {
        where += ' AND (so.order_no LIKE ? OR c.name LIKE ?)';
        values.push(`%${params.keyword}%`, `%${params.keyword}%`);
      }

      const total = (this.db.prepare(`SELECT COUNT(*) as count FROM sales_orders so JOIN customers c ON so.customer_id = c.id WHERE ${where}`).get(...values) as any).count;
      const items = this.db.prepare(`
        SELECT so.*, c.name as customer_name
        FROM sales_orders so
        JOIN customers c ON so.customer_id = c.id
        WHERE ${where}
        ORDER BY so.created_at DESC
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
        SELECT so.*, c.name as customer_name, c.contact as customer_contact, c.phone as customer_phone
        FROM sales_orders so
        JOIN customers c ON so.customer_id = c.id
        WHERE so.id = ?
      `).get(id);
      if (!order) return { success: false, error: { code: 'NOT_FOUND', message: '订单不存在' } };

      const items = this.db.prepare(`
        SELECT soi.*, p.name as product_name, p.sku, p.unit
        FROM sales_order_items soi
        JOIN products p ON soi.product_id = p.id
        WHERE soi.order_id = ?
      `).all(id);

      return { success: true, data: { ...order, items } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async createOrder(data: { customerId: number; items: { productId: number; quantity: number; unitPrice: number }[]; note?: string }, userId: number): Promise<IpcResult<any>> {
    try {
      const transaction = this.db.transaction(() => {
        const count = (this.db.prepare('SELECT COUNT(*) as c FROM sales_orders').get() as any).c;
        const orderNo = `SO-${String(count + 1).padStart(5, '0')}`;

        const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

        const result = this.db.prepare(`
          INSERT INTO sales_orders (order_no, customer_id, total_amount, status, created_by, note)
          VALUES (?, ?, ?, 'draft', ?, ?)
        `).run(orderNo, data.customerId, totalAmount, userId, data.note || null);

        const orderId = result.lastInsertRowid;

        const insertItem = this.db.prepare(`
          INSERT INTO sales_order_items (order_id, product_id, quantity, unit_price, amount)
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

      this.db.prepare(`UPDATE sales_orders SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async listCustomers(params?: { keyword?: string; page?: number; pageSize?: number }): Promise<IpcResult<any>> {
    try {
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const offset = (page - 1) * pageSize;

      let where = 'status = ?';
      const values: any[] = ['active'];
      if (params?.keyword) {
        where += ' AND (name LIKE ? OR contact LIKE ?)';
        values.push(`%${params.keyword}%`, `%${params.keyword}%`);
      }

      const total = (this.db.prepare(`SELECT COUNT(*) as count FROM customers WHERE ${where}`).get(...values) as any).count;
      const items = this.db.prepare(`
        SELECT * FROM customers WHERE ${where}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);

      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getCustomer(id: number): Promise<IpcResult<any>> {
    try {
      const customer = this.db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
      if (!customer) return { success: false, error: { code: 'NOT_FOUND', message: '客户不存在' } };
      return { success: true, data: customer };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async createCustomer(data: { name: string; tier?: string; contact?: string; phone?: string; email?: string; address?: string; creditLimit?: number }): Promise<IpcResult<any>> {
    try {
      const result = this.db.prepare(`
        INSERT INTO customers (name, tier, contact, phone, email, address, credit_limit)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(data.name, data.tier || 'normal', data.contact || null, data.phone || null, data.email || null, data.address || null, data.creditLimit || 0);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async updateCustomer(id: number, data: { name?: string; tier?: string; contact?: string; phone?: string; email?: string; address?: string; creditLimit?: number; status?: string }): Promise<IpcResult<boolean>> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
      if (data.tier !== undefined) { updates.push('tier = ?'); values.push(data.tier); }
      if (data.contact !== undefined) { updates.push('contact = ?'); values.push(data.contact); }
      if (data.phone !== undefined) { updates.push('phone = ?'); values.push(data.phone); }
      if (data.email !== undefined) { updates.push('email = ?'); values.push(data.email); }
      if (data.address !== undefined) { updates.push('address = ?'); values.push(data.address); }
      if (data.creditLimit !== undefined) { updates.push('credit_limit = ?'); values.push(data.creditLimit); }
      if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status); }

      if (updates.length === 0) return { success: true, data: true };

      updates.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      this.db.prepare(`UPDATE customers SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getSalesStats(): Promise<IpcResult<any>> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const salesAmount = (this.db.prepare(
        `SELECT COALESCE(SUM(total_amount), 0) as total FROM sales_orders WHERE status != 'draft' AND created_at >= ?`
      ).get(monthStart) as any).total;

      const orderCount = (this.db.prepare(
        `SELECT COUNT(*) as count FROM sales_orders WHERE status != 'draft' AND created_at >= ?`
      ).get(monthStart) as any).count;

      const customerCount = (this.db.prepare(
        `SELECT COUNT(DISTINCT customer_id) as count FROM sales_orders WHERE status != 'draft' AND created_at >= ?`
      ).get(monthStart) as any).count;

      return { success: true, data: { monthSalesAmount: salesAmount, monthOrderCount: orderCount, monthCustomerCount: customerCount } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }
}

export const salesService = new SalesService();
