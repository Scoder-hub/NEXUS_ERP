import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { customers } from './customer';
import { users } from './user';
import { products } from './product';

export const salesOrders = sqliteTable('sales_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderNo: text('order_no').notNull().unique(),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  totalAmount: real('total_amount').notNull().default(0),
  status: text('status').notNull().default('draft'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  approvedBy: integer('approved_by').references(() => users.id),
  approvedAt: text('approved_at'),
  note: text('note'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const salesOrderItems = sqliteTable('sales_order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => salesOrders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  amount: real('amount').notNull(),
  note: text('note'),
});
