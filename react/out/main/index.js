import { app, ipcMain, BrowserWindow } from "electron";
import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  avatar: text("avatar"),
  bio: text("bio"),
  dept: text("dept"),
  status: text("status", { enum: ["active", "locked", "disabled"] }).notNull().default("active"),
  pin: text("pin"),
  loginAttempts: integer("login_attempts").notNull().default(0),
  lockedUntil: text("locked_until"),
  joinDate: text("join_date"),
  lastLogin: text("last_login"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const permissions = sqliteTable("permissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  resource: text("resource").notNull(),
  action: text("action", { enum: ["view", "create", "edit", "delete", "approve", "export"] }).notNull()
});
const rolePermissions = sqliteTable("role_permissions", {
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" })
});
const userRoles = sqliteTable("user_roles", {
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" })
});
const departments = sqliteTable("departments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category"),
  contact: text("contact"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  rating: real("rating").notNull().default(0),
  status: text("status", { enum: ["active", "pending", "disabled"] }).notNull().default("active"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category"),
  unit: text("unit").notNull().default("个"),
  price: real("price").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  description: text("description"),
  status: text("status", { enum: ["active", "disabled"] }).notNull().default("active"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const purchaseOrders = sqliteTable("purchase_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNo: text("order_no").notNull().unique(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  totalAmount: real("total_amount").notNull().default(0),
  status: text("status").notNull().default("draft"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: text("approved_at"),
  note: text("note"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const purchaseOrderItems = sqliteTable("purchase_order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => purchaseOrders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  amount: real("amount").notNull(),
  note: text("note")
});
const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  tier: text("tier", { enum: ["diamond", "platinum", "gold", "normal"] }).notNull().default("normal"),
  contact: text("contact"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  creditLimit: real("credit_limit").notNull().default(0),
  status: text("status", { enum: ["active", "disabled"] }).notNull().default("active"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const salesOrders = sqliteTable("sales_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNo: text("order_no").notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  totalAmount: real("total_amount").notNull().default(0),
  status: text("status").notNull().default("draft"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: text("approved_at"),
  note: text("note"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const salesOrderItems = sqliteTable("sales_order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => salesOrders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  amount: real("amount").notNull(),
  note: text("note")
});
const warehouses = sqliteTable("warehouses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  area: real("area"),
  status: text("status", { enum: ["active", "disabled"] }).notNull().default("active"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const inventoryItems = sqliteTable("inventory_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().references(() => products.id),
  warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id),
  stock: integer("stock").notNull().default(0),
  updatedAt: text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const inventoryTransactions = sqliteTable("inventory_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["in", "out"] }).notNull(),
  productId: integer("product_id").notNull(),
  warehouseId: integer("warehouse_id").notNull(),
  quantity: integer("quantity").notNull(),
  relatedOrderId: text("related_order_id"),
  operatorId: integer("operator_id").notNull().references(() => users.id),
  note: text("note"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const workOrders = sqliteTable("work_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNo: text("order_no").notNull().unique(),
  name: text("name").notNull(),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull().default("个"),
  status: text("status", { enum: ["pending", "in-progress", "completed"] }).notNull().default("pending"),
  priority: text("priority", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  progress: integer("progress").notNull().default(0),
  workshop: text("workshop"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  note: text("note"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const workStations = sqliteTable("work_stations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type"),
  operator: text("operator"),
  currentJob: text("current_job"),
  status: text("status", { enum: ["running", "idle", "maintenance", "warning"] }).notNull().default("idle"),
  efficiency: real("efficiency").notNull().default(0),
  temperature: real("temperature").notNull().default(0),
  load: real("load").notNull().default(0),
  updatedAt: text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const processCards = sqliteTable("process_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workOrderId: integer("work_order_id").notNull().references(() => workOrders.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  seq: integer("seq").notNull(),
  status: text("status", { enum: ["pending", "in-progress", "completed"] }).notNull().default("pending"),
  duration: integer("duration").notNull().default(0),
  actualDuration: integer("actual_duration").notNull().default(0),
  station: text("station"),
  note: text("note")
});
const reportRecords = sqliteTable("report_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workOrderId: integer("work_order_id").notNull().references(() => workOrders.id),
  stationId: integer("station_id").references(() => workStations.id),
  operator: text("operator").notNull(),
  quantity: integer("quantity").notNull(),
  defect: integer("defect").notNull().default(0),
  note: text("note"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const financeTransactions = sqliteTable("finance_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  method: text("method"),
  relatedOrderId: text("related_order_id"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role"),
  dept: text("dept"),
  email: text("email"),
  phone: text("phone"),
  salary: real("salary"),
  status: text("status", { enum: ["active", "leave", "remote", "resigned"] }).notNull().default("active"),
  joinDate: text("join_date"),
  avatar: text("avatar"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const operationLogs = sqliteTable("operation_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  user: text("user").notNull(),
  action: text("action").notNull(),
  module: text("module").notNull(),
  detail: text("detail"),
  ip: text("ip"),
  level: text("level", { enum: ["info", "warning", "error", "success"] }).notNull().default("info"),
  duration: integer("duration"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const backupRecords = sqliteTable("backup_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  size: text("size"),
  type: text("type", { enum: ["full", "incremental", "differential"] }).notNull(),
  status: text("status", { enum: ["completed", "running", "failed", "scheduled"] }).notNull(),
  modules: text("modules"),
  filePath: text("file_path"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type", { enum: ["info", "warning", "success", "error", "approval"] }).notNull(),
  title: text("title").notNull(),
  content: text("content"),
  sender: text("sender"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const approvalItems = sqliteTable("approval_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  submitter: text("submitter").notNull(),
  dept: text("dept"),
  amount: real("amount"),
  type: text("type").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  priority: text("priority", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  description: text("description"),
  approverId: integer("approver_id").references(() => users.id),
  approvedAt: text("approved_at"),
  approvalNote: text("approval_note"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromId: integer("from_id").notNull().references(() => users.id),
  toId: integer("to_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  type: text("type", { enum: ["text", "image", "file"] }).notNull().default("text"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: text("size"),
  status: text("status", { enum: ["generated", "generating"] }).notNull().default("generating"),
  date: text("date"),
  filePath: text("file_path"),
  createdAt: text("created_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const systemSettings = sqliteTable("system_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: text("updated_at").notNull().$defaultFn(() => (/* @__PURE__ */ new Date()).toISOString())
});
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  approvalItems,
  backupRecords,
  chatMessages,
  customers,
  departments,
  employees,
  financeTransactions,
  inventoryItems,
  inventoryTransactions,
  notifications,
  operationLogs,
  permissions,
  processCards,
  products,
  purchaseOrderItems,
  purchaseOrders,
  reportRecords,
  reports,
  rolePermissions,
  roles,
  salesOrderItems,
  salesOrders,
  suppliers,
  systemSettings,
  userRoles,
  users,
  warehouses,
  workOrders,
  workStations
}, Symbol.toStringTag, { value: "Module" }));
function seedInitialData(db) {
  const transaction = db.transaction(() => {
    db.prepare(`
      INSERT INTO roles (name, description, is_system) VALUES
      ('超级管理员', '系统最高权限角色', 1),
      ('管理员', '系统管理角色', 1),
      ('部门主管', '部门管理角色', 1),
      ('普通员工', '基础操作角色', 1),
      ('访客', '只读访问角色', 1)
    `).run();
    const resources = [
      "dashboard",
      "purchase",
      "supplier",
      "sales",
      "customer",
      "inventory",
      "warehouse",
      "production",
      "work-station",
      "finance",
      "hr",
      "employee",
      "report",
      "notification",
      "approval",
      "message",
      "log",
      "backup",
      "settings",
      "profile"
    ];
    const actions = ["view", "create", "edit", "delete", "approve", "export"];
    const insertPerm = db.prepare("INSERT INTO permissions (resource, action) VALUES (?, ?)");
    for (const resource of resources) {
      for (const action of actions) {
        insertPerm.run(resource, action);
      }
    }
    const allPerms = db.prepare("SELECT id FROM permissions").all();
    const insertRolePerm = db.prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (1, ?)");
    for (const perm of allPerms) {
      insertRolePerm.run(perm.id);
    }
    const passwordHash = bcrypt.hashSync("admin123", 10);
    db.prepare(`
      INSERT INTO users (username, password_hash, name, email, status)
      VALUES ('admin', ?, '系统管理员', 'admin@nexus-erp.com', 'active')
    `).run(passwordHash);
    db.prepare("INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)").run();
    db.prepare(`
      INSERT INTO departments (name, description) VALUES
      ('管理层', '公司管理层'),
      ('采购部', '采购管理部门'),
      ('销售部', '销售管理部门'),
      ('生产部', '生产管理部门'),
      ('财务部', '财务管理部门'),
      ('人力资源部', '人事管理部门'),
      ('仓储部', '仓库管理部门')
    `).run();
    db.prepare(`
      INSERT INTO warehouses (name, area, status) VALUES
      ('A 仓库', 1200, 'active'),
      ('B 仓库', 800, 'active'),
      ('C 仓库', 600, 'active')
    `).run();
    db.prepare(`
      INSERT INTO system_settings (key, value, description) VALUES
      ('session_timeout', '30', '会话超时时间（分钟）'),
      ('backup_daily_time', '03:00', '每日增量备份时间'),
      ('backup_weekly_day', '0', '每周全量备份日（0=周日）'),
      ('backup_monthly_date', '1', '每月归档日期'),
      ('max_backup_full', '10', '全量备份最大保留数'),
      ('max_backup_incremental', '30', '增量备份最大保留数'),
      ('log_retention_days', '365', '日志保留天数'),
      ('notification_retention_days', '90', '通知保留天数')
    `).run();
    db.prepare(`
      INSERT INTO products (name, sku, category, unit, price, min_stock, status) VALUES
      ('青花瓷碗', 'QH-001', '餐具', '个', 28.00, 100, 'active'),
      ('白瓷茶杯', 'BC-001', '茶具', '个', 15.00, 200, 'active'),
      ('粉彩花瓶', 'FC-001', '装饰', '个', 168.00, 30, 'active'),
      ('釉下彩盘', 'YX-001', '餐具', '个', 35.00, 150, 'active'),
      ('青瓷香炉', 'QC-001', '香道', '个', 88.00, 50, 'active'),
      ('斗彩杯', 'DC-001', '茶具', '个', 45.00, 80, 'active'),
      ('颜色釉瓶', 'YS-001', '装饰', '个', 220.00, 20, 'active'),
      ('玲珑碗', 'LL-001', '餐具', '个', 32.00, 120, 'active')
    `).run();
    db.prepare(`
      INSERT INTO suppliers (name, category, contact, phone, rating, status) VALUES
      ('景德镇原料厂', '原料', '张三', '13800001111', 4.5, 'active'),
      ('宜兴陶土供应', '原料', '李四', '13800002222', 4.2, 'active'),
      ('佛山釉料公司', '釉料', '王五', '13800003333', 4.8, 'active'),
      ('淄博耐火材料', '辅料', '赵六', '13800004444', 3.9, 'active')
    `).run();
    db.prepare(`
      INSERT INTO customers (name, tier, contact, phone, credit_limit, status) VALUES
      ('华美陶瓷商城', 'diamond', '陈总', '13900001111', 500000, 'active'),
      ('东方艺术馆', 'platinum', '刘总', '13900002222', 300000, 'active'),
      ('国风生活馆', 'gold', '周总', '13900003333', 100000, 'active'),
      ('雅致茶具店', 'normal', '吴总', '13900004444', 50000, 'active')
    `).run();
    db.prepare(`
      INSERT INTO inventory_items (product_id, warehouse_id, stock) VALUES
      (1, 1, 500), (2, 1, 800), (3, 2, 50), (4, 1, 600),
      (5, 2, 100), (6, 1, 300), (7, 2, 30), (8, 3, 400)
    `).run();
    db.prepare(`
      INSERT INTO employees (name, role, dept, email, phone, salary, status, join_date) VALUES
      ('张明', '采购主管', '采购部', 'zhangming@erp.com', '13800001111', 12000, 'active', '2024-01-15'),
      ('李芳', '销售经理', '销售部', 'lifang@erp.com', '13800002222', 15000, 'active', '2023-06-01'),
      ('王强', '生产总监', '生产部', 'wangqiang@erp.com', '13800003333', 18000, 'active', '2022-03-20'),
      ('赵丽', '财务主管', '财务部', 'zhaoli@erp.com', '13800004444', 13000, 'active', '2023-09-10'),
      ('陈伟', 'HR主管', '人力资源部', 'chenwei@erp.com', '13800005555', 11000, 'active', '2024-02-01'),
      ('刘洋', '仓库管理员', '仓储部', 'liuyang@erp.com', '13800006666', 8000, 'active', '2024-05-15')
    `).run();
    db.prepare(`
      INSERT INTO work_stations (name, type, operator, status, efficiency, temperature, load) VALUES
      ('成型工位 A1', '成型', '张师傅', 'running', 92.5, 45.2, 78.0),
      ('成型工位 A2', '成型', '李师傅', 'idle', 0, 32.1, 0),
      ('施釉工位 B1', '施釉', '王师傅', 'running', 88.3, 52.8, 65.0),
      ('烧成工位 C1', '烧成', '赵师傅', 'running', 95.1, 1280.0, 82.0),
      ('烧成工位 C2', '烧成', '钱师傅', 'maintenance', 0, 25.0, 0),
      ('彩绘工位 D1', '彩绘', '孙师傅', 'running', 85.7, 38.5, 55.0),
      ('质检工位 E1', '质检', '周师傅', 'running', 90.2, 28.0, 45.0)
    `).run();
  });
  transaction();
}
let sqliteInstance = null;
function initDatabase(dbPath) {
  sqliteInstance = new Database(dbPath);
  sqliteInstance.pragma("journal_mode = WAL");
  sqliteInstance.pragma("foreign_keys = ON");
  sqliteInstance.pragma("synchronous = NORMAL");
  sqliteInstance.pragma("cache_size = -64000");
  sqliteInstance.pragma("busy_timeout = 5000");
  drizzle(sqliteInstance, { schema });
  createTables();
  const userCount = sqliteInstance.prepare("SELECT COUNT(*) as count FROM users").get();
  if (userCount.count === 0) {
    seedInitialData(sqliteInstance);
  }
}
function createTables() {
  if (!sqliteInstance) throw new Error("SQLite not initialized");
  const sql = sqliteInstance;
  sql.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      avatar TEXT,
      bio TEXT,
      dept TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      pin TEXT,
      login_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TEXT,
      join_date TEXT,
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource TEXT NOT NULL,
      action TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      contact TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      rating REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      category TEXT,
      unit TEXT NOT NULL DEFAULT '个',
      price REAL NOT NULL DEFAULT 0,
      min_stock INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT NOT NULL UNIQUE,
      supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
      total_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      created_by INTEGER NOT NULL REFERENCES users(id),
      approved_by INTEGER REFERENCES users(id),
      approved_at TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      amount REAL NOT NULL,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'normal',
      contact TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      credit_limit REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sales_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      total_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      created_by INTEGER NOT NULL REFERENCES users(id),
      approved_by INTEGER REFERENCES users(id),
      approved_at TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sales_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      amount REAL NOT NULL,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS warehouses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      area REAL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id),
      warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
      stock INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      warehouse_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      related_order_id TEXT,
      operator_id INTEGER NOT NULL REFERENCES users(id),
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS work_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit TEXT NOT NULL DEFAULT '个',
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'medium',
      progress INTEGER NOT NULL DEFAULT 0,
      workshop TEXT,
      start_date TEXT,
      end_date TEXT,
      created_by INTEGER NOT NULL REFERENCES users(id),
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS work_stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      operator TEXT,
      current_job TEXT,
      status TEXT NOT NULL DEFAULT 'idle',
      efficiency REAL NOT NULL DEFAULT 0,
      temperature REAL NOT NULL DEFAULT 0,
      load REAL NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS process_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      work_order_id INTEGER NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      seq INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      duration INTEGER NOT NULL DEFAULT 0,
      actual_duration INTEGER NOT NULL DEFAULT 0,
      station TEXT,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS report_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      work_order_id INTEGER NOT NULL REFERENCES work_orders(id),
      station_id INTEGER REFERENCES work_stations(id),
      operator TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      defect INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS finance_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      method TEXT,
      related_order_id TEXT,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      dept TEXT,
      email TEXT,
      phone TEXT,
      salary REAL,
      status TEXT NOT NULL DEFAULT 'active',
      join_date TEXT,
      avatar TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      user TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      detail TEXT,
      ip TEXT,
      level TEXT NOT NULL DEFAULT 'info',
      duration INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS backup_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      size TEXT,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      modules TEXT,
      file_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      sender TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS approval_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      submitter TEXT NOT NULL,
      dept TEXT,
      amount REAL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'medium',
      description TEXT,
      approver_id INTEGER REFERENCES users(id),
      approved_at TEXT,
      approval_note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_id INTEGER NOT NULL REFERENCES users(id),
      to_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text',
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size TEXT,
      status TEXT NOT NULL DEFAULT 'generating',
      date TEXT,
      file_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 索引
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
    CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_items_product ON inventory_items(product_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_items_warehouse ON inventory_items(warehouse_id);
    CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
    CREATE INDEX IF NOT EXISTS idx_work_orders_dates ON work_orders(start_date, end_date);
    CREATE INDEX IF NOT EXISTS idx_operation_logs_user ON operation_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_operation_logs_module ON operation_logs(module);
    CREATE INDEX IF NOT EXISTS idx_operation_logs_created ON operation_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
    CREATE INDEX IF NOT EXISTS idx_approval_items_status ON approval_items(status);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_from ON chat_messages(from_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_to ON chat_messages(to_id);
    CREATE INDEX IF NOT EXISTS idx_finance_transactions_type ON finance_transactions(type);
    CREATE INDEX IF NOT EXISTS idx_finance_transactions_created ON finance_transactions(created_at);
  `);
}
function getSqlite() {
  if (!sqliteInstance) throw new Error("SQLite not initialized");
  return sqliteInstance;
}
const IPC_AUTH = {
  LOGIN: "auth:login",
  LOGOUT: "auth:logout",
  VALIDATE_TOKEN: "auth:validate-token",
  UNLOCK: "auth:unlock",
  GET_CURRENT_USER: "auth:get-current-user",
  CHANGE_PASSWORD: "auth:change-password",
  UPDATE_PROFILE: "auth:update-profile"
};
const IPC_DASHBOARD = {
  KPI: "dashboard:kpi",
  REVENUE_CHART: "dashboard:revenue-chart",
  RECENT_ORDERS: "dashboard:recent-orders",
  ACTIVITY_FEED: "dashboard:activity-feed",
  SYSTEM_STATUS: "dashboard:system-status"
};
const IPC_SETTINGS = {
  GET_ALL: "settings:get-all",
  GET_BY_KEY: "settings:get-by-key",
  UPDATE: "settings:update"
};
const IPC_PURCHASE = {
  LIST_ORDERS: "purchase:list-orders",
  GET_ORDER: "purchase:get-order",
  CREATE_ORDER: "purchase:create-order",
  UPDATE_ORDER: "purchase:update-order",
  APPROVE_ORDER: "purchase:approve-order",
  CONFIRM_ARRIVAL: "purchase:confirm-arrival",
  LIST_SUPPLIERS: "purchase:list-suppliers",
  GET_SUPPLIER: "purchase:get-supplier",
  CREATE_SUPPLIER: "purchase:create-supplier",
  UPDATE_SUPPLIER: "purchase:update-supplier"
};
const IPC_SALES = {
  LIST_ORDERS: "sales:list-orders",
  GET_ORDER: "sales:get-order",
  CREATE_ORDER: "sales:create-order",
  UPDATE_ORDER: "sales:update-order",
  APPROVE_ORDER: "sales:approve-order",
  LIST_CUSTOMERS: "sales:list-customers",
  GET_CUSTOMER: "sales:get-customer",
  CREATE_CUSTOMER: "sales:create-customer",
  UPDATE_CUSTOMER: "sales:update-customer"
};
const IPC_INVENTORY = {
  LIST_ITEMS: "inventory:list-items",
  GET_ITEM: "inventory:get-item",
  LIST_TRANSACTIONS: "inventory:list-transactions",
  STOCK_IN: "inventory:stock-in",
  STOCK_OUT: "inventory:stock-out",
  LIST_WAREHOUSES: "inventory:list-warehouses"
};
const IPC_PRODUCTION = {
  LIST_WORK_ORDERS: "production:list-work-orders",
  GET_WORK_ORDER: "production:get-work-order",
  CREATE_WORK_ORDER: "production:create-work-order",
  UPDATE_WORK_ORDER: "production:update-work-order",
  LIST_WORK_STATIONS: "production:list-work-stations",
  LIST_PROCESS_CARDS: "production:list-process-cards",
  SUBMIT_REPORT: "production:submit-report",
  LIST_REPORTS: "production:list-reports"
};
const IPC_FINANCE = {
  LIST_TRANSACTIONS: "finance:list-transactions",
  CREATE_TRANSACTION: "finance:create-transaction",
  GET_STATS: "finance:get-stats"
};
const IPC_HR = {
  LIST_EMPLOYEES: "hr:list-employees",
  GET_EMPLOYEE: "hr:get-employee",
  CREATE_EMPLOYEE: "hr:create-employee",
  UPDATE_EMPLOYEE: "hr:update-employee",
  LIST_DEPARTMENTS: "hr:list-departments"
};
const IPC_REPORT = {
  LIST: "report:list",
  GENERATE: "report:generate",
  DOWNLOAD: "report:download"
};
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1e3;
function getOrGenerateSecret() {
  const envSecret = process.env.TOKEN_SECRET;
  if (envSecret) return envSecret;
  const secretPath = path.join(app.getPath("userData"), ".secret");
  try {
    if (fs.existsSync(secretPath)) {
      return fs.readFileSync(secretPath, "utf-8").trim();
    }
  } catch {
  }
  const newSecret = crypto.randomBytes(32).toString("hex");
  try {
    fs.writeFileSync(secretPath, newSecret, { mode: 384 });
  } catch {
    return crypto.randomBytes(32).toString("hex");
  }
  return newSecret;
}
let _tokenSecret = null;
function getTokenSecret() {
  if (!_tokenSecret) {
    _tokenSecret = getOrGenerateSecret();
  }
  return _tokenSecret;
}
function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}
function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
function verifyPin(pin, hash) {
  return bcrypt.compareSync(pin, hash);
}
function generateToken(userId) {
  const secret = getTokenSecret();
  const payload = JSON.stringify({ userId, exp: Date.now() + TOKEN_EXPIRY });
  const iv = crypto.randomBytes(16);
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(secret, salt, 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(payload, "utf8", "hex");
  encrypted += cipher.final("hex");
  return salt.toString("hex") + ":" + iv.toString("hex") + ":" + encrypted;
}
function verifyToken(token) {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return null;
    const [saltHex, ivHex, encrypted] = parts;
    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const secret = getTokenSecret();
    const key = crypto.scryptSync(secret, salt, 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    const payload = JSON.parse(decrypted);
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
const USER_SAFE_FIELDS = "id, username, name, email, phone, avatar, bio, dept, status, join_date, last_login";
const USER_INTERNAL_FIELDS = "pin, login_attempts, locked_until";
class AuthService {
  get db() {
    return getSqlite();
  }
  async login(username, password, rememberMe) {
    try {
      const userRow = this.db.prepare(`SELECT ${USER_SAFE_FIELDS}, ${USER_INTERNAL_FIELDS}, password_hash FROM users WHERE username = ?`).get(username);
      if (!userRow) {
        return { success: false, error: { code: "AUTH_FAILED", message: "用户名或密码错误" } };
      }
      if (userRow.status === "locked") {
        const lockedUntil = new Date(userRow.locked_until);
        if (lockedUntil > /* @__PURE__ */ new Date()) {
          return { success: false, error: { code: "ACCOUNT_LOCKED", message: "账户已锁定，请30分钟后重试" } };
        }
        this.db.prepare("UPDATE users SET status = ?, login_attempts = 0, locked_until = NULL WHERE id = ?").run("active", userRow.id);
        userRow.status = "active";
        userRow.login_attempts = 0;
      }
      if (userRow.status === "disabled") {
        return { success: false, error: { code: "ACCOUNT_DISABLED", message: "账户已禁用，请联系管理员" } };
      }
      if (!verifyPassword(password, userRow.password_hash)) {
        const attempts = userRow.login_attempts + 1;
        if (attempts >= 5) {
          const lockedUntil = new Date(Date.now() + 30 * 60 * 1e3).toISOString();
          this.db.prepare("UPDATE users SET login_attempts = ?, status = ?, locked_until = ? WHERE id = ?").run(attempts, "locked", lockedUntil, userRow.id);
          return { success: false, error: { code: "ACCOUNT_LOCKED", message: "连续5次登录失败，账户已锁定30分钟" } };
        }
        this.db.prepare("UPDATE users SET login_attempts = ? WHERE id = ?").run(attempts, userRow.id);
        return { success: false, error: { code: "AUTH_FAILED", message: "用户名或密码错误" } };
      }
      this.db.prepare("UPDATE users SET login_attempts = 0, last_login = ? WHERE id = ?").run((/* @__PURE__ */ new Date()).toISOString(), userRow.id);
      const permissions2 = this.getUserPermissions(userRow.id);
      const token = rememberMe ? generateToken(userRow.id) : void 0;
      const userData = {
        id: userRow.id,
        username: userRow.username,
        name: userRow.name,
        email: userRow.email || "",
        phone: userRow.phone || "",
        avatar: userRow.avatar || "",
        bio: userRow.bio || "",
        dept: userRow.dept || "",
        status: userRow.status,
        joinDate: userRow.join_date || "",
        lastLogin: (/* @__PURE__ */ new Date()).toISOString()
      };
      return {
        success: true,
        data: { user: userData, permissions: permissions2, token }
      };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async validateToken(token) {
    try {
      const payload = verifyToken(token);
      if (!payload) {
        return { success: false, error: { code: "TOKEN_INVALID", message: "Token已过期或无效" } };
      }
      const userRow = this.db.prepare(`SELECT ${USER_SAFE_FIELDS}, ${USER_INTERNAL_FIELDS}, password_hash FROM users WHERE id = ?`).get(payload.userId);
      if (!userRow || userRow.status !== "active") {
        return { success: false, error: { code: "TOKEN_INVALID", message: "用户不存在或已禁用" } };
      }
      const permissions2 = this.getUserPermissions(userRow.id);
      const userData = {
        id: userRow.id,
        username: userRow.username,
        name: userRow.name,
        email: userRow.email || "",
        phone: userRow.phone || "",
        avatar: userRow.avatar || "",
        bio: userRow.bio || "",
        dept: userRow.dept || "",
        status: userRow.status,
        joinDate: userRow.join_date || "",
        lastLogin: userRow.last_login || ""
      };
      return { success: true, data: { user: userData, permissions: permissions2 } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async unlock(userId, pin, password) {
    try {
      const userRow = this.db.prepare(`SELECT ${USER_SAFE_FIELDS}, ${USER_INTERNAL_FIELDS}, password_hash FROM users WHERE id = ?`).get(userId);
      if (!userRow) {
        return { success: false, error: { code: "USER_NOT_FOUND", message: "用户不存在" } };
      }
      if (pin && userRow.pin) {
        if (verifyPin(pin, userRow.pin)) {
          return { success: true, data: true };
        }
        return { success: false, error: { code: "UNLOCK_FAILED", message: "PIN码错误" } };
      }
      if (password) {
        if (verifyPassword(password, userRow.password_hash)) {
          return { success: true, data: true };
        }
        return { success: false, error: { code: "UNLOCK_FAILED", message: "密码错误" } };
      }
      return { success: false, error: { code: "UNLOCK_FAILED", message: "请输入PIN码或密码" } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const userRow = this.db.prepare(`SELECT ${USER_SAFE_FIELDS}, ${USER_INTERNAL_FIELDS}, password_hash FROM users WHERE id = ?`).get(userId);
      if (!userRow) {
        return { success: false, error: { code: "USER_NOT_FOUND", message: "用户不存在" } };
      }
      if (!verifyPassword(oldPassword, userRow.password_hash)) {
        return { success: false, error: { code: "WRONG_PASSWORD", message: "当前密码不正确" } };
      }
      const newHash = hashPassword(newPassword);
      this.db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(newHash, (/* @__PURE__ */ new Date()).toISOString(), userId);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async updateProfile(userId, data) {
    try {
      const updates = [];
      const values = [];
      if (data.name !== void 0) {
        updates.push("name = ?");
        values.push(data.name);
      }
      if (data.phone !== void 0) {
        updates.push("phone = ?");
        values.push(data.phone);
      }
      if (data.bio !== void 0) {
        updates.push("bio = ?");
        values.push(data.bio);
      }
      if (data.avatar !== void 0) {
        updates.push("avatar = ?");
        values.push(data.avatar);
      }
      if (updates.length === 0) {
        return { success: true, data: true };
      }
      updates.push("updated_at = ?");
      values.push((/* @__PURE__ */ new Date()).toISOString());
      values.push(userId);
      this.db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getCurrentUser(userId) {
    try {
      const userRow = this.db.prepare(`SELECT ${USER_SAFE_FIELDS} FROM users WHERE id = ?`).get(userId);
      if (!userRow) {
        return { success: false, error: { code: "USER_NOT_FOUND", message: "用户不存在" } };
      }
      const userData = {
        id: userRow.id,
        username: userRow.username,
        name: userRow.name,
        email: userRow.email || "",
        phone: userRow.phone || "",
        avatar: userRow.avatar || "",
        bio: userRow.bio || "",
        dept: userRow.dept || "",
        status: userRow.status,
        joinDate: userRow.join_date || "",
        lastLogin: userRow.last_login || ""
      };
      return { success: true, data: userData };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  getUserPermissions(userId) {
    const rows = this.db.prepare(`
      SELECT DISTINCT p.id, p.resource, p.action
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ?
    `).all(userId);
    return rows.map((r) => ({ id: r.id, resource: r.resource, action: r.action }));
  }
}
const authService = new AuthService();
function registerAuthIpc() {
  ipcMain.handle(IPC_AUTH.LOGIN, async (_event, args) => {
    return authService.login(args.username, args.password, args.rememberMe);
  });
  ipcMain.handle(IPC_AUTH.LOGOUT, async () => {
    return { success: true };
  });
  ipcMain.handle(IPC_AUTH.VALIDATE_TOKEN, async (_event, args) => {
    return authService.validateToken(args.token);
  });
  ipcMain.handle(IPC_AUTH.UNLOCK, async (_event, args) => {
    return authService.unlock(args.userId, args.pin, args.password);
  });
  ipcMain.handle(IPC_AUTH.GET_CURRENT_USER, async (_event, args) => {
    return authService.getCurrentUser(args.userId);
  });
  ipcMain.handle(IPC_AUTH.CHANGE_PASSWORD, async (_event, args) => {
    return authService.changePassword(args.userId, args.oldPassword, args.newPassword);
  });
  ipcMain.handle(IPC_AUTH.UPDATE_PROFILE, async (_event, args) => {
    return authService.updateProfile(args.userId, args.data);
  });
}
function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }
  const totalUsed = totalTick - totalIdle;
  return Math.round(totalUsed / totalTick * 100);
}
function getMemoryUsage() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  return Math.round((totalMem - freeMem) / totalMem * 100);
}
function getUptime() {
  const seconds = Math.floor(os.uptime());
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  if (days > 0) return `${days}天 ${hours}小时`;
  if (hours > 0) return `${hours}小时 ${minutes}分钟`;
  return `${minutes}分钟`;
}
function getSystemStatus() {
  return {
    cpu: getCpuUsage(),
    memory: getMemoryUsage(),
    disk: 45,
    // 简化：磁盘使用率需要额外依赖，先用固定值
    uptime: getUptime()
  };
}
class DashboardService {
  get db() {
    return getSqlite();
  }
  async getKpi() {
    try {
      const revenueResult = this.db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as total
        FROM sales_orders
        WHERE status != 'cancelled' AND created_at >= date('now', 'start of month')
      `).get();
      const lastMonthRevenue = this.db.prepare(`
        SELECT COALESCE(SUM(total_amount), 0) as total
        FROM sales_orders
        WHERE status != 'cancelled'
        AND created_at >= date('now', 'start of month', '-1 month')
        AND created_at < date('now', 'start of month')
      `).get();
      const orderResult = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM sales_orders
        WHERE status != 'cancelled' AND created_at >= date('now', 'start of month')
      `).get();
      const lastMonthOrders = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM sales_orders
        WHERE status != 'cancelled'
        AND created_at >= date('now', 'start of month', '-1 month')
        AND created_at < date('now', 'start of month')
      `).get();
      const customerResult = this.db.prepare(`
        SELECT COUNT(DISTINCT customer_id) as count
        FROM sales_orders
        WHERE created_at >= date('now', '-30 days')
      `).get();
      const alertResult = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        WHERE ii.stock < p.min_stock
      `).get();
      const productionResult = this.db.prepare(`
        SELECT COALESCE(AVG(progress), 0) as rate
        FROM work_orders
        WHERE status IN ('in-progress', 'completed')
      `).get();
      const revenueChange = lastMonthRevenue.total > 0 ? Math.round((revenueResult.total - lastMonthRevenue.total) / lastMonthRevenue.total * 100) : 0;
      const orderChange = lastMonthOrders.count > 0 ? Math.round((orderResult.count - lastMonthOrders.count) / lastMonthOrders.count * 100) : 0;
      return {
        success: true,
        data: {
          totalRevenue: revenueResult.total,
          revenueChange,
          orderCount: orderResult.count,
          orderChange,
          activeCustomers: customerResult.count,
          customerChange: 0,
          inventoryAlerts: alertResult.count,
          productionRate: Math.round(productionResult.rate)
        }
      };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getRevenueChart(period) {
    try {
      let groupBy;
      let limit;
      switch (period) {
        case "month":
          groupBy = "%Y-%m";
          limit = 12;
          break;
        case "quarter":
          groupBy = "%Y-Q";
          limit = 8;
          break;
        case "year":
          groupBy = "%Y";
          limit = 5;
          break;
      }
      const rows = this.db.prepare(`
        SELECT strftime('${groupBy}', created_at) as label,
               COALESCE(SUM(total_amount), 0) as value
        FROM sales_orders
        WHERE status != 'cancelled'
        GROUP BY label
        ORDER BY label DESC
        LIMIT ?
      `).all(limit);
      const data = rows.reverse().map((r) => ({
        label: r.label,
        value: r.value
      }));
      return { success: true, data };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getRecentOrders() {
    try {
      const orders = this.db.prepare(`
        SELECT so.*, c.name as customer_name
        FROM sales_orders so
        JOIN customers c ON so.customer_id = c.id
        ORDER BY so.created_at DESC
        LIMIT 10
      `).all();
      return { success: true, data: orders };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getActivityFeed() {
    try {
      const activities = this.db.prepare(`
        SELECT * FROM operation_logs
        ORDER BY created_at DESC
        LIMIT 20
      `).all();
      return { success: true, data: activities };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getSystemStatus() {
    try {
      const status = getSystemStatus();
      return { success: true, data: status };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
}
const dashboardService = new DashboardService();
function registerDashboardIpc() {
  ipcMain.handle(IPC_DASHBOARD.KPI, async () => {
    return dashboardService.getKpi();
  });
  ipcMain.handle(IPC_DASHBOARD.REVENUE_CHART, async (_event, args) => {
    return dashboardService.getRevenueChart(args.period);
  });
  ipcMain.handle(IPC_DASHBOARD.RECENT_ORDERS, async () => {
    return dashboardService.getRecentOrders();
  });
  ipcMain.handle(IPC_DASHBOARD.ACTIVITY_FEED, async () => {
    return dashboardService.getActivityFeed();
  });
  ipcMain.handle(IPC_DASHBOARD.SYSTEM_STATUS, async () => {
    return dashboardService.getSystemStatus();
  });
}
class SettingsService {
  get db() {
    return getSqlite();
  }
  async getAll() {
    try {
      const rows = this.db.prepare("SELECT key, value FROM system_settings").all();
      const settings = {};
      for (const row of rows) {
        settings[row.key] = row.value;
      }
      return { success: true, data: settings };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getByKey(key) {
    try {
      const row = this.db.prepare("SELECT value FROM system_settings WHERE key = ?").get(key);
      if (!row) {
        return { success: false, error: { code: "NOT_FOUND", message: "设置项不存在" } };
      }
      return { success: true, data: row.value };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async update(key, value) {
    try {
      this.db.prepare("UPDATE system_settings SET value = ?, updated_at = ? WHERE key = ?").run(value, (/* @__PURE__ */ new Date()).toISOString(), key);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
}
const settingsService = new SettingsService();
function registerSettingsIpc() {
  ipcMain.handle(IPC_SETTINGS.GET_ALL, async () => {
    return settingsService.getAll();
  });
  ipcMain.handle(IPC_SETTINGS.GET_BY_KEY, async (_event, args) => {
    return settingsService.getByKey(args.key);
  });
  ipcMain.handle(IPC_SETTINGS.UPDATE, async (_event, args) => {
    return settingsService.update(args.key, args.value);
  });
}
class PurchaseService {
  get db() {
    return getSqlite();
  }
  async listOrders(params) {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;
      let where = "1=1";
      const values = [];
      if (params.status) {
        where += " AND po.status = ?";
        values.push(params.status);
      }
      if (params.keyword) {
        where += " AND (po.order_no LIKE ? OR s.name LIKE ?)";
        values.push(`%${params.keyword}%`, `%${params.keyword}%`);
      }
      const total = this.db.prepare(`SELECT COUNT(*) as count FROM purchase_orders po JOIN suppliers s ON po.supplier_id = s.id WHERE ${where}`).get(...values).count;
      const items = this.db.prepare(`
        SELECT po.*, s.name as supplier_name
        FROM purchase_orders po
        JOIN suppliers s ON po.supplier_id = s.id
        WHERE ${where}
        ORDER BY po.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);
      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getOrder(id) {
    try {
      const order = this.db.prepare(`
        SELECT po.*, s.name as supplier_name, s.contact as supplier_contact, s.phone as supplier_phone
        FROM purchase_orders po
        JOIN suppliers s ON po.supplier_id = s.id
        WHERE po.id = ?
      `).get(id);
      if (!order) return { success: false, error: { code: "NOT_FOUND", message: "订单不存在" } };
      const items = this.db.prepare(`
        SELECT poi.*, p.name as product_name, p.sku, p.unit
        FROM purchase_order_items poi
        JOIN products p ON poi.product_id = p.id
        WHERE poi.order_id = ?
      `).all(id);
      return { success: true, data: { ...order, items } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async createOrder(data, userId) {
    try {
      const transaction = this.db.transaction(() => {
        const count = this.db.prepare("SELECT COUNT(*) as c FROM purchase_orders").get().c;
        const orderNo = `PO-${String(count + 1).padStart(5, "0")}`;
        const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const result2 = this.db.prepare(`
          INSERT INTO purchase_orders (order_no, supplier_id, total_amount, status, created_by, note)
          VALUES (?, ?, ?, 'draft', ?, ?)
        `).run(orderNo, data.supplierId, totalAmount, userId, data.note || null);
        const orderId = result2.lastInsertRowid;
        const insertItem = this.db.prepare(`
          INSERT INTO purchase_order_items (order_id, product_id, quantity, unit_price, amount)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const item of data.items) {
          insertItem.run(orderId, item.productId, item.quantity, item.unitPrice, item.quantity * item.unitPrice);
        }
        return { id: orderId, orderNo };
      });
      const result = transaction();
      return { success: true, data: result };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async updateOrderStatus(id, status, userId) {
    try {
      const updates = ["status = ?", "updated_at = ?"];
      const values = [status, (/* @__PURE__ */ new Date()).toISOString()];
      if (status === "approved" && userId) {
        updates.push("approved_by = ?", "approved_at = ?");
        values.push(userId, (/* @__PURE__ */ new Date()).toISOString());
      }
      values.push(id);
      this.db.prepare(`UPDATE purchase_orders SET ${updates.join(", ")} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async listSuppliers(keyword) {
    try {
      let sql = "SELECT * FROM suppliers WHERE status = ?";
      const values = ["active"];
      if (keyword) {
        sql += " AND (name LIKE ? OR contact LIKE ?)";
        values.push(`%${keyword}%`, `%${keyword}%`);
      }
      sql += " ORDER BY rating DESC";
      const items = this.db.prepare(sql).all(...values);
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getSupplier(id) {
    try {
      const supplier = this.db.prepare("SELECT * FROM suppliers WHERE id = ?").get(id);
      if (!supplier) return { success: false, error: { code: "NOT_FOUND", message: "供应商不存在" } };
      return { success: true, data: supplier };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async createSupplier(data) {
    try {
      const result = this.db.prepare(`
        INSERT INTO suppliers (name, category, contact, phone, email, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(data.name, data.category || null, data.contact || null, data.phone || null, data.email || null, data.address || null);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async updateSupplier(id, data) {
    try {
      const updates = [];
      const values = [];
      if (data.name !== void 0) {
        updates.push("name = ?");
        values.push(data.name);
      }
      if (data.category !== void 0) {
        updates.push("category = ?");
        values.push(data.category);
      }
      if (data.contact !== void 0) {
        updates.push("contact = ?");
        values.push(data.contact);
      }
      if (data.phone !== void 0) {
        updates.push("phone = ?");
        values.push(data.phone);
      }
      if (data.email !== void 0) {
        updates.push("email = ?");
        values.push(data.email);
      }
      if (data.address !== void 0) {
        updates.push("address = ?");
        values.push(data.address);
      }
      if (data.rating !== void 0) {
        updates.push("rating = ?");
        values.push(data.rating);
      }
      if (data.status !== void 0) {
        updates.push("status = ?");
        values.push(data.status);
      }
      if (updates.length === 0) return { success: true, data: true };
      updates.push("updated_at = ?");
      values.push((/* @__PURE__ */ new Date()).toISOString());
      values.push(id);
      this.db.prepare(`UPDATE suppliers SET ${updates.join(", ")} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
}
const purchaseService = new PurchaseService();
function registerPurchaseIpc() {
  ipcMain.handle(IPC_PURCHASE.LIST_ORDERS, async (_event, args) => {
    return purchaseService.listOrders(args);
  });
  ipcMain.handle(IPC_PURCHASE.GET_ORDER, async (_event, args) => {
    return purchaseService.getOrder(args.id);
  });
  ipcMain.handle(IPC_PURCHASE.CREATE_ORDER, async (_event, args) => {
    return purchaseService.createOrder(args.data, args.userId);
  });
  ipcMain.handle(IPC_PURCHASE.UPDATE_ORDER, async (_event, args) => {
    return purchaseService.updateOrderStatus(args.id, args.status, args.userId);
  });
  ipcMain.handle(IPC_PURCHASE.APPROVE_ORDER, async (_event, args) => {
    return purchaseService.updateOrderStatus(args.id, "approved", args.userId);
  });
  ipcMain.handle(IPC_PURCHASE.CONFIRM_ARRIVAL, async (_event, args) => {
    return purchaseService.updateOrderStatus(args.id, "arrived");
  });
  ipcMain.handle(IPC_PURCHASE.LIST_SUPPLIERS, async (_event, args) => {
    return purchaseService.listSuppliers(args?.keyword);
  });
  ipcMain.handle(IPC_PURCHASE.GET_SUPPLIER, async (_event, args) => {
    return purchaseService.getSupplier(args.id);
  });
  ipcMain.handle(IPC_PURCHASE.CREATE_SUPPLIER, async (_event, args) => {
    return purchaseService.createSupplier(args);
  });
  ipcMain.handle(IPC_PURCHASE.UPDATE_SUPPLIER, async (_event, args) => {
    return purchaseService.updateSupplier(args.id, args.data);
  });
}
class SalesService {
  get db() {
    return getSqlite();
  }
  async listOrders(params) {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;
      let where = "1=1";
      const values = [];
      if (params.status) {
        where += " AND so.status = ?";
        values.push(params.status);
      }
      if (params.keyword) {
        where += " AND (so.order_no LIKE ? OR c.name LIKE ?)";
        values.push(`%${params.keyword}%`, `%${params.keyword}%`);
      }
      const total = this.db.prepare(`SELECT COUNT(*) as count FROM sales_orders so JOIN customers c ON so.customer_id = c.id WHERE ${where}`).get(...values).count;
      const items = this.db.prepare(`
        SELECT so.*, c.name as customer_name
        FROM sales_orders so
        JOIN customers c ON so.customer_id = c.id
        WHERE ${where}
        ORDER BY so.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);
      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getOrder(id) {
    try {
      const order = this.db.prepare(`
        SELECT so.*, c.name as customer_name, c.contact as customer_contact, c.phone as customer_phone
        FROM sales_orders so
        JOIN customers c ON so.customer_id = c.id
        WHERE so.id = ?
      `).get(id);
      if (!order) return { success: false, error: { code: "NOT_FOUND", message: "订单不存在" } };
      const items = this.db.prepare(`
        SELECT soi.*, p.name as product_name, p.sku, p.unit
        FROM sales_order_items soi
        JOIN products p ON soi.product_id = p.id
        WHERE soi.order_id = ?
      `).all(id);
      return { success: true, data: { ...order, items } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async createOrder(data, userId) {
    try {
      const transaction = this.db.transaction(() => {
        const count = this.db.prepare("SELECT COUNT(*) as c FROM sales_orders").get().c;
        const orderNo = `SO-${String(count + 1).padStart(5, "0")}`;
        const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const result2 = this.db.prepare(`
          INSERT INTO sales_orders (order_no, customer_id, total_amount, status, created_by, note)
          VALUES (?, ?, ?, 'draft', ?, ?)
        `).run(orderNo, data.customerId, totalAmount, userId, data.note || null);
        const orderId = result2.lastInsertRowid;
        const insertItem = this.db.prepare(`
          INSERT INTO sales_order_items (order_id, product_id, quantity, unit_price, amount)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const item of data.items) {
          insertItem.run(orderId, item.productId, item.quantity, item.unitPrice, item.quantity * item.unitPrice);
        }
        return { id: orderId, orderNo };
      });
      const result = transaction();
      return { success: true, data: result };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async updateOrderStatus(id, status, userId) {
    try {
      const updates = ["status = ?", "updated_at = ?"];
      const values = [status, (/* @__PURE__ */ new Date()).toISOString()];
      if (status === "approved" && userId) {
        updates.push("approved_by = ?", "approved_at = ?");
        values.push(userId, (/* @__PURE__ */ new Date()).toISOString());
      }
      values.push(id);
      this.db.prepare(`UPDATE sales_orders SET ${updates.join(", ")} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async listCustomers(params) {
    try {
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const offset = (page - 1) * pageSize;
      let where = "status = ?";
      const values = ["active"];
      if (params?.keyword) {
        where += " AND (name LIKE ? OR contact LIKE ?)";
        values.push(`%${params.keyword}%`, `%${params.keyword}%`);
      }
      const total = this.db.prepare(`SELECT COUNT(*) as count FROM customers WHERE ${where}`).get(...values).count;
      const items = this.db.prepare(`
        SELECT * FROM customers WHERE ${where}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);
      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getCustomer(id) {
    try {
      const customer = this.db.prepare("SELECT * FROM customers WHERE id = ?").get(id);
      if (!customer) return { success: false, error: { code: "NOT_FOUND", message: "客户不存在" } };
      return { success: true, data: customer };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async createCustomer(data) {
    try {
      const result = this.db.prepare(`
        INSERT INTO customers (name, tier, contact, phone, email, address, credit_limit)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(data.name, data.tier || "normal", data.contact || null, data.phone || null, data.email || null, data.address || null, data.creditLimit || 0);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async updateCustomer(id, data) {
    try {
      const updates = [];
      const values = [];
      if (data.name !== void 0) {
        updates.push("name = ?");
        values.push(data.name);
      }
      if (data.tier !== void 0) {
        updates.push("tier = ?");
        values.push(data.tier);
      }
      if (data.contact !== void 0) {
        updates.push("contact = ?");
        values.push(data.contact);
      }
      if (data.phone !== void 0) {
        updates.push("phone = ?");
        values.push(data.phone);
      }
      if (data.email !== void 0) {
        updates.push("email = ?");
        values.push(data.email);
      }
      if (data.address !== void 0) {
        updates.push("address = ?");
        values.push(data.address);
      }
      if (data.creditLimit !== void 0) {
        updates.push("credit_limit = ?");
        values.push(data.creditLimit);
      }
      if (data.status !== void 0) {
        updates.push("status = ?");
        values.push(data.status);
      }
      if (updates.length === 0) return { success: true, data: true };
      updates.push("updated_at = ?");
      values.push((/* @__PURE__ */ new Date()).toISOString());
      values.push(id);
      this.db.prepare(`UPDATE customers SET ${updates.join(", ")} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getSalesStats() {
    try {
      const now = /* @__PURE__ */ new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const salesAmount = this.db.prepare(
        `SELECT COALESCE(SUM(total_amount), 0) as total FROM sales_orders WHERE status != 'draft' AND created_at >= ?`
      ).get(monthStart).total;
      const orderCount = this.db.prepare(
        `SELECT COUNT(*) as count FROM sales_orders WHERE status != 'draft' AND created_at >= ?`
      ).get(monthStart).count;
      const customerCount = this.db.prepare(
        `SELECT COUNT(DISTINCT customer_id) as count FROM sales_orders WHERE status != 'draft' AND created_at >= ?`
      ).get(monthStart).count;
      return { success: true, data: { monthSalesAmount: salesAmount, monthOrderCount: orderCount, monthCustomerCount: customerCount } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
}
const salesService = new SalesService();
function registerSalesIpc() {
  ipcMain.handle(IPC_SALES.LIST_ORDERS, async (_event, args) => {
    return salesService.listOrders(args);
  });
  ipcMain.handle(IPC_SALES.GET_ORDER, async (_event, args) => {
    return salesService.getOrder(args.id);
  });
  ipcMain.handle(IPC_SALES.CREATE_ORDER, async (_event, args) => {
    return salesService.createOrder(args.data, args.userId);
  });
  ipcMain.handle(IPC_SALES.UPDATE_ORDER, async (_event, args) => {
    return salesService.updateOrderStatus(args.id, args.status, args.userId);
  });
  ipcMain.handle(IPC_SALES.APPROVE_ORDER, async (_event, args) => {
    return salesService.updateOrderStatus(args.id, "approved", args.userId);
  });
  ipcMain.handle(IPC_SALES.LIST_CUSTOMERS, async (_event, args) => {
    return salesService.listCustomers(args);
  });
  ipcMain.handle(IPC_SALES.GET_CUSTOMER, async (_event, args) => {
    return salesService.getCustomer(args.id);
  });
  ipcMain.handle(IPC_SALES.CREATE_CUSTOMER, async (_event, args) => {
    return salesService.createCustomer(args);
  });
  ipcMain.handle(IPC_SALES.UPDATE_CUSTOMER, async (_event, args) => {
    return salesService.updateCustomer(args.id, args.data);
  });
}
class InventoryService {
  get db() {
    return getSqlite();
  }
  async listItems(params) {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;
      let where = "1=1";
      const values = [];
      if (params.warehouseId) {
        where += " AND ii.warehouse_id = ?";
        values.push(params.warehouseId);
      }
      if (params.keyword) {
        where += " AND (p.name LIKE ? OR p.sku LIKE ?)";
        values.push(`%${params.keyword}%`, `%${params.keyword}%`);
      }
      const total = this.db.prepare(`
        SELECT COUNT(*) as count FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        JOIN warehouses w ON ii.warehouse_id = w.id
        WHERE ${where}
      `).get(...values).count;
      const items = this.db.prepare(`
        SELECT ii.*, p.name as product_name, p.sku, p.unit, p.min_stock, w.name as warehouse_name
        FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        JOIN warehouses w ON ii.warehouse_id = w.id
        WHERE ${where}
        ORDER BY ii.updated_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);
      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getItem(id) {
    try {
      const item = this.db.prepare(`
        SELECT ii.*, p.name as product_name, p.sku, p.unit, p.min_stock, w.name as warehouse_name
        FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        JOIN warehouses w ON ii.warehouse_id = w.id
        WHERE ii.id = ?
      `).get(id);
      if (!item) return { success: false, error: { code: "NOT_FOUND", message: "库存记录不存在" } };
      return { success: true, data: item };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async listTransactions(params) {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;
      let where = "1=1";
      const values = [];
      if (params.type) {
        where += " AND it.type = ?";
        values.push(params.type);
      }
      if (params.productId) {
        where += " AND it.product_id = ?";
        values.push(params.productId);
      }
      if (params.warehouseId) {
        where += " AND it.warehouse_id = ?";
        values.push(params.warehouseId);
      }
      const total = this.db.prepare(`
        SELECT COUNT(*) as count FROM inventory_transactions it
        WHERE ${where}
      `).get(...values).count;
      const items = this.db.prepare(`
        SELECT it.*, p.name as product_name, p.sku, w.name as warehouse_name
        FROM inventory_transactions it
        LEFT JOIN products p ON it.product_id = p.id
        LEFT JOIN warehouses w ON it.warehouse_id = w.id
        WHERE ${where}
        ORDER BY it.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);
      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async stockIn(data) {
    try {
      const transaction = this.db.transaction(() => {
        const existing = this.db.prepare(
          "SELECT * FROM inventory_items WHERE product_id = ? AND warehouse_id = ?"
        ).get(data.productId, data.warehouseId);
        let inventoryId;
        if (existing) {
          this.db.prepare(
            "UPDATE inventory_items SET stock = stock + ?, updated_at = ? WHERE id = ?"
          ).run(data.quantity, (/* @__PURE__ */ new Date()).toISOString(), existing.id);
          inventoryId = existing.id;
        } else {
          const result2 = this.db.prepare(
            "INSERT INTO inventory_items (product_id, warehouse_id, stock, updated_at) VALUES (?, ?, ?, ?)"
          ).run(data.productId, data.warehouseId, data.quantity, (/* @__PURE__ */ new Date()).toISOString());
          inventoryId = Number(result2.lastInsertRowid);
        }
        this.db.prepare(`
          INSERT INTO inventory_transactions (type, product_id, warehouse_id, quantity, related_order_id, operator_id, note)
          VALUES ('in', ?, ?, ?, ?, ?, ?)
        `).run(data.productId, data.warehouseId, data.quantity, data.relatedOrderId || null, data.operatorId, data.note || null);
        return { id: inventoryId };
      });
      const result = transaction();
      return { success: true, data: result };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async stockOut(data) {
    try {
      const transaction = this.db.transaction(() => {
        const existing = this.db.prepare(
          "SELECT * FROM inventory_items WHERE product_id = ? AND warehouse_id = ?"
        ).get(data.productId, data.warehouseId);
        if (!existing) {
          throw new Error("INSUFFICIENT_STOCK");
        }
        if (existing.stock < data.quantity) {
          throw new Error("INSUFFICIENT_STOCK");
        }
        this.db.prepare(
          "UPDATE inventory_items SET stock = stock - ?, updated_at = ? WHERE id = ?"
        ).run(data.quantity, (/* @__PURE__ */ new Date()).toISOString(), existing.id);
        this.db.prepare(`
          INSERT INTO inventory_transactions (type, product_id, warehouse_id, quantity, related_order_id, operator_id, note)
          VALUES ('out', ?, ?, ?, ?, ?, ?)
        `).run(data.productId, data.warehouseId, data.quantity, data.relatedOrderId || null, data.operatorId, data.note || null);
        return { id: existing.id };
      });
      const result = transaction();
      return { success: true, data: result };
    } catch (err) {
      if (err?.message === "INSUFFICIENT_STOCK") {
        return { success: false, error: { code: "INSUFFICIENT_STOCK", message: "库存不足" } };
      }
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async listWarehouses() {
    try {
      const items = this.db.prepare("SELECT * FROM warehouses WHERE status = ? ORDER BY created_at DESC").all("active");
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getInventoryStats() {
    try {
      const now = /* @__PURE__ */ new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const totalStock = this.db.prepare(
        "SELECT COALESCE(SUM(stock), 0) as total FROM inventory_items"
      ).get().total;
      const lowStockCount = this.db.prepare(`
        SELECT COUNT(*) as count FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        WHERE ii.stock <= p.min_stock
      `).get().count;
      const monthStockIn = this.db.prepare(
        `SELECT COALESCE(SUM(quantity), 0) as total FROM inventory_transactions WHERE type = 'in' AND created_at >= ?`
      ).get(monthStart).total;
      const monthStockOut = this.db.prepare(
        `SELECT COALESCE(SUM(quantity), 0) as total FROM inventory_transactions WHERE type = 'out' AND created_at >= ?`
      ).get(monthStart).total;
      return { success: true, data: { totalStock, lowStockCount, monthStockIn, monthStockOut } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
}
const inventoryService = new InventoryService();
function registerInventoryIpc() {
  ipcMain.handle(IPC_INVENTORY.LIST_ITEMS, async (_event, args) => {
    return inventoryService.listItems(args);
  });
  ipcMain.handle(IPC_INVENTORY.GET_ITEM, async (_event, args) => {
    return inventoryService.getItem(args.id);
  });
  ipcMain.handle(IPC_INVENTORY.LIST_TRANSACTIONS, async (_event, args) => {
    return inventoryService.listTransactions(args);
  });
  ipcMain.handle(IPC_INVENTORY.STOCK_IN, async (_event, args) => {
    return inventoryService.stockIn(args);
  });
  ipcMain.handle(IPC_INVENTORY.STOCK_OUT, async (_event, args) => {
    return inventoryService.stockOut(args);
  });
  ipcMain.handle(IPC_INVENTORY.LIST_WAREHOUSES, async () => {
    return inventoryService.listWarehouses();
  });
}
class ProductionService {
  get db() {
    return getSqlite();
  }
  async listWorkOrders(params) {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;
      let where = "1=1";
      const values = [];
      if (params.status) {
        where += " AND wo.status = ?";
        values.push(params.status);
      }
      if (params.keyword) {
        where += " AND (wo.order_no LIKE ? OR wo.name LIKE ? OR p.name LIKE ?)";
        values.push(`%${params.keyword}%`, `%${params.keyword}%`, `%${params.keyword}%`);
      }
      const total = this.db.prepare(`
        SELECT COUNT(*) as count FROM work_orders wo
        JOIN products p ON wo.product_id = p.id
        WHERE ${where}
      `).get(...values).count;
      const items = this.db.prepare(`
        SELECT wo.*, p.name as product_name
        FROM work_orders wo
        JOIN products p ON wo.product_id = p.id
        WHERE ${where}
        ORDER BY wo.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);
      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getWorkOrder(id) {
    try {
      const order = this.db.prepare(`
        SELECT wo.*, p.name as product_name, p.sku, p.unit
        FROM work_orders wo
        JOIN products p ON wo.product_id = p.id
        WHERE wo.id = ?
      `).get(id);
      if (!order) return { success: false, error: { code: "NOT_FOUND", message: "工单不存在" } };
      const processCards2 = this.db.prepare(
        "SELECT * FROM process_cards WHERE work_order_id = ? ORDER BY seq"
      ).all(id);
      const reports2 = this.db.prepare(`
        SELECT rr.*, ws.name as station_name
        FROM report_records rr
        LEFT JOIN work_stations ws ON rr.station_id = ws.id
        WHERE rr.work_order_id = ?
        ORDER BY rr.created_at DESC
      `).all(id);
      return { success: true, data: { ...order, processCards: processCards2, reports: reports2 } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async createWorkOrder(data, userId) {
    try {
      const transaction = this.db.transaction(() => {
        const count = this.db.prepare("SELECT COUNT(*) as c FROM work_orders").get().c;
        const orderNo = `WO-${String(count + 1).padStart(5, "0")}`;
        const result2 = this.db.prepare(`
          INSERT INTO work_orders (order_no, name, product_id, quantity, unit, status, priority, workshop, start_date, end_date, created_by, note)
          VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
        `).run(orderNo, data.name, data.productId, data.quantity, data.unit || "个", data.priority || "medium", data.workshop || null, data.startDate || null, data.endDate || null, userId, data.note || null);
        return { id: result2.lastInsertRowid, orderNo };
      });
      const result = transaction();
      return { success: true, data: result };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async updateWorkOrder(id, data) {
    try {
      const updates = [];
      const values = [];
      if (data.status !== void 0) {
        updates.push("status = ?");
        values.push(data.status);
      }
      if (data.progress !== void 0) {
        updates.push("progress = ?");
        values.push(data.progress);
      }
      if (data.name !== void 0) {
        updates.push("name = ?");
        values.push(data.name);
      }
      if (data.priority !== void 0) {
        updates.push("priority = ?");
        values.push(data.priority);
      }
      if (data.workshop !== void 0) {
        updates.push("workshop = ?");
        values.push(data.workshop);
      }
      if (data.startDate !== void 0) {
        updates.push("start_date = ?");
        values.push(data.startDate);
      }
      if (data.endDate !== void 0) {
        updates.push("end_date = ?");
        values.push(data.endDate);
      }
      if (data.note !== void 0) {
        updates.push("note = ?");
        values.push(data.note);
      }
      if (updates.length === 0) return { success: true, data: true };
      updates.push("updated_at = ?");
      values.push((/* @__PURE__ */ new Date()).toISOString());
      values.push(id);
      this.db.prepare(`UPDATE work_orders SET ${updates.join(", ")} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async listWorkStations() {
    try {
      const items = this.db.prepare("SELECT * FROM work_stations ORDER BY name").all();
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async listProcessCards(workOrderId) {
    try {
      const items = this.db.prepare(
        "SELECT * FROM process_cards WHERE work_order_id = ? ORDER BY seq"
      ).all(workOrderId);
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async submitReport(data) {
    try {
      const result = this.db.prepare(`
        INSERT INTO report_records (work_order_id, station_id, operator, quantity, defect, note)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(data.workOrderId, data.stationId || null, data.operator, data.quantity, data.defect || 0, data.note || null);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async listReports(workOrderId) {
    try {
      const items = this.db.prepare(`
        SELECT rr.*, ws.name as station_name
        FROM report_records rr
        LEFT JOIN work_stations ws ON rr.station_id = ws.id
        WHERE rr.work_order_id = ?
        ORDER BY rr.created_at DESC
      `).all(workOrderId);
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getProductionStats() {
    try {
      const inProgressCount = this.db.prepare(
        "SELECT COUNT(*) as count FROM work_orders WHERE status = 'in-progress'"
      ).get().count;
      const completedCount = this.db.prepare(
        "SELECT COUNT(*) as count FROM work_orders WHERE status = 'completed'"
      ).get().count;
      const totalCount = this.db.prepare(
        "SELECT COUNT(*) as count FROM work_orders"
      ).get().count;
      const completionRate = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;
      const stationStats = this.db.prepare(
        "SELECT status, COUNT(*) as count FROM work_stations GROUP BY status"
      ).all();
      const runningStations = stationStats.find((s) => s.status === "running")?.count || 0;
      const totalStations = stationStats.reduce((sum, s) => sum + s.count, 0);
      const utilizationRate = totalStations > 0 ? Math.round(runningStations / totalStations * 100) : 0;
      return { success: true, data: { inProgressCount, completionRate, utilizationRate } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
}
const productionService = new ProductionService();
function registerProductionIpc() {
  ipcMain.handle(IPC_PRODUCTION.LIST_WORK_ORDERS, async (_event, args) => {
    return productionService.listWorkOrders(args);
  });
  ipcMain.handle(IPC_PRODUCTION.GET_WORK_ORDER, async (_event, args) => {
    return productionService.getWorkOrder(args.id);
  });
  ipcMain.handle(IPC_PRODUCTION.CREATE_WORK_ORDER, async (_event, args) => {
    return productionService.createWorkOrder(args.data, args.userId);
  });
  ipcMain.handle(IPC_PRODUCTION.UPDATE_WORK_ORDER, async (_event, args) => {
    return productionService.updateWorkOrder(args.id, args.data);
  });
  ipcMain.handle(IPC_PRODUCTION.LIST_WORK_STATIONS, async () => {
    return productionService.listWorkStations();
  });
  ipcMain.handle(IPC_PRODUCTION.LIST_PROCESS_CARDS, async (_event, args) => {
    return productionService.listProcessCards(args.workOrderId);
  });
  ipcMain.handle(IPC_PRODUCTION.SUBMIT_REPORT, async (_event, args) => {
    return productionService.submitReport(args);
  });
  ipcMain.handle(IPC_PRODUCTION.LIST_REPORTS, async (_event, args) => {
    return productionService.listReports(args.workOrderId);
  });
}
class FinanceService {
  get db() {
    return getSqlite();
  }
  async listTransactions(params) {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;
      let where = "1=1";
      const values = [];
      if (params.type) {
        where += " AND ft.type = ?";
        values.push(params.type);
      }
      const total = this.db.prepare(`SELECT COUNT(*) as count FROM finance_transactions ft WHERE ${where}`).get(...values).count;
      const items = this.db.prepare(`
        SELECT ft.*, u.name as created_by_name
        FROM finance_transactions ft
        LEFT JOIN users u ON ft.created_by = u.id
        WHERE ${where}
        ORDER BY ft.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);
      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async createTransaction(data, userId) {
    try {
      const result = this.db.prepare(`
        INSERT INTO finance_transactions (type, amount, description, method, related_order_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(data.type, data.amount, data.description || null, data.method || null, data.relatedOrderId || null, userId);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getStats() {
    try {
      const now = /* @__PURE__ */ new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const totalIncome = this.db.prepare(
        `SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions WHERE type = 'income' AND created_at >= ?`
      ).get(monthStart).total;
      const totalExpense = this.db.prepare(
        `SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions WHERE type = 'expense' AND created_at >= ?`
      ).get(monthStart).total;
      const cashBalance = this.db.prepare(
        `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as total FROM finance_transactions`
      ).get().total;
      const receivable = this.db.prepare(
        `SELECT COALESCE(SUM(so.total_amount), 0) as total FROM sales_orders so WHERE so.status = 'approved'`
      ).get().total;
      return {
        success: true,
        data: {
          cashBalance,
          monthIncome: totalIncome,
          monthExpense: totalExpense,
          netProfit: totalIncome - totalExpense,
          receivable
        }
      };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
}
const financeService = new FinanceService();
function registerFinanceIpc() {
  ipcMain.handle(IPC_FINANCE.LIST_TRANSACTIONS, async (_event, args) => {
    return financeService.listTransactions(args);
  });
  ipcMain.handle(IPC_FINANCE.CREATE_TRANSACTION, async (_event, args) => {
    return financeService.createTransaction(args.data, args.userId);
  });
  ipcMain.handle(IPC_FINANCE.GET_STATS, async () => {
    return financeService.getStats();
  });
}
class HrService {
  get db() {
    return getSqlite();
  }
  async listEmployees(params) {
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const offset = (page - 1) * pageSize;
      let where = "1=1";
      const values = [];
      if (params.dept) {
        where += " AND e.dept = ?";
        values.push(params.dept);
      }
      if (params.keyword) {
        where += " AND (e.name LIKE ? OR e.role LIKE ?)";
        values.push(`%${params.keyword}%`, `%${params.keyword}%`);
      }
      const total = this.db.prepare(`SELECT COUNT(*) as count FROM employees e WHERE ${where}`).get(...values).count;
      const items = this.db.prepare(`
        SELECT e.*, d.description as dept_description
        FROM employees e
        LEFT JOIN departments d ON e.dept = d.name
        WHERE ${where}
        ORDER BY e.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...values, pageSize, offset);
      return { success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async getEmployee(id) {
    try {
      const employee = this.db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
      if (!employee) return { success: false, error: { code: "NOT_FOUND", message: "员工不存在" } };
      return { success: true, data: employee };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async createEmployee(data) {
    try {
      const result = this.db.prepare(`
        INSERT INTO employees (name, role, dept, email, phone, salary, status, join_date, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(data.name, data.role || null, data.dept || null, data.email || null, data.phone || null, data.salary || null, data.status || "active", data.joinDate || null, data.avatar || null);
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async updateEmployee(id, data) {
    try {
      const updates = [];
      const values = [];
      if (data.name !== void 0) {
        updates.push("name = ?");
        values.push(data.name);
      }
      if (data.role !== void 0) {
        updates.push("role = ?");
        values.push(data.role);
      }
      if (data.dept !== void 0) {
        updates.push("dept = ?");
        values.push(data.dept);
      }
      if (data.email !== void 0) {
        updates.push("email = ?");
        values.push(data.email);
      }
      if (data.phone !== void 0) {
        updates.push("phone = ?");
        values.push(data.phone);
      }
      if (data.salary !== void 0) {
        updates.push("salary = ?");
        values.push(data.salary);
      }
      if (data.status !== void 0) {
        updates.push("status = ?");
        values.push(data.status);
      }
      if (data.joinDate !== void 0) {
        updates.push("join_date = ?");
        values.push(data.joinDate);
      }
      if (data.avatar !== void 0) {
        updates.push("avatar = ?");
        values.push(data.avatar);
      }
      if (updates.length === 0) return { success: true, data: true };
      updates.push("updated_at = ?");
      values.push((/* @__PURE__ */ new Date()).toISOString());
      values.push(id);
      this.db.prepare(`UPDATE employees SET ${updates.join(", ")} WHERE id = ?`).run(...values);
      return { success: true, data: true };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async listDepartments() {
    try {
      const items = this.db.prepare("SELECT * FROM departments ORDER BY name").all();
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
}
const hrService = new HrService();
function registerHrIpc() {
  ipcMain.handle(IPC_HR.LIST_EMPLOYEES, async (_event, args) => {
    return hrService.listEmployees(args);
  });
  ipcMain.handle(IPC_HR.GET_EMPLOYEE, async (_event, args) => {
    return hrService.getEmployee(args.id);
  });
  ipcMain.handle(IPC_HR.CREATE_EMPLOYEE, async (_event, args) => {
    return hrService.createEmployee(args);
  });
  ipcMain.handle(IPC_HR.UPDATE_EMPLOYEE, async (_event, args) => {
    return hrService.updateEmployee(args.id, args.data);
  });
  ipcMain.handle(IPC_HR.LIST_DEPARTMENTS, async () => {
    return hrService.listDepartments();
  });
}
class ReportService {
  get db() {
    return getSqlite();
  }
  async listReports(params) {
    try {
      let sql = "SELECT * FROM reports WHERE 1=1";
      const values = [];
      if (params?.type) {
        sql += " AND type = ?";
        values.push(params.type);
      }
      sql += " ORDER BY created_at DESC";
      const items = this.db.prepare(sql).all(...values);
      return { success: true, data: items };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
  async generateReport(data) {
    try {
      const result = this.db.prepare(`
        INSERT INTO reports (name, type, size, status, date)
        VALUES (?, ?, ?, 'generating', ?)
      `).run(data.name, data.type, "0 KB", (/* @__PURE__ */ new Date()).toISOString());
      return { success: true, data: { id: result.lastInsertRowid } };
    } catch {
      return { success: false, error: { code: "SYSTEM_ERROR", message: "系统异常，请稍后重试" } };
    }
  }
}
const reportService = new ReportService();
function registerReportIpc() {
  ipcMain.handle(IPC_REPORT.LIST, async (_event, args) => {
    return reportService.listReports(args);
  });
  ipcMain.handle(IPC_REPORT.GENERATE, async (_event, args) => {
    return reportService.generateReport(args);
  });
  ipcMain.handle(IPC_REPORT.DOWNLOAD, async (_event, _args) => {
    return { success: false, error: { code: "NOT_IMPLEMENTED", message: "下载功能开发中" } };
  });
}
function registerIpcHandlers() {
  registerAuthIpc();
  registerDashboardIpc();
  registerSettingsIpc();
  registerPurchaseIpc();
  registerSalesIpc();
  registerInventoryIpc();
  registerProductionIpc();
  registerFinanceIpc();
  registerHrIpc();
  registerReportIpc();
}
let mainWindow = null;
app.commandLine.appendSwitch("disable-gpu-sandbox");
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    show: false,
    title: "NEXUS ERP",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      // better-sqlite3 需要
      preload: path.join(__dirname, "../preload/index.js")
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.webContents.on("will-navigate", (event) => {
    event.preventDefault();
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
app.whenReady().then(async () => {
  const dbPath = path.join(app.getPath("userData"), "nexus-erp.db");
  initDatabase(dbPath);
  registerIpcHandlers();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
