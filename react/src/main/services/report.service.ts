import { getSqlite } from '../../db';
import type { IpcResult } from '../../shared/types/common';

export class ReportService {
  private get db() { return getSqlite(); }

  async listReports(params?: { type?: string }): Promise<IpcResult<any[]>> {
    try {
      let sql = 'SELECT * FROM reports WHERE 1=1';
      const values: any[] = [];

      if (params?.type) {
        sql += ' AND type = ?';
        values.push(params.type);
      }

      sql += ' ORDER BY created_at DESC';
      const items = this.db.prepare(sql).all(...values);
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async generateReport(data: { name: string; type: string }): Promise<IpcResult<any>> {
    try {
      const result = this.db.prepare(`
        INSERT INTO reports (name, type, size, status, date)
        VALUES (?, ?, ?, 'generating', ?)
      `).run(data.name, data.type, '0 KB', new Date().toISOString());
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }
}

export const reportService = new ReportService();
