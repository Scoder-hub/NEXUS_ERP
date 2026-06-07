import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { seedInitialData } from './seed/initial-data';

let dbInstance: ReturnType<typeof drizzle> | null = null;
let sqliteInstance: Database.Database | null = null;

export function initDatabase(dbPath: string) {
  sqliteInstance = new Database(dbPath);
  sqliteInstance.pragma('journal_mode = WAL');
  sqliteInstance.pragma('foreign_keys = ON');
  sqliteInstance.pragma('synchronous = NORMAL');
  sqliteInstance.pragma('cache_size = -64000');
  sqliteInstance.pragma('busy_timeout = 5000');

  dbInstance = drizzle(sqliteInstance, { schema });

  // 创建表（使用 Drizzle push 方式，开发阶段）
  createTables();

  // 检查是否需要种子数据
  const userCount = sqliteInstance.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedInitialData(sqliteInstance);
  }
}

function createTables() {
  if (!sqliteInstance) throw new Error('SQLite not initialized');

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

export function getDb() {
  if (!dbInstance) throw new Error('Database not initialized');
  return dbInstance;
}

export function getSqlite() {
  if (!sqliteInstance) throw new Error('SQLite not initialized');
  return sqliteInstance;
}
