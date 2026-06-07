import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const reports = sqliteTable('reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  size: text('size'),
  status: text('status', { enum: ['generated', 'generating'] }).notNull().default('generating'),
  date: text('date'),
  filePath: text('file_path'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
