import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const departments = sqliteTable('departments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
