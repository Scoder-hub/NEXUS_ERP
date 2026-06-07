import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const backupRecords = sqliteTable('backup_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  size: text('size'),
  type: text('type', { enum: ['full', 'incremental', 'differential'] }).notNull(),
  status: text('status', { enum: ['completed', 'running', 'failed', 'scheduled'] }).notNull(),
  modules: text('modules'),
  filePath: text('file_path'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
