import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { workOrders } from './work-order';

export const processCards = sqliteTable('process_cards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workOrderId: integer('work_order_id').notNull().references(() => workOrders.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  seq: integer('seq').notNull(),
  status: text('status', { enum: ['pending', 'in-progress', 'completed'] }).notNull().default('pending'),
  duration: integer('duration').notNull().default(0),
  actualDuration: integer('actual_duration').notNull().default(0),
  station: text('station'),
  note: text('note'),
});
