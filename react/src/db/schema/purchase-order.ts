import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { suppliers } from './supplier';
import { users } from './user';
import { products } from './product';

export const purchaseOrders = sqliteTable('purchase_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderNo: text('order_no').notNull().unique(),
  supplierId: integer('supplier_id').notNull().references(() => suppliers.id),
  totalAmount: real('total_amount').notNull().default(0),
  status: text('status').notNull().default('draft'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  approvedBy: integer('approved_by').references(() => users.id),
  approvedAt: text('approved_at'),
  note: text('note'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const purchaseOrderItems = sqliteTable('purchase_order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  amount: real('amount').notNull(),
  note: text('note'),
});
