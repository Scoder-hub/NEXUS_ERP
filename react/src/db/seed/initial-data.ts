import bcrypt from 'bcryptjs';
import type Database from 'better-sqlite3';

export function seedInitialData(db: Database.Database) {
  const transaction = db.transaction(() => {
    // 1. 创建预置角色
    db.prepare(`
      INSERT INTO roles (name, description, is_system) VALUES
      ('超级管理员', '系统最高权限角色', 1),
      ('管理员', '系统管理角色', 1),
      ('部门主管', '部门管理角色', 1),
      ('普通员工', '基础操作角色', 1),
      ('访客', '只读访问角色', 1)
    `).run();

    // 2. 创建权限
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

    // 3. 超级管理员分配所有权限
    const allPerms = db.prepare('SELECT id FROM permissions').all() as { id: number }[];
    const insertRolePerm = db.prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (1, ?)');
    for (const perm of allPerms) {
      insertRolePerm.run(perm.id);
    }

    // 4. 创建默认管理员账户
    const passwordHash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (username, password_hash, name, email, status)
      VALUES ('admin', ?, '系统管理员', 'admin@porcelain-erp.com', 'active')
    `).run(passwordHash);

    // 5. 分配超级管理员角色
    db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)').run();

    // 6. 创建默认部门
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

    // 7. 创建默认仓库
    db.prepare(`
      INSERT INTO warehouses (name, area, status) VALUES
      ('A 仓库', 1200, 'active'),
      ('B 仓库', 800, 'active'),
      ('C 仓库', 600, 'active')
    `).run();

    // 8. 创建系统设置
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

    // 9. 创建示例产品
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

    // 10. 创建示例供应商
    db.prepare(`
      INSERT INTO suppliers (name, category, contact, phone, rating, status) VALUES
      ('景德镇原料厂', '原料', '张三', '13800001111', 4.5, 'active'),
      ('宜兴陶土供应', '原料', '李四', '13800002222', 4.2, 'active'),
      ('佛山釉料公司', '釉料', '王五', '13800003333', 4.8, 'active'),
      ('淄博耐火材料', '辅料', '赵六', '13800004444', 3.9, 'active')
    `).run();

    // 11. 创建示例客户
    db.prepare(`
      INSERT INTO customers (name, tier, contact, phone, credit_limit, status) VALUES
      ('华美陶瓷商城', 'diamond', '陈总', '13900001111', 500000, 'active'),
      ('东方艺术馆', 'platinum', '刘总', '13900002222', 300000, 'active'),
      ('国风生活馆', 'gold', '周总', '13900003333', 100000, 'active'),
      ('雅致茶具店', 'normal', '吴总', '13900004444', 50000, 'active')
    `).run();

    // 12. 创建示例库存
    db.prepare(`
      INSERT INTO inventory_items (product_id, warehouse_id, stock) VALUES
      (1, 1, 500), (2, 1, 800), (3, 2, 50), (4, 1, 600),
      (5, 2, 100), (6, 1, 300), (7, 2, 30), (8, 3, 400)
    `).run();

    // 13. 创建示例员工
    db.prepare(`
      INSERT INTO employees (name, role, dept, email, phone, salary, status, join_date) VALUES
      ('张明', '采购主管', '采购部', 'zhangming@erp.com', '13800001111', 12000, 'active', '2024-01-15'),
      ('李芳', '销售经理', '销售部', 'lifang@erp.com', '13800002222', 15000, 'active', '2023-06-01'),
      ('王强', '生产总监', '生产部', 'wangqiang@erp.com', '13800003333', 18000, 'active', '2022-03-20'),
      ('赵丽', '财务主管', '财务部', 'zhaoli@erp.com', '13800004444', 13000, 'active', '2023-09-10'),
      ('陈伟', 'HR主管', '人力资源部', 'chenwei@erp.com', '13800005555', 11000, 'active', '2024-02-01'),
      ('刘洋', '仓库管理员', '仓储部', 'liuyang@erp.com', '13800006666', 8000, 'active', '2024-05-15')
    `).run();

    // 14. 创建示例工位
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
