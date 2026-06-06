import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/** 工序库表定义 */
export const processLibrary = sqliteTable("process_library", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  category: text("category").notNull().default("standard"),
  description: text("description"),
  icon: text("icon").default("gear"),
  responsibleRole: text("responsible_role"),
  defaultParams: text("default_params"),
  sortOrder: integer("sort_order").default(0),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/** 工艺路线表定义 */
export const routes = sqliteTable("routes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  version: text("version").notNull().default("v0.1"),
  status: text("status").notNull().default("draft"),
  snapshot: text("snapshot").notNull(),
  nodeCount: integer("node_count").default(0),
  edgeCount: integer("edge_count").default(0),
  createdBy: text("created_by").default("system"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  publishedAt: text("published_at"),
});

/** 路线版本历史表定义 */
export const routeHistory = sqliteTable("route_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  routeId: integer("route_id")
    .notNull()
    .references(() => routes.id),
  version: text("version").notNull(),
  snapshot: text("snapshot").notNull(),
  changeDescription: text("change_description"),
  createdBy: text("created_by").default("system"),
  createdAt: text("created_at").notNull(),
});
