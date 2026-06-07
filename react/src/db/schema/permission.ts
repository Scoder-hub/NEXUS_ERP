import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { roles } from './role';
import { users } from './user';

export const permissions = sqliteTable('permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  resource: text('resource').notNull(),
  action: text('action', { enum: ['view', 'create', 'edit', 'delete', 'approve', 'export'] }).notNull(),
});

export const rolePermissions = sqliteTable('role_permissions', {
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
});

export const userRoles = sqliteTable('user_roles', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
});
