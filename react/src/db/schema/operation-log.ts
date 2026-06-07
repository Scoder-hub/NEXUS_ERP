import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './user';

export const operationLogs = sqliteTable('operation_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  user: text('user').notNull(),
  action: text('action').notNull(),
  module: text('module').notNull(),
  detail: text('detail'),
  ip: text('ip'),
  level: text('level', { enum: ['info', 'warning', 'error', 'success'] }).notNull().default('info'),
  duration: integer('duration'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
