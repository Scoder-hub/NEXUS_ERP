import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { products } from './product';
import { users } from './user';

export const workOrders = sqliteTable('work_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderNo: text('order_no').notNull().unique(),
  name: text('name').notNull(),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unit: text('unit').notNull().default('个'),
  status: text('status', { enum: ['pending', 'in-progress', 'completed'] }).notNull().default('pending'),
  priority: text('priority', { enum: ['high', 'medium', 'low'] }).notNull().default('medium'),
  progress: integer('progress').notNull().default(0),
  workshop: text('workshop'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  note: text('note'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
