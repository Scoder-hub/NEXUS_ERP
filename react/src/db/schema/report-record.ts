import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { workOrders } from './work-order';
import { workStations } from './work-station';

export const reportRecords = sqliteTable('report_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workOrderId: integer('work_order_id').notNull().references(() => workOrders.id),
  stationId: integer('station_id').references(() => workStations.id),
  operator: text('operator').notNull(),
  quantity: integer('quantity').notNull(),
  defect: integer('defect').notNull().default(0),
  note: text('note'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
