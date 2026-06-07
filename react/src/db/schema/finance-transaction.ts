import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { users } from './user';

export const financeTransactions = sqliteTable('finance_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  amount: real('amount').notNull(),
  description: text('description'),
  method: text('method'),
  relatedOrderId: text('related_order_id'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
