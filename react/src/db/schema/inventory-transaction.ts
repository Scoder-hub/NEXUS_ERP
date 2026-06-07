import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './user';

export const inventoryTransactions = sqliteTable('inventory_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['in', 'out'] }).notNull(),
  productId: integer('product_id').notNull(),
  warehouseId: integer('warehouse_id').notNull(),
  quantity: integer('quantity').notNull(),
  relatedOrderId: text('related_order_id'),
  operatorId: integer('operator_id').notNull().references(() => users.id),
  note: text('note'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
