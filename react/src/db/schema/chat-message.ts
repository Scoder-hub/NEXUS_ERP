import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './user';

export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fromId: integer('from_id').notNull().references(() => users.id),
  toId: integer('to_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  type: text('type', { enum: ['text', 'image', 'file'] }).notNull().default('text'),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
