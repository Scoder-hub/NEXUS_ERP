import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { users } from './user';

export const approvalItems = sqliteTable('approval_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  submitter: text('submitter').notNull(),
  dept: text('dept'),
  amount: real('amount'),
  type: text('type').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  priority: text('priority', { enum: ['high', 'medium', 'low'] }).notNull().default('medium'),
  description: text('description'),
  approverId: integer('approver_id').references(() => users.id),
  approvedAt: text('approved_at'),
  approvalNote: text('approval_note'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
