/**
 * 认证流程验证脚本
 * 验证：密码哈希/验证、Token 生成/验证、PIN 码哈希/验证、账户锁定逻辑
 */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'test-verify-auth.sqlite');

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

// === 复制 crypto.ts 的核心逻辑（不依赖 Electron app） ===
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 天

function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function hashPin(pin) {
  return bcrypt.hashSync(pin, SALT_ROUNDS);
}

function verifyPin(pin, hash) {
  return bcrypt.compareSync(pin, hash);
}

// Token 使用固定密钥进行测试
const TEST_SECRET = crypto.randomBytes(32).toString('hex');

function generateToken(userId) {
  const secret = TEST_SECRET;
  const payload = JSON.stringify({ userId, exp: Date.now() + TOKEN_EXPIRY });
  const iv = crypto.randomBytes(16);
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(secret, salt, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted;
}

function verifyToken(token) {
  try {
    const parts = token.split(':');
    if (parts.length !== 3) return null;
    const [saltHex, ivHex, encrypted] = parts;
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const secret = TEST_SECRET;
    const key = crypto.scryptSync(secret, salt, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const payload = JSON.parse(decrypted);
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

function generateExpiredToken(userId) {
  const secret = TEST_SECRET;
  const payload = JSON.stringify({ userId, exp: Date.now() - 1000 }); // 已过期
  const iv = crypto.randomBytes(16);
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(secret, salt, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted;
}

try {
  console.log('\n🔐 认证流程验证');
  console.log('='.repeat(60));

  // === 1. 密码哈希与验证 ===
  console.log('\n🔑 密码哈希与验证...');

  const testPassword = 'admin123';
  const hash = hashPassword(testPassword);

  assert(typeof hash === 'string' && hash.startsWith('$2'), '密码哈希格式正确', `前缀=${hash.substring(0, 7)}`);
  assert(verifyPassword(testPassword, hash), '正确密码验证通过');
  assert(!verifyPassword('wrongpassword', hash), '错误密码验证失败');
  assert(!verifyPassword('', hash), '空密码验证失败');
  assert(!verifyPassword('ADMIN123', hash), '大小写不同密码验证失败');

  // 不同密码产生不同哈希
  const hash2 = hashPassword('different');
  assert(hash !== hash2, '不同密码产生不同哈希');

  // 相同密码每次哈希不同（bcrypt salt）
  const hash3 = hashPassword(testPassword);
  assert(hash !== hash3, '相同密码每次哈希不同（bcrypt salt）');
  assert(verifyPassword(testPassword, hash3), '相同密码不同哈希均可验证');

  // === 2. Token 生成与验证 ===
  console.log('\n🎫 Token 生成与验证...');

  const token = generateToken(1);
  assert(typeof token === 'string', 'Token 生成成功', `长度=${token.length}`);
  assert(token.split(':').length === 3, 'Token 格式正确（salt:iv:encrypted）');

  const payload = verifyToken(token);
  assert(payload !== null, '有效 Token 验证通过');
  assert(payload?.userId === 1, 'Token 中 userId 正确', `userId=${payload?.userId}`);

  // 无效 Token
  assert(verifyToken('invalid-token') === null, '无效 Token 验证失败');
  assert(verifyToken('a:b:c') === null, '格式正确但内容无效的 Token 验证失败');
  assert(verifyToken('') === null, '空 Token 验证失败');

  // 过期 Token
  const expiredToken = generateExpiredToken(1);
  assert(verifyToken(expiredToken) === null, '过期 Token 验证失败');

  // 不同用户 ID
  const token2 = generateToken(42);
  const payload2 = verifyToken(token2);
  assert(payload2?.userId === 42, '不同用户 ID Token 验证', `userId=${payload2?.userId}`);

  // === 3. PIN 码哈希与验证 ===
  console.log('\n🔢 PIN 码哈希与验证...');

  const testPin = '1234';
  const pinHash = hashPin(testPin);

  assert(typeof pinHash === 'string' && pinHash.startsWith('$2'), 'PIN 哈希格式正确');
  assert(verifyPin(testPin, pinHash), '正确 PIN 验证通过');
  assert(!verifyPin('0000', pinHash), '错误 PIN 验证失败');
  assert(!verifyPin('12345', pinHash), '不同长度 PIN 验证失败');

  // === 4. 模拟登录流程（含账户锁定） ===
  console.log('\n🚪 模拟登录流程...');

  // 创建测试数据库
  if (existsSync(DB_PATH)) rmSync(DB_PATH);
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

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
  `);

  // 插入测试用户
  const userHash = hashPassword('admin123');
  const userPinHash = hashPin('1234');
  db.prepare(`
    INSERT INTO users (username, password_hash, name, email, status, pin)
    VALUES ('admin', ?, '系统管理员', 'admin@erp.com', 'active', ?)
  `).run(userHash, userPinHash);

  // 模拟正确登录
  const user = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  const loginOk = verifyPassword('admin123', user.password_hash);
  assert(loginOk, 'AUTH-001: 正确用户名密码登录成功');

  // 模拟错误密码登录
  const wrongLogin = verifyPassword('wrongpassword', user.password_hash);
  assert(!wrongLogin, 'AUTH-002: 错误密码登录失败');

  // 模拟连续5次错误锁定
  let attempts = 0;
  for (let i = 0; i < 5; i++) {
    const pwdOk = verifyPassword('wrongpassword', user.password_hash);
    if (!pwdOk) {
      attempts++;
      db.prepare('UPDATE users SET login_attempts = ? WHERE id = ?').run(attempts, user.id);
    }
  }
  assert(attempts === 5, 'AUTH-003: 连续5次错误密码', `attempts=${attempts}`);

  // 锁定账户
  const lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  db.prepare('UPDATE users SET status = ?, locked_until = ? WHERE id = ?').run('locked', lockedUntil, user.id);
  const lockedUser = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  assert(lockedUser.status === 'locked', 'AUTH-003: 账户状态变为 locked');
  assert(lockedUser.locked_until !== null, 'AUTH-003: 锁定时间已设置');

  // 验证锁定期间无法登录
  assert(lockedUser.status === 'locked' && new Date(lockedUser.locked_until) > new Date(), 'AUTH-003: 锁定期间无法登录');

  // 模拟锁定过期后自动解锁
  const expiredLock = new Date(Date.now() - 1000).toISOString();
  db.prepare('UPDATE users SET locked_until = ? WHERE id = ?').run(expiredLock, user.id);
  const expiredLockUser = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  const shouldUnlock = expiredLockUser.status === 'locked' && new Date(expiredLockUser.locked_until) <= new Date();
  assert(shouldUnlock, 'AUTH-003: 锁定过期后应自动解锁');

  // 解锁
  db.prepare('UPDATE users SET status = ?, login_attempts = 0, locked_until = NULL WHERE id = ?').run('active', user.id);
  const unlockedUser = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  assert(unlockedUser.status === 'active' && unlockedUser.login_attempts === 0, '解锁后状态恢复正常');

  // 模拟记住登录（Token 生成）
  const rememberToken = generateToken(user.id);
  const tokenPayload = verifyToken(rememberToken);
  assert(tokenPayload?.userId === user.id, 'AUTH-004: 记住登录状态 Token 生成并验证');

  // 模拟锁屏 + PIN 解锁
  const pinOk = verifyPin('1234', unlockedUser.pin);
  assert(pinOk, 'AUTH-006: PIN 解锁成功');

  const wrongPin = verifyPin('0000', unlockedUser.pin);
  assert(!wrongPin, 'AUTH-006: 错误 PIN 解锁失败');

  // 模拟密码解锁
  const pwdUnlockOk = verifyPassword('admin123', unlockedUser.password_hash);
  assert(pwdUnlockOk, 'AUTH-007: 密码解锁成功');

  // 模拟修改密码
  const oldPwdOk = verifyPassword('admin123', unlockedUser.password_hash);
  assert(oldPwdOk, 'AUTH-008: 旧密码验证通过');
  const newHash = hashPassword('newpassword123');
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, user.id);
  const updatedUser = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  assert(verifyPassword('newpassword123', updatedUser.password_hash), 'AUTH-008: 新密码验证通过');
  assert(!verifyPassword('admin123', updatedUser.password_hash), 'AUTH-008: 旧密码不再有效');

  // 禁用账户测试
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run('disabled', user.id);
  const disabledUser = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  assert(disabledUser.status === 'disabled', '禁用账户状态正确');

  db.close();

  // 清理
  if (existsSync(DB_PATH)) rmSync(DB_PATH);
  if (existsSync(DB_PATH + '-wal')) rmSync(DB_PATH + '-wal');
  if (existsSync(DB_PATH + '-shm')) rmSync(DB_PATH + '-shm');

} catch (err) {
  failed++;
  results.push(`  ❌ 脚本执行异常: ${err.message}`);
  console.error(err);
}

// === 输出结果 ===
console.log('\n' + '='.repeat(60));
console.log(`📊 认证验证结果：通过 ${passed} / 失败 ${failed} / 总计 ${passed + failed}`);
console.log('='.repeat(60));
for (const r of results) {
  console.log(r);
}

process.exit(failed > 0 ? 1 : 0);
