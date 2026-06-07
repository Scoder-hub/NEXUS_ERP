import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const suppliers = sqliteTable('suppliers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category'),
  contact: text('contact'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  rating: real('rating').notNull().default(0),
  status: text('status', { enum: ['active', 'pending', 'disabled'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
