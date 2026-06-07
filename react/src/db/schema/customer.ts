import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  tier: text('tier', { enum: ['diamond', 'platinum', 'gold', 'normal'] }).notNull().default('normal'),
  contact: text('contact'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  creditLimit: real('credit_limit').notNull().default(0),
  status: text('status', { enum: ['active', 'disabled'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
