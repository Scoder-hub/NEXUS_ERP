import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 天

// 从环境变量或本地文件读取密钥，不硬编码
function getOrGenerateSecret(): string {
  const envSecret = process.env.TOKEN_SECRET;
  if (envSecret) return envSecret;

  // 在用户数据目录生成并存储随机密钥
  const secretPath = path.join(app.getPath('userData'), '.secret');
  try {
    if (fs.existsSync(secretPath)) {
      return fs.readFileSync(secretPath, 'utf-8').trim();
    }
  } catch {
    // 读取失败，重新生成
  }

  const newSecret = crypto.randomBytes(32).toString('hex');
  try {
    fs.writeFileSync(secretPath, newSecret, { mode: 0o600 });
  } catch {
    // 写入失败时使用临时密钥（仅当前会话有效）
    return crypto.randomBytes(32).toString('hex');
  }
  return newSecret;
}

let _tokenSecret: string | null = null;
function getTokenSecret(): string {
  if (!_tokenSecret) {
    _tokenSecret = getOrGenerateSecret();
  }
  return _tokenSecret;
}

// 密码哈希
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

// 密码验证
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

// PIN 码哈希（与密码使用相同的 bcrypt 方案）
export function hashPin(pin: string): string {
  return bcrypt.hashSync(pin, SALT_ROUNDS);
}

// PIN 码验证
export function verifyPin(pin: string, hash: string): boolean {
  return bcrypt.compareSync(pin, hash);
}

// 生成记住登录 Token
export function generateToken(userId: number): string {
  const secret = getTokenSecret();
  const payload = JSON.stringify({ userId, exp: Date.now() + TOKEN_EXPIRY });
  const iv = crypto.randomBytes(16);
  // 使用随机 salt 而非硬编码
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(secret, salt, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // 将 salt 和 iv 一起存储在 token 中
  return salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted;
}

// 验证 Token
export function verifyToken(token: string): { userId: number } | null {
  try {
    const parts = token.split(':');
    if (parts.length !== 3) return null;
    const [saltHex, ivHex, encrypted] = parts;
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const secret = getTokenSecret();
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
