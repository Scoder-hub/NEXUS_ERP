import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { products } from './product';
import { warehouses } from './warehouse';

export const inventoryItems = sqliteTable('inventory_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id),
  warehouseId: integer('warehouse_id').notNull().references(() => warehouses.id),
  stock: integer('stock').notNull().default(0),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
