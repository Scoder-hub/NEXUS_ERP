import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  role: text('role'),
  dept: text('dept'),
  email: text('email'),
  phone: text('phone'),
  salary: real('salary'),
  status: text('status', { enum: ['active', 'leave', 'remote', 'resigned'] }).notNull().default('active'),
  joinDate: text('join_date'),
  avatar: text('avatar'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
