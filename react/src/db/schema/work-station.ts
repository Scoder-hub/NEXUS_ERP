import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const workStations = sqliteTable('work_stations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type'),
  operator: text('operator'),
  currentJob: text('current_job'),
  status: text('status', { enum: ['running', 'idle', 'maintenance', 'warning'] }).notNull().default('idle'),
  efficiency: real('efficiency').notNull().default(0),
  temperature: real('temperature').notNull().default(0),
  load: real('load').notNull().default(0),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
