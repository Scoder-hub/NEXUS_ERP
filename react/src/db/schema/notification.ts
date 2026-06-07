import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './user';

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type', { enum: ['info', 'warning', 'success', 'error', 'approval'] }).notNull(),
  title: text('title').notNull(),
  content: text('content'),
  sender: text('sender'),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
