# NEXUS ERP — CLAUDE.md

> 项目级 AI 协作规范。优先级：本文件 > 用户偏好 > 默认行为。

---

## 项目身份
- **项目**：NEXUS ERP — 面向陶瓷制造企业的桌面端全流程资源管理系统
- **根目录**：`~/Desktop/ai/`（React 前端在 `react/` 子目录）
- **版本**：v0.1.0（已发布），当前开发 v0.2.0
- **构建**：`npm run dev`（开发）/ `npm run build`（构建）

---

## 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 桌面框架 | Electron 36 | contextIsolation=true, nodeIntegration=false |
| 前端框架 | React 19 + TypeScript 5.9 | 严格模式 |
| 构建 | electron-vite 5 | 主进程/渲染进程/预加载三入口 |
| UI | Tailwind CSS 4 + shadcn/ui + Radix UI | 玻璃拟态 + 霓虹光效 |
| 状态管理 | Zustand 5 | persist 中间件持久化 token/主题 |
| 图表 | Recharts | 折线图/柱状图/饼图/雷达图 |
| 数据库 | better-sqlite3 11 + Drizzle ORM 0.44 | WAL 模式 |
| 表单验证 | Zod + react-hook-form | |
| 测试 | Playwright 1.60 | e2e 目录 |
| 国际化 | i18next 25 | 6种语言 |

## 目录结构
```
react/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── ipc/           # IPC 处理器（auth/purchase/sales...）
│   │   ├── services/      # 业务逻辑层
│   │   └── utils/         # crypto/system-info
│   ├── preload/           # preload 脚本（安全 IPC 白名单）
│   ├── renderer/          # React 渲染进程
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # layout/ + shared/ + ui/
│   │   ├── stores/        # Zustand stores（12个）
│   │   ├── hooks/         # 自定义 hooks
│   │   ├── lib/           # IPC 封装 + 工具函数
│   │   ├── i18n/          # 国际化资源文件
│   │   └── routes/        # 路由配置
│   ├── shared/            # 主进程+渲染进程共享
│   │   ├── types/         # 类型定义
│   │   ├── constants/     # IPC 通道常量
│   │   └── schemas/       # Zod 验证 Schema
│   └── db/                # 数据库层
│       ├── schema/        # Drizzle 表定义（26张表）
│       ├── migrate/       # 迁移文件
│       └── seed/          # 种子数据
└── docs/                  # 项目文档
```

---

## 代码规范

### 通用
- 单文件 ≤ 300 行，超过必须拆分
- TypeScript 严格模式，禁止 `any`（当前31个豁免）
- ESLint + Prettier 自动格式化
- 路径别名：`@/` → `src/renderer/`, `@shared/` → `src/shared/`, `@db/` → `src/db/`

### 命名规范
- **文件**：kebab-case（`purchase-order.ts`）
- **组件**：PascalCase（`PurchaseOrderList.tsx`）
- **函数/变量**：camelCase（`fetchOrders`）
- **类型接口**：PascalCase + 无 I 前缀（`PurchaseOrder`）
- **IPC 通道**：`{模块}:{操作}`（`purchase:create`）
- **数据库表**：snake_case 复数（`purchase_orders`）
- **Zod Schema**：camelCase 单数（`purchaseOrderSchema`）

### IPC 规范
- 请求-响应模式（`ipcRenderer.invoke` + `ipcMain.handle`）
- 统一响应格式：`IpcResult<T> = { success, data?, error: { code, message } }`
- 通道必须在 `shared/constants/ipc-channels.ts` 注册
- preload 白名单机制，禁止任意通道调用

### 安全红线
- ⛔ 密码明文存储 → 必须 bcrypt (salt rounds ≥ 10)
- ⛔ IPC 不设白名单 → 必须 `contextIsolation=true`
- ⛔ 硬编码敏感信息（密钥/token/PIN）
- ⛔ SQL 拼接 → 必须 Drizzle ORM 参数化查询
- ⛔ 底层错误直出 UI → 统一 `{ code: 'SYSTEM_ERROR', message: '系统异常' }`

---

## 团队开发模式

### 角色分工（8个角色）
1. **PM**：PRD、版本规划
2. **UX**：交互设计、视觉规范
3. **架构师**：技术架构、数据模型
4. **开发者**：编码实现
5. **审查员**：Code Review + 安全/性能审查
6. **QA**：功能测试
7. **DevOps**：构建/CI/发布
8. **线上测试工程师**：UI/交互验证

### 发布硬门槛（5 Gates）
每次发布必须完成以下全部产出：
| Gate | 产出文档 |
|------|---------|
| 功能正确性 | `docs/test-report.md` |
| UI/交互质量 | `docs/release-test-report.md` |
| 安全基线 | `docs/security-report.md` |
| 性能基线 | `docs/performance-report.md` |
| 完成度盘点 | `docs/feature-scan-report.md` + `docs/feature-inventory.md` |

**Gate 执行率 < 100% 不允许宣称发布完成**（除非用户批准跳过并记录原因）。

### 新功能开发流程
```
PRD审批 → UX设计 → 架构设计 → 编码实现 → 
Code Review → QA测试 → 线上测试 → 发布
```

---

## 参考文档

| 文档 | 用途 |
|------|------|
| `docs/prd.md` | 产品需求（17模块、142业务规则） |
| `docs/design.md` | UX设计 + 技术架构（3404行） |
| `docs/AI协作规则树_v4.1.md` | 团队规则、Gates、进化机制 |
| `docs/dev-tasks.md` | 任务看板 |
| `docs/dev-notes.md` | 踩坑记录、延期决策 |
| `docs/feature-inventory.md` | 功能完成度清单 |
| `docs/质量保障体系/*` | 线上测试、安全性能、自动化扫描方案 |
