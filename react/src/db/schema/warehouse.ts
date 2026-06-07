import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const warehouses = sqliteTable('warehouses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  area: real('area'),
  status: text('status', { enum: ['active', 'disabled'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
