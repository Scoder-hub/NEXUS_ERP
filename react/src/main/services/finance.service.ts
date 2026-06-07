import { getSqlite } from '../../db';
import type { IpcResult } from '../../shared/types/common';

export class FinanceService {
  private get db() { return getSqlite(); }

  async listTransactions(params: { page?: number; pageSize?: number; type?: string }): Promise<IpcResult<any>> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;

      let where = '1=1';
      const values: any[] = [];

      if (params.type) {
        where += ' AND ft.type = ?';
        values.push(params.type);
      }

      const total = (this.db.prepare(`SELECT COUNT(*) as count FROM finance_transactions ft WHERE ${where}`).get(...values) as any).count;
      const items = this.db.prepare(`
        SELECT ft.*, u.name as created_by_name
        FROM finance_transactions ft
        LEFT JOIN users u ON ft.created_by = u.id
        WHERE ${where}
        ORDER BY ft.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);

      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async createTransaction(data: { type: string; amount: number; description?: string; method?: string; relatedOrderId?: string }, userId: number): Promise<IpcResult<any>> {
    try {
      const result = this.db.prepare(`
        INSERT INTO finance_transactions (type, amount, description, method, related_order_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(data.type, data.amount, data.description || null, data.method || null, data.relatedOrderId || null, userId);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getStats(): Promise<IpcResult<any>> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const totalIncome = (this.db.prepare(
        `SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions WHERE type = 'income' AND created_at >= ?`
      ).get(monthStart) as any).total;

      const totalExpense = (this.db.prepare(
        `SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions WHERE type = 'expense' AND created_at >= ?`
      ).get(monthStart) as any).total;

      const cashBalance = (this.db.prepare(
        `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as total FROM finance_transactions`
      ).get() as any).total;

      const receivable = (this.db.prepare(
        `SELECT COALESCE(SUM(so.total_amount), 0) as total FROM sales_orders so WHERE so.status = 'approved'`
      ).get() as any).total;

      return {
        success: true,
        data: {
          cashBalance,
          monthIncome: totalIncome,
          monthExpense: totalExpense,
          netProfit: totalIncome - totalExpense,
          receivable,
        },
      };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }
}

export const financeService = new FinanceService();
