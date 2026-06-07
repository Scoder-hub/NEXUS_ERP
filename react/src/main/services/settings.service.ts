import { getSqlite } from '../../db';
import type { IpcResult } from '../../shared/types/common';

export class SettingsService {
  private get db() {
    return getSqlite();
  }

  async getAll(): Promise<IpcResult<Record<string, string>>> {
    try {
      const rows = this.db.prepare('SELECT key, value FROM system_settings').all() as { key: string; value: string }[];
      const settings: Record<string, string> = {};
      for (const row of rows) {
        settings[row.key] = row.value;
      }
      return { success: true, data: settings };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getByKey(key: string): Promise<IpcResult<string>> {
    try {
      const row = this.db.prepare('SELECT value FROM system_settings WHERE key = ?').get(key) as { value: string } | undefined;
      if (!row) {
        return { success: false, error: { code: 'NOT_FOUND', message: '设置项不存在' } };
      }
      return { success: true, data: row.value };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async update(key: string, value: string): Promise<IpcResult<boolean>> {
    try {
      this.db.prepare('UPDATE system_settings SET value = ?, updated_at = ? WHERE key = ?').run(value, new Date().toISOString(), key);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }
}

export const settingsService = new SettingsService();
