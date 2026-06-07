import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const systemSettings = sqliteTable('system_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
