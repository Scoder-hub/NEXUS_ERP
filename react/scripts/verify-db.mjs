/**
 * 数据库初始化验证脚本
 * 验证：表创建、种子数据加载、数据完整性
 */
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync, rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 测试用临时数据库路径
const DB_PATH = join(__dirname, '..', 'test-verify-db.sqlite');

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName, detail = '') {
  if (condition) {
    passed++;
    results.push(`  ✅ ${testName}${detail ? ' — ' + detail : ''}`);
  } else {
    failed++;
    results.push(`  ❌ ${testName}${detail ? ' — ' + detail : ''}`);
  }
}

try {
  // 清理旧测试数据库
  if (existsSync(DB_PATH)) rmSync(DB_PATH);

  // === 1. 创建数据库连接 ===
  console.log('\n📦 数据库初始化验证');
  console.log('='.repeat(60));

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  assert(true, '数据库连接创建成功');

  // === 2. 创建所有表（复制自 src/db/index.ts 的 createTables） ===
  db.exec(`
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
  `);

  assert(true, '所有表创建成功');

  // === 3. 验证所有表存在 ===
  console.log('\n📋 验证表存在性...');
  const expectedTables = [
    'users', 'roles', 'permissions', 'role_permissions', 'user_roles',
    'departments', 'suppliers', 'products', 'purchase_orders', 'purchase_order_items',
    'customers', 'sales_orders', 'sales_order_items', 'warehouses', 'inventory_items',
    'inventory_transactions', 'work_orders', 'work_stations', 'process_cards',
    'report_records', 'finance_transactions', 'employees', 'operation_logs',
    'backup_records', 'notifications', 'approval_items', 'chat_messages',
    'reports', 'system_settings'
  ];

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(r => r.name);
  for (const t of expectedTables) {
    assert(tables.includes(t), `表 ${t} 存在`);
  }
  assert(tables.length >= expectedTables.length, `表数量验证`, `预期≥${expectedTables.length}，实际=${tables.length}`);

  // === 4. 加载种子数据 ===
  console.log('\n🌱 验证种子数据...');

  // 角色
  db.prepare(`
    INSERT INTO roles (name, description, is_system) VALUES
    ('超级管理员', '系统最高权限角色', 1),
    ('管理员', '系统管理角色', 1),
    ('部门主管', '部门管理角色', 1),
    ('普通员工', '基础操作角色', 1),
    ('访客', '只读访问角色', 1)
  `).run();

  const roleCount = db.prepare('SELECT COUNT(*) as count FROM roles').get().count;
  assert(roleCount === 5, '角色种子数据', `数量=${roleCount}`);

  // 权限
  const resources = [
    'dashboard', 'purchase', 'supplier', 'sales', 'customer',
    'inventory', 'warehouse', 'production', 'work-station',
    'finance', 'hr', 'employee', 'report', 'notification',
    'approval', 'message', 'log', 'backup', 'settings', 'profile',
  ];
  const actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
  const insertPerm = db.prepare('INSERT INTO permissions (resource, action) VALUES (?, ?)');
  for (const resource of resources) {
    for (const action of actions) {
      insertPerm.run(resource, action);
    }
  }
  const permCount = db.prepare('SELECT COUNT(*) as count FROM permissions').get().count;
  assert(permCount === resources.length * actions.length, '权限种子数据', `数量=${permCount}，预期=${resources.length * actions.length}`);

  // 超级管理员权限分配
  const allPerms = db.prepare('SELECT id FROM permissions').all();
  const insertRolePerm = db.prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, ?)');
  for (const perm of allPerms) {
    insertRolePerm.run(perm.id);
  }
  const rolePermCount = db.prepare('SELECT COUNT(*) as count FROM role_permissions').get().count;
  assert(rolePermCount === permCount, '超级管理员权限分配', `数量=${rolePermCount}`);

  // 管理员用户
  const passwordHash = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (username, password_hash, name, email, status)
    VALUES ('admin', ?, '系统管理员', 'admin@porcelain-erp.com', 'active')
  `).run(passwordHash);

  const adminUser = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  assert(adminUser !== undefined, '管理员用户存在');
  assert(adminUser.name === '系统管理员', '管理员用户名正确', adminUser.name);
  assert(adminUser.status === 'active', '管理员状态为 active');

  // 验证密码哈希
  const passwordValid = bcrypt.compareSync('admin123', adminUser.password_hash);
  assert(passwordValid, '管理员密码哈希验证', 'admin123 可正确验证');

  const wrongPasswordValid = bcrypt.compareSync('wrongpassword', adminUser.password_hash);
  assert(!wrongPasswordValid, '错误密码验证失败', '错误密码不应通过验证');

  // 用户角色分配
  db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)').run();
  const userRoleCount = db.prepare('SELECT COUNT(*) as count FROM user_roles WHERE user_id = 1').get().count;
  assert(userRoleCount === 1, '管理员角色分配', `数量=${userRoleCount}`);

  // 部门
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
  const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get().count;
  assert(deptCount === 7, '部门种子数据', `数量=${deptCount}`);

  // 仓库
  db.prepare(`
    INSERT INTO warehouses (name, area, status) VALUES
    ('A 仓库', 1200, 'active'),
    ('B 仓库', 800, 'active'),
    ('C 仓库', 600, 'active')
  `).run();
  const whCount = db.prepare('SELECT COUNT(*) as count FROM warehouses').get().count;
  assert(whCount === 3, '仓库种子数据', `数量=${whCount}`);

  // 系统设置
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
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM system_settings').get().count;
  assert(settingsCount === 8, '系统设置种子数据', `数量=${settingsCount}`);

  // 产品
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
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  assert(prodCount === 8, '产品种子数据', `数量=${prodCount}`);

  // 供应商
  db.prepare(`
    INSERT INTO suppliers (name, category, contact, phone, rating, status) VALUES
    ('景德镇原料厂', '原料', '张三', '13800001111', 4.5, 'active'),
    ('宜兴陶土供应', '原料', '李四', '13800002222', 4.2, 'active'),
    ('佛山釉料公司', '釉料', '王五', '13800003333', 4.8, 'active'),
    ('淄博耐火材料', '辅料', '赵六', '13800004444', 3.9, 'active')
  `).run();
  const suppCount = db.prepare('SELECT COUNT(*) as count FROM suppliers').get().count;
  assert(suppCount === 4, '供应商种子数据', `数量=${suppCount}`);

  // 客户
  db.prepare(`
    INSERT INTO customers (name, tier, contact, phone, credit_limit, status) VALUES
    ('华美陶瓷商城', 'diamond', '陈总', '13900001111', 500000, 'active'),
    ('东方艺术馆', 'platinum', '刘总', '13900002222', 300000, 'active'),
    ('国风生活馆', 'gold', '周总', '13900003333', 100000, 'active'),
    ('雅致茶具店', 'normal', '吴总', '13900004444', 50000, 'active')
  `).run();
  const custCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
  assert(custCount === 4, '客户种子数据', `数量=${custCount}`);

  // 库存
  db.prepare(`
    INSERT INTO inventory_items (product_id, warehouse_id, stock) VALUES
    (1, 1, 500), (2, 1, 800), (3, 2, 50), (4, 1, 600),
    (5, 2, 100), (6, 1, 300), (7, 2, 30), (8, 3, 400)
  `).run();
  const invCount = db.prepare('SELECT COUNT(*) as count FROM inventory_items').get().count;
  assert(invCount === 8, '库存种子数据', `数量=${invCount}`);

  // 员工
  db.prepare(`
    INSERT INTO employees (name, role, dept, email, phone, salary, status, join_date) VALUES
    ('张明', '采购主管', '采购部', 'zhangming@erp.com', '13800001111', 12000, 'active', '2024-01-15'),
    ('李芳', '销售经理', '销售部', 'lifang@erp.com', '13800002222', 15000, 'active', '2023-06-01'),
    ('王强', '生产总监', '生产部', 'wangqiang@erp.com', '13800003333', 18000, 'active', '2022-03-20'),
    ('赵丽', '财务主管', '财务部', 'zhaoli@erp.com', '13800004444', 13000, 'active', '2023-09-10'),
    ('陈伟', 'HR主管', '人力资源部', 'chenwei@erp.com', '13800005555', 11000, 'active', '2024-02-01'),
    ('刘洋', '仓库管理员', '仓储部', 'liuyang@erp.com', '13800006666', 8000, 'active', '2024-05-15')
  `).run();
  const empCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
  assert(empCount === 6, '员工种子数据', `数量=${empCount}`);

  // 工位
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
  const wsCount = db.prepare('SELECT COUNT(*) as count FROM work_stations').get().count;
  assert(wsCount === 7, '工位种子数据', `数量=${wsCount}`);

  // === 5. 外键约束验证 ===
  console.log('\n🔗 验证外键约束...');
  const fkCheck = db.pragma('foreign_key_check');
  assert(fkCheck.length === 0, '外键约束检查', `违反数=${fkCheck.length}`);

  // === 6. 数据完整性验证 ===
  console.log('\n🔍 验证数据完整性...');

  // 验证管理员用户权限查询
  const adminPerms = db.prepare(`
    SELECT DISTINCT p.id, p.resource, p.action
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    JOIN user_roles ur ON rp.role_id = ur.role_id
    WHERE ur.user_id = 1
  `).all();
  assert(adminPerms.length === permCount, '管理员权限查询', `数量=${adminPerms.length}，预期=${permCount}`);

  // 验证库存预警查询
  const alertCount = db.prepare(`
    SELECT COUNT(*) as count
    FROM inventory_items ii
    JOIN products p ON ii.product_id = p.id
    WHERE ii.stock < p.min_stock
  `).get().count;
  assert(typeof alertCount === 'number', '库存预警查询可执行', `预警数=${alertCount}`);

  // 验证系统设置查询
  const sessionTimeout = db.prepare("SELECT value FROM system_settings WHERE key = 'session_timeout'").get();
  assert(sessionTimeout?.value === '30', '系统设置查询', `session_timeout=${sessionTimeout?.value}`);

  db.close();

  // 清理测试数据库
  if (existsSync(DB_PATH)) rmSync(DB_PATH);
  if (existsSync(DB_PATH + '-wal')) rmSync(DB_PATH + '-wal');
  if (existsSync(DB_PATH + '-shm')) rmSync(DB_PATH + '-shm');

} catch (err) {
  failed++;
  results.push(`  ❌ 脚本执行异常: ${err.message}`);
}

// === 输出结果 ===
console.log('\n' + '='.repeat(60));
console.log(`📊 数据库验证结果：通过 ${passed} / 失败 ${failed} / 总计 ${passed + failed}`);
console.log('='.repeat(60));
for (const r of results) {
  console.log(r);
}

process.exit(failed > 0 ? 1 : 0);
