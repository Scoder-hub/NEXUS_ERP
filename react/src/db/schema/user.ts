import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  avatar: text('avatar'),
  bio: text('bio'),
  dept: text('dept'),
  status: text('status', { enum: ['active', 'locked', 'disabled'] }).notNull().default('active'),
  pin: text('pin'),
  loginAttempts: integer('login_attempts').notNull().default(0),
  lockedUntil: text('locked_until'),
  joinDate: text('join_date'),
  lastLogin: text('last_login'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
