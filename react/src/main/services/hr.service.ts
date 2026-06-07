import { getSqlite } from '../../db';
import type { IpcResult } from '../../shared/types/common';

export class HrService {
  private get db() { return getSqlite(); }

  async listEmployees(params: { page?: number; pageSize?: number; dept?: string; keyword?: string }): Promise<IpcResult<any>> {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;

      let where = '1=1';
      const values: any[] = [];

      if (params.dept) {
        where += ' AND e.dept = ?';
        values.push(params.dept);
      }
      if (params.keyword) {
        where += ' AND (e.name LIKE ? OR e.role LIKE ?)';
        values.push(`%${params.keyword}%`, `%${params.keyword}%`);
      }

      const total = (this.db.prepare(`SELECT COUNT(*) as count FROM employees e WHERE ${where}`).get(...values) as any).count;
      const items = this.db.prepare(`
        SELECT e.*, d.description as dept_description
        FROM employees e
        LEFT JOIN departments d ON e.dept = d.name
        WHERE ${where}
        ORDER BY e.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);

      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getEmployee(id: number): Promise<IpcResult<any>> {
    try {
      const employee = this.db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
      if (!employee) return { success: false, error: { code: 'NOT_FOUND', message: '员工不存在' } };
      return { success: true, data: employee };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async createEmployee(data: { name: string; role?: string; dept?: string; email?: string; phone?: string; salary?: number; status?: string; joinDate?: string; avatar?: string }): Promise<IpcResult<any>> {
    try {
      const result = this.db.prepare(`
        INSERT INTO employees (name, role, dept, email, phone, salary, status, join_date, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(data.name, data.role || null, data.dept || null, data.email || null, data.phone || null, data.salary || null, data.status || 'active', data.joinDate || null, data.avatar || null);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async updateEmployee(id: number, data: { name?: string; role?: string; dept?: string; email?: string; phone?: string; salary?: number; status?: string; joinDate?: string; avatar?: string }): Promise<IpcResult<boolean>> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
      if (data.role !== undefined) { updates.push('role = ?'); values.push(data.role); }
      if (data.dept !== undefined) { updates.push('dept = ?'); values.push(data.dept); }
      if (data.email !== undefined) { updates.push('email = ?'); values.push(data.email); }
      if (data.phone !== undefined) { updates.push('phone = ?'); values.push(data.phone); }
      if (data.salary !== undefined) { updates.push('salary = ?'); values.push(data.salary); }
      if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status); }
      if (data.joinDate !== undefined) { updates.push('join_date = ?'); values.push(data.joinDate); }
      if (data.avatar !== undefined) { updates.push('avatar = ?'); values.push(data.avatar); }

      if (updates.length === 0) return { success: true, data: true };

      updates.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      this.db.prepare(`UPDATE employees SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async listDepartments(): Promise<IpcResult<any[]>> {
    try {
      const items = this.db.prepare('SELECT * FROM departments ORDER BY name').all();
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }
}

export const hrService = new HrService();
