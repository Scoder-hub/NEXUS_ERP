# NEXUS ERP v0.1.0 代码审查报告

**审查日期**：2026-06-07
**审查员**：Code Reviewer
**审查版本**：v0.1.0

---

## 1. 审查范围

### 审查文件清单

| # | 文件路径 | 行数 | 说明 |
|---|---|---|---|
| 1 | `electron.vite.config.ts` | 33 | electron-vite 构建配置 |
| 2 | `src/main/index.ts` | 57 | 主进程入口 |
| 3 | `src/main/ipc/auth.ts` | 39 | 认证 IPC handlers |
| 4 | `src/main/ipc/dashboard.ts` | 25 | 仪表板 IPC handlers |
| 5 | `src/main/ipc/settings.ts` | 17 | 设置 IPC handlers |
| 6 | `src/main/ipc/index.ts` | 9 | IPC 注册入口 |
| 7 | `src/main/services/auth.service.ts` | 200 | 认证服务 |
| 8 | `src/main/services/dashboard.service.ts` | 189 | 仪表板服务 |
| 9 | `src/main/services/settings.service.ts` | 44 | 设置服务 |
| 10 | `src/main/utils/crypto.ts` | 44 | 加密工具 |
| 11 | `src/main/utils/system-info.ts` | 47 | 系统信息工具 |
| 12 | `src/preload/index.ts` | 29 | preload 脚本 |
| 13 | `src/db/index.ts` | 400 | 数据库初始化 + 建表 |
| 14 | `src/db/seed/initial-data.ts` | 145 | 种子数据 |
| 15 | `src/db/schema/` | 26个文件 | Drizzle Schema 定义 |
| 16 | `src/renderer/stores/auth.store.ts` | 118 | 认证 Store |
| 17 | `src/renderer/stores/dashboard.store.ts` | 97 | 仪表板 Store |
| 18 | `src/renderer/stores/ui.store.ts` | 59 | UI Store |
| 19 | `src/renderer/routes/index.tsx` | 53 | 路由配置 |
| 20 | `src/renderer/App.tsx` | 40 | 应用入口 |
| 21 | `src/renderer/components/layout/AppLayout.tsx` | 34 | 应用布局 |
| 22 | `src/renderer/pages/LoginPage.tsx` | 228 | 登录页 |
| 23 | `src/renderer/pages/DashboardPage.tsx` | 70 | 仪表板页 |
| 24 | `src/renderer/lib/ipc.ts` | 19 | IPC 调用封装 |
| 25 | `src/shared/constants/ipc-channels.ts` | 131 | IPC 通道常量 |
| 26 | `src/shared/schemas/auth.schema.ts` | 30 | Zod 验证 Schema |
| 27 | `src/shared/types/auth.ts` | 46 | 认证类型定义 |
| 28 | `src/shared/types/common.ts` | 30 | 通用类型定义 |

---

## 2. 规范检查结果

### 2.1 文件大小检查

| 文件 | 行数 | 上限 | 结果 |
|---|---|---|---|
| `src/db/index.ts` | 400 | 300 | ❌ **超标** |
| `src/main/services/auth.service.ts` | 200 | 300 | ✅ |
| `src/renderer/pages/LoginPage.tsx` | 228 | 300 | ✅ |
| `src/shared/constants/ipc-channels.ts` | 131 | 300 | ✅ |
| 其他文件 | 均 < 200 | 300 | ✅ |

### 2.2 命名规范检查

| 检查项 | 结果 | 说明 |
|---|---|---|
| 文件命名 (kebab-case) | ✅ | 所有文件遵循 kebab-case |
| 组件命名 (PascalCase) | ✅ | `AppLayout`, `LoginPage`, `DashboardPage` 等 |
| 函数/变量 (camelCase) | ✅ | `initDatabase`, `registerIpcHandlers` 等 |
| 常量 (UPPER_SNAKE_CASE) | ⚠️ | `IPC_AUTH` 等使用 PascalCase 对象 + UPPER_SNAKE_KEY，可接受 |
| CSS 变量 | ✅ | `--background`, `--border` 等遵循 `--category-variant` |

### 2.3 代码风格检查

| 检查项 | 结果 | 说明 |
|---|---|---|
| TypeScript 严格模式 | ✅ | 全项目使用 TypeScript |
| import 顺序 | ✅ | 第三方库在前，项目内模块在后 |
| 中文注释 | ✅ | 关键逻辑有中文注释 |
| 错误处理模式 | ✅ | 统一使用 `IpcResult<T>` 包装返回值 |

---

## 3. 逻辑检查结果

### 3.1 业务逻辑问题

| # | 严重度 | 问题描述 | 位置 |
|---|---|---|---|
| L-01 | **Major** | `auth.ts` IPC handler 中 `GET_CURRENT_USER` 直接使用 `require('../../db')` 而非通过 service 层，违反分层架构。其他 handler 都通过 service 调用，此处不一致 | `src/main/ipc/auth.ts:24` |
| L-02 | **Major** | `auth.service.ts` 的 `login` 方法中 `SELECT * FROM users` 会返回 `password_hash`、`pin` 等敏感字段，虽然当前未传递给前端，但存在泄露风险 | `src/main/services/auth.service.ts:13` |
| L-03 | **Minor** | `dashboard.service.ts` 的 `getKpi()` 中 `customerChange` 硬编码为 0，未实现计算逻辑，与 `revenueChange` 和 `orderChange` 处理不一致 | `src/main/services/dashboard.service.ts:97` |
| L-04 | **Minor** | `dashboard.service.ts` 的 `getRevenueChart()` 中季度分组使用 `%Y-Q` 格式，但 SQLite 的 `strftime` 不支持 `Q` 格式化符，会导致季度数据不正确 | `src/main/services/dashboard.service.ts:118` |
| L-05 | **Minor** | `dashboard.service.ts` 的 `getRecentOrders()` 和 `getActivityFeed()` 返回类型为 `any[]`，缺乏类型安全 | `src/main/services/dashboard.service.ts:149,165` |
| L-06 | **Minor** | `auth.service.ts` 的 `unlock` 方法中 PIN 码使用明文比较 (`pin === userRow.pin`)，PIN 码未哈希存储 | `src/main/services/auth.service.ts:121` |
| L-07 | **Minor** | `dashboard.store.ts` 的 `refreshAll` 使用 `Promise.all`，但 `set({ loading: false })` 在 finally 中执行，而各 fetch 方法内部不设置 loading，如果某个 fetch 失败，其他 fetch 的结果仍会被设置，但 loading 状态可能不准确 | `src/renderer/stores/dashboard.store.ts:83-96` |

### 3.2 边界条件问题

| # | 严重度 | 问题描述 | 位置 |
|---|---|---|---|
| L-08 | **Major** | `auth.service.ts` 的 `login` 方法中，`locked_until` 字段使用 `new Date(userRow.locked_until)` 解析，但数据库中存储的是 ISO 字符串，SQLite 的 `datetime()` 函数返回的格式可能与 ISO 不完全一致，可能导致锁定判断失败 | `src/main/services/auth.service.ts:21` |
| L-09 | **Minor** | `auth.service.ts` 的 `updateProfile` 方法中 `data` 参数类型为 `{ name?: string; phone?: string; bio?: string; avatar?: string }`，但 IPC handler 中声明为 `any`，类型约束被绕过 | `src/main/ipc/auth.ts:36` |
| L-10 | **Minor** | `LoginPage.tsx` 中 `rememberMe` 的 checkbox 使用了 `hidden` 的原生 input，但没有自定义选中状态的视觉反馈，用户无法看到勾选状态 | `src/renderer/pages/LoginPage.tsx:191-199` |
| L-11 | **Minor** | `LoginPage.tsx` 中"忘记密码？"按钮没有实际功能，点击无响应 | `src/renderer/pages/LoginPage.tsx:202` |

### 3.3 错误处理问题

| # | 严重度 | 问题描述 | 位置 |
|---|---|---|---|
| L-12 | **Major** | `auth.service.ts` 中所有 catch 块将 `error.message` 直接返回给前端，可能泄露内部实现细节（如 SQL 错误、表名等） | `src/main/services/auth.service.ts:74,108,137,157,183` |
| L-13 | **Minor** | `dashboard.store.ts` 的各 fetch 方法在 `result.success === false` 时静默忽略错误，不向用户报告 | `src/renderer/stores/dashboard.store.ts:48-52,55-59,62-66,69-73,76-80` |
| L-14 | **Minor** | `ipc.ts` 中 `window as any` 绕过了 TypeScript 类型检查，缺少 `window.ipc` 的类型声明 | `src/renderer/lib/ipc.ts:6,18` |

---

## 4. 安全检查结果

### 4.1 Electron 安全配置

| 检查项 | 结果 | 说明 |
|---|---|---|
| `contextIsolation: true` | ✅ | 已启用上下文隔离 |
| `nodeIntegration: false` | ✅ | 已禁用 Node 集成 |
| `sandbox: false` | ⚠️ | 注释说明 better-sqlite3 需要，可接受但需注意 |
| 导航限制 | ✅ | `will-navigate` 事件已阻止外部导航 |
| `webSecurity` | ✅ | 默认为 true，未修改 |

### 4.2 IPC 安全

| 检查项 | 结果 | 说明 |
|---|---|---|
| IPC 白名单 | ✅ | preload 中实现了通道白名单 |
| `ipcRenderer.invoke` | ✅ | 仅暴露 invoke 和 on，未暴露 send |
| 事件监听白名单 | ✅ | `on` 方法也实现了白名单 |

### 4.3 密码存储安全

| # | 严重度 | 问题描述 | 位置 |
|---|---|---|---|
| S-01 | **Critical** | `crypto.ts` 中 `TOKEN_SECRET` 使用硬编码默认值 `'nexus-erp-secret-key-2026'`，生产环境中如果未设置环境变量，Token 可被伪造 | `src/main/utils/crypto.ts:5` |
| S-02 | **Critical** | `crypto.ts` 中 `scryptSync` 的 salt 使用硬编码值 `'porcelain-salt'`，降低了 Token 加密的安全性 | `src/main/utils/crypto.ts:22,34` |
| S-03 | **Major** | `auth.service.ts` 中 PIN 码以明文存储在数据库中，未进行哈希处理 | `src/main/services/auth.service.ts:121` |
| S-04 | **Major** | `initial-data.ts` 中默认管理员密码为 `admin123`，且 bcrypt 的 salt rounds 使用硬编码值 10 而非常量 `SALT_ROUNDS` | `src/db/seed/initial-data.ts:40` |
| S-05 | **Minor** | `auth.store.ts` 使用 `persist` 中间件将 `token` 存储到 localStorage，存在 XSS 风险（虽然 Electron 环境下 XSS 风险较低） | `src/renderer/stores/auth.store.ts:114-116` |

### 4.4 SQL 注入防护

| 检查项 | 结果 | 说明 |
|---|---|---|
| 参数化查询 | ✅ | 所有 SQL 查询均使用 `?` 占位符 + 参数化 |
| `auth.service.ts` updateProfile | ✅ | 动态 SQL 拼接仅拼接列名（硬编码），值仍使用参数化 | `src/main/services/auth.service.ts:179` |
| `dashboard.service.ts` getRevenueChart | ⚠️ | `groupBy` 变量通过字符串插值拼入 SQL，但 `groupBy` 来源于 switch-case 的硬编码值，非用户输入，风险可控 | `src/main/services/dashboard.service.ts:127-128` |

### 4.5 其他安全问题

| # | 严重度 | 问题描述 | 位置 |
|---|---|---|---|
| S-06 | **Major** | `auth.ts` IPC handler 中 `UPDATE_PROFILE` 的 `args.data` 类型为 `any`，未使用 Zod Schema 验证，恶意数据可绕过前端校验直接写入数据库 | `src/main/ipc/auth.ts:36` |
| S-07 | **Minor** | `system-info.ts` 中磁盘使用率硬编码为 45，返回虚假数据 | `src/main/utils/system-info.ts:44` |

---

## 5. 架构合规检查结果

### 5.1 分层架构

| 检查项 | 结果 | 说明 |
|---|---|---|
| 渲染进程 → IPC → 主进程 | ✅ | 遵循 Electron 安全架构 |
| Store → ipcInvoke → IPC Handler → Service → DB | ✅ | 数据流清晰 |
| 共享层 (shared) | ✅ | 类型、常量、Schema 正确放置在 shared 目录 |
| IPC 通道常量集中管理 | ✅ | `ipc-channels.ts` 统一定义 |

### 5.2 架构偏差

| # | 严重度 | 问题描述 | 位置 |
|---|---|---|---|
| A-01 | **Major** | `db/index.ts` 中 `createTables()` 使用原生 SQL 建表而非 Drizzle 迁移，与项目引入 Drizzle ORM 的设计意图矛盾。Drizzle Schema 已定义但仅用于查询类型推导，未用于表创建 | `src/db/index.ts:29-389` |
| A-02 | **Major** | `db/index.ts` 文件 400 行，超过 300 行上限，且混合了数据库初始化、建表 SQL、导出函数等职责，应拆分 | `src/db/index.ts` |
| A-03 | **Minor** | `dashboard.store.ts` 中 `DashboardKpi` 和 `RevenueDataPoint` 接口与 `dashboard.service.ts` 中重复定义，应使用 shared 层的类型 | `src/renderer/stores/dashboard.store.ts:5-20` |
| A-04 | **Minor** | 路由配置中所有页面均无权限守卫，任何已登录用户可访问所有路由 | `src/renderer/routes/index.tsx` |
| A-05 | **Minor** | `App.tsx` 中 `checkAuth` 在每次渲染时通过 useEffect 调用，但路由层没有基于认证状态的守卫逻辑，未认证用户可直接访问 `/dashboard` | `src/renderer/App.tsx:18-20` |

### 5.3 Drizzle Schema 与建表 SQL 一致性

| 检查项 | 结果 | 说明 |
|---|---|---|
| Schema 定义完整 | ✅ | 25 个 Schema 文件覆盖所有表 |
| Schema 与建表 SQL 一致 | ⚠️ | Schema 定义了类型映射，但建表使用原生 SQL，两者需人工保持同步，存在不一致风险 |
| Schema 实际使用情况 | ⚠️ | Service 层全部使用原生 SQL 查询，Drizzle ORM 仅在 `db/index.ts` 中实例化但未实际使用 |

---

## 6. 性能检查结果

| # | 严重度 | 问题描述 | 位置 |
|---|---|---|---|
| P-01 | **Minor** | `dashboard.service.ts` 的 `getKpi()` 执行 6 次独立 SQL 查询，可合并为 1-2 次查询以减少数据库往返 | `src/main/services/dashboard.service.ts:30-80` |
| P-02 | **Minor** | `dashboard.store.ts` 的 `refreshAll` 使用 `Promise.all` 并行请求，但每个请求是串行的 IPC invoke，实际并行度取决于主进程处理能力 | `src/renderer/stores/dashboard.store.ts:83-96` |
| P-03 | **Minor** | `system-info.ts` 的 `getCpuUsage()` 仅采样一个时间点的 CPU 数据，无法准确反映 CPU 使用率（需要两次采样间隔计算） | `src/main/utils/system-info.ts:10-22` |
| P-04 | **Minor** | `db/index.ts` 中 `cache_size = -64000` 设置了 64MB 缓存，对于桌面应用可能偏大 | `src/db/index.ts:14` |

---

## 7. 问题清单

### Critical（必须修复）

| # | 问题 | 位置 | 建议 |
|---|---|---|---|
| S-01 | Token 密钥硬编码默认值 | `crypto.ts:5` | 启动时检查 `TOKEN_SECRET` 环境变量是否设置，未设置则拒绝启动或生成随机密钥并持久化 |
| S-02 | scrypt salt 硬编码 | `crypto.ts:22,34` | 使用随机 salt 并与密文一起存储，或从配置中读取 |

### Major（应当修复）

| # | 问题 | 位置 | 建议 |
|---|---|---|---|
| L-01 | IPC handler 绕过 service 层直接操作数据库 | `auth.ts:24` | 将 `GET_CURRENT_USER` 逻辑移至 `auth.service.ts` |
| L-02 | `SELECT *` 返回敏感字段 | `auth.service.ts:13,86,114,143` | 明确指定所需列，排除 `password_hash`、`pin` 等 |
| L-08 | 日期解析可能不一致 | `auth.service.ts:21` | 使用统一的日期格式处理函数 |
| L-12 | 错误信息泄露内部细节 | `auth.service.ts` 多处 | 生产环境返回通用错误信息，详细错误仅记录日志 |
| S-03 | PIN 码明文存储 | `auth.service.ts:121` | 对 PIN 码进行哈希存储 |
| S-04 | 默认弱密码 + salt rounds 不一致 | `initial-data.ts:40` | 强制首次登录修改密码；使用 `SALT_ROUNDS` 常量 |
| S-06 | IPC 入口缺少服务端验证 | `auth.ts:36` | 在 IPC handler 中使用 Zod Schema 验证所有输入 |
| A-01 | 建表使用原生 SQL 而非 Drizzle 迁移 | `db/index.ts:29-389` | 迁移到 Drizzle Kit 管理迁移，或至少将建表 SQL 拆分到独立文件 |
| A-02 | `db/index.ts` 超 300 行 | `db/index.ts` | 拆分为 `db/init.ts`、`db/tables.ts`、`db/index.ts` |

### Minor（建议修复）

| # | 问题 | 位置 | 建议 |
|---|---|---|---|
| L-03 | `customerChange` 硬编码为 0 | `dashboard.service.ts:97` | 实现计算逻辑或添加 TODO 注释 |
| L-04 | SQLite `strftime` 不支持 `%Y-Q` | `dashboard.service.ts:118` | 使用 CASE 表达式计算季度 |
| L-05 | 返回类型为 `any[]` | `dashboard.service.ts:149,165` | 定义具体类型 |
| L-06 | PIN 明文比较 | `auth.service.ts:121` | 使用 `verifyPassword` 类似的哈希比较 |
| L-07 | `refreshAll` 错误处理不完善 | `dashboard.store.ts:83-96` | 各 fetch 失败时记录错误状态 |
| L-09 | IPC handler 参数类型为 `any` | `auth.ts:36` | 使用具体类型 |
| L-10 | checkbox 无视觉反馈 | `LoginPage.tsx:191-199` | 添加选中状态的样式 |
| L-11 | "忘记密码"按钮无功能 | `LoginPage.tsx:202` | 实现功能或暂时隐藏 |
| L-13 | Store 静默忽略错误 | `dashboard.store.ts` 多处 | 添加错误状态和提示 |
| L-14 | `window as any` 缺少类型声明 | `ipc.ts:6,18` | 添加 `window.ipc` 类型声明文件 |
| S-05 | Token 存储在 localStorage | `auth.store.ts:114-116` | 考虑使用 Electron safeStorage API |
| S-07 | 磁盘使用率硬编码 | `system-info.ts:44` | 使用 `statvfs` 或第三方库获取真实值 |
| A-03 | 类型重复定义 | `dashboard.store.ts:5-20` | 使用 shared 层类型 |
| A-04 | 路由无权限守卫 | `routes/index.tsx` | 添加路由守卫组件 |
| A-05 | 未认证可访问受保护路由 | `App.tsx:18-20` | 添加认证检查重定向 |
| P-01 | 多次独立 SQL 查询 | `dashboard.service.ts:30-80` | 合并查询 |
| P-03 | CPU 使用率采样不准确 | `system-info.ts:10-22` | 实现两次采样间隔计算 |
| P-04 | SQLite 缓存偏大 | `db/index.ts:14` | 评估是否需要 64MB 缓存 |

---

## 8. 结论

**审查结论：🔴 有条件通过**

### 必须修复后方可发布的问题（2 Critical + 9 Major）

1. **Critical**：Token 密钥和 salt 硬编码，生产环境存在被伪造的安全风险
2. **Major**：多个安全与架构问题需要修复，包括：
   - IPC handler 绕过 service 层
   - 敏感字段泄露风险
   - 错误信息泄露内部细节
   - PIN 码明文存储
   - IPC 入口缺少服务端验证
   - 建表方式与 ORM 设计意图矛盾
   - 文件超限

### 修复优先级建议

1. **立即修复**（阻塞发布）：S-01, S-02, S-03, S-06, L-12
2. **发布前修复**（影响质量）：L-01, L-02, A-01, A-02, L-08, S-04
3. **迭代修复**（不影响核心功能）：所有 Minor 问题

### 总体评价

项目整体架构清晰，Electron 安全配置基本到位，IPC 通道白名单机制完善，数据库使用参数化查询有效防止 SQL 注入。主要问题集中在安全配置（密钥硬编码、PIN 明文存储）和架构一致性（Drizzle ORM 未实际使用、建表与 Schema 分离）。建议优先修复 Critical 和 Major 问题后发布。
