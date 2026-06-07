import { getSqlite } from '../../db';
import { verifyPassword, hashPassword, generateToken, verifyToken, verifyPin } from '../utils/crypto';
import type { IpcResult } from '../../shared/types/common';
import type { User, Permission, LoginResponse } from '../../shared/types/auth';

// 安全字段列表：查询用户时排除敏感字段（pin、login_attempts、locked_until 仅后端使用，不返回前端）
const USER_SAFE_FIELDS = 'id, username, name, email, phone, avatar, bio, dept, status, join_date, last_login';
// 内部字段：仅后端验证使用，不返回给前端
const USER_INTERNAL_FIELDS = 'pin, login_attempts, locked_until';

export class AuthService {
  private get db() {
    return getSqlite();
  }

  async login(username: string, password: string, rememberMe: boolean): Promise<IpcResult<LoginResponse>> {
    try {
      const userRow = this.db.prepare(`SELECT ${USER_SAFE_FIELDS}, ${USER_INTERNAL_FIELDS}, password_hash FROM users WHERE username = ?`).get(username) as any;

      if (!userRow) {
        return { success: false, error: { code: 'AUTH_FAILED', message: '用户名或密码错误' } };
      }

      // 检查账户锁定
      if (userRow.status === 'locked') {
        const lockedUntil = new Date(userRow.locked_until);
        if (lockedUntil > new Date()) {
          return { success: false, error: { code: 'ACCOUNT_LOCKED', message: '账户已锁定，请30分钟后重试' } };
        }
        // 锁定已过期，解锁
        this.db.prepare('UPDATE users SET status = ?, login_attempts = 0, locked_until = NULL WHERE id = ?').run('active', userRow.id);
        userRow.status = 'active';
        userRow.login_attempts = 0;
      }

      if (userRow.status === 'disabled') {
        return { success: false, error: { code: 'ACCOUNT_DISABLED', message: '账户已禁用，请联系管理员' } };
      }

      // 验证密码
      if (!verifyPassword(password, userRow.password_hash)) {
        const attempts = userRow.login_attempts + 1;
        if (attempts >= 5) {
          const lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
          this.db.prepare('UPDATE users SET login_attempts = ?, status = ?, locked_until = ? WHERE id = ?').run(attempts, 'locked', lockedUntil, userRow.id);
          return { success: false, error: { code: 'ACCOUNT_LOCKED', message: '连续5次登录失败，账户已锁定30分钟' } };
        }
        this.db.prepare('UPDATE users SET login_attempts = ? WHERE id = ?').run(attempts, userRow.id);
        return { success: false, error: { code: 'AUTH_FAILED', message: '用户名或密码错误' } };
      }

      // 登录成功
      this.db.prepare('UPDATE users SET login_attempts = 0, last_login = ? WHERE id = ?').run(new Date().toISOString(), userRow.id);

      // 获取用户权限
      const permissions = this.getUserPermissions(userRow.id);

      // 生成 token
      const token = rememberMe ? generateToken(userRow.id) : undefined;

      const userData: User = {
        id: userRow.id,
        username: userRow.username,
        name: userRow.name,
        email: userRow.email || '',
        phone: userRow.phone || '',
        avatar: userRow.avatar || '',
        bio: userRow.bio || '',
        dept: userRow.dept || '',
        status: userRow.status,
        joinDate: userRow.join_date || '',
        lastLogin: new Date().toISOString(),
      };

      return {
        success: true,
        data: { user: userData, permissions, token },
      };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async validateToken(token: string): Promise<IpcResult<LoginResponse>> {
    try {
      const payload = verifyToken(token);
      if (!payload) {
        return { success: false, error: { code: 'TOKEN_INVALID', message: 'Token已过期或无效' } };
      }

      const userRow = this.db.prepare(`SELECT ${USER_SAFE_FIELDS}, ${USER_INTERNAL_FIELDS}, password_hash FROM users WHERE id = ?`).get(payload.userId) as any;
      if (!userRow || userRow.status !== 'active') {
        return { success: false, error: { code: 'TOKEN_INVALID', message: '用户不存在或已禁用' } };
      }

      const permissions = this.getUserPermissions(userRow.id);
      const userData: User = {
        id: userRow.id,
        username: userRow.username,
        name: userRow.name,
        email: userRow.email || '',
        phone: userRow.phone || '',
        avatar: userRow.avatar || '',
        bio: userRow.bio || '',
        dept: userRow.dept || '',
        status: userRow.status,
        joinDate: userRow.join_date || '',
        lastLogin: userRow.last_login || '',
      };

      return { success: true, data: { user: userData, permissions } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async unlock(userId: number, pin?: string, password?: string): Promise<IpcResult<boolean>> {
    try {
      const userRow = this.db.prepare(`SELECT ${USER_SAFE_FIELDS}, ${USER_INTERNAL_FIELDS}, password_hash FROM users WHERE id = ?`).get(userId) as any;
      if (!userRow) {
        return { success: false, error: { code: 'USER_NOT_FOUND', message: '用户不存在' } };
      }

      // 优先验证 PIN（使用 bcrypt 哈希比较）
      if (pin && userRow.pin) {
        if (verifyPin(pin, userRow.pin)) {
          return { success: true, data: true };
        }
        return { success: false, error: { code: 'UNLOCK_FAILED', message: 'PIN码错误' } };
      }

      // 验证密码
      if (password) {
        if (verifyPassword(password, userRow.password_hash)) {
          return { success: true, data: true };
        }
        return { success: false, error: { code: 'UNLOCK_FAILED', message: '密码错误' } };
      }

      return { success: false, error: { code: 'UNLOCK_FAILED', message: '请输入PIN码或密码' } };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<IpcResult<boolean>> {
    try {
      const userRow = this.db.prepare(`SELECT ${USER_SAFE_FIELDS}, ${USER_INTERNAL_FIELDS}, password_hash FROM users WHERE id = ?`).get(userId) as any;
      if (!userRow) {
        return { success: false, error: { code: 'USER_NOT_FOUND', message: '用户不存在' } };
      }

      if (!verifyPassword(oldPassword, userRow.password_hash)) {
        return { success: false, error: { code: 'WRONG_PASSWORD', message: '当前密码不正确' } };
      }

      const newHash = hashPassword(newPassword);
      this.db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(newHash, new Date().toISOString(), userId);

      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async updateProfile(userId: number, data: { name?: string; phone?: string; bio?: string; avatar?: string }): Promise<IpcResult<boolean>> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
      if (data.phone !== undefined) { updates.push('phone = ?'); values.push(data.phone); }
      if (data.bio !== undefined) { updates.push('bio = ?'); values.push(data.bio); }
      if (data.avatar !== undefined) { updates.push('avatar = ?'); values.push(data.avatar); }

      if (updates.length === 0) {
        return { success: true, data: true };
      }

      updates.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(userId);

      this.db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  async getCurrentUser(userId: number): Promise<IpcResult<User>> {
    try {
      const userRow = this.db.prepare(`SELECT ${USER_SAFE_FIELDS} FROM users WHERE id = ?`).get(userId) as any;
      if (!userRow) {
        return { success: false, error: { code: 'USER_NOT_FOUND', message: '用户不存在' } };
      }
      const userData: User = {
        id: userRow.id,
        username: userRow.username,
        name: userRow.name,
        email: userRow.email || '',
        phone: userRow.phone || '',
        avatar: userRow.avatar || '',
        bio: userRow.bio || '',
        dept: userRow.dept || '',
        status: userRow.status,
        joinDate: userRow.join_date || '',
        lastLogin: userRow.last_login || '',
      };
      return { success: true, data: userData };
    } catch {
      return { success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } };
    }
  }

  private getUserPermissions(userId: number): Permission[] {
    const rows = this.db.prepare(`
      SELECT DISTINCT p.id, p.resource, p.action
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ?
    `).all(userId) as { id: number; resource: string; action: string }[];

    return rows.map(r => ({ id: r.id, resource: r.resource, action: r.action }));
  }
}

export const authService = new AuthService();
