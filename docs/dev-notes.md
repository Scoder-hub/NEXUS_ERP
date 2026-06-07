# NEXUS ERP 开发笔记

## 踩坑记录

### 多UI库混用问题 (2026-06-07)
- **发现者**: PM
- **场景**: 分析原型代码时发现
- **内容**: package.json 中同时包含 shadcn/ui、antd、arco-design、tdesign、MUI 五个UI库，实际代码主要使用 shadcn/ui + Radix UI，其他库几乎未使用
- **影响范围**: 包体积膨胀、样式冲突风险、维护成本增加
- **建议**: 架构师评估后统一为 shadcn/ui，移除未使用的UI库
- **状态**: 已偿还 — v0.1.0 已移除 antd/arco-design/MUI/tdesign

### better-sqlite3 需要为 Electron 重新编译 (2026-06-07)
- **发现者**: 开发者
- **场景**: 首次启动 electron-vite dev 时
- **内容**: better-sqlite3 是原生模块，需要用 electron-rebuild 重新编译以匹配 Electron 的 Node ABI 版本
- **影响范围**: 所有使用原生 npm 包的 Electron 项目
- **解决方案**: `npx electron-rebuild -f -w better-sqlite3`

### electron-vite 需要 main 字段 (2026-06-07)
- **发现者**: 开发者
- **场景**: 首次启动 electron-vite dev 时
- **内容**: package.json 必须包含 `"main": "./out/main/index.js"` 字段，否则 Electron 找不到主进程入口
- **影响范围**: 所有 electron-vite 项目

### CSS import 路径在 electron-vite 中不同 (2026-06-07)
- **发现者**: 开发者
- **场景**: 构建时 CSS 文件找不到
- **内容**: 渲染进程的 CSS import 路径需要相对于当前文件位置，而非项目根目录。`../../index.css` 应改为 `../index.css`
- **影响范围**: 页面迁移到 renderer 目录后

---

## 延期决策

### 延期-001: Drizzle 迁移工具 (2026-06-07)
- **决策内容**: 暂不使用 Drizzle Kit 迁移，改用原生 SQL 建表
- **原因**: v0.1.0 是首次创建数据库，不需要迁移历史；Drizzle Kit 对 better-sqlite3 的迁移支持尚不完善
- **计划偿还时间**: v0.2.0
- **影响范围**: 数据库版本管理
- **记录人**: 开发者

### 延期-002: ESLint no-explicit-any (2026-06-07)
- **决策内容**: 暂不修复 31 个 `no-explicit-any` 警告
- **原因**: v0.1.0 优先保证功能完整，类型细化不影响运行
- **计划偿还时间**: v0.2.0
- **影响范围**: 代码质量
- **记录人**: 开发者

### 延期-003: 渲染进程 JS 体积优化 (2026-06-07)
- **决策内容**: 暂不优化 renderer 2.4MB 的 JS 体积
- **原因**: 桌面应用对体积不敏感，优先保证功能
- **计划偿还时间**: v0.3.0
- **影响范围**: 应用启动速度
- **记录人**: DevOps

---

## 知识沉淀

### 原型技术栈分析 (2026-06-07)
- **发现者**: PM
- **内容**: React 19 + TypeScript + Tailwind CSS 4 + Vite 7 + shadcn/ui + Radix UI + Recharts + react-router-dom + Zod + react-hook-form + lucide-react
- **关键发现**: 已有 auto-import 配置（lucide 图标自动导入）；已有 vite-plugin-checker（TypeScript 类型检查）；已有 @ 路径别名
- **影响范围**: 后续开发可直接复用这些基础设施

### Electron 安全最佳实践 (2026-06-07)
- **发现者**: 审查员
- **内容**: contextIsolation=true + nodeIntegration=false 是必须的；IPC 通道白名单防止任意通道调用；密钥不应硬编码，应从环境变量或文件读取
- **影响范围**: 所有 Electron 应用开发

### better-sqlite3 + WAL 模式 (2026-06-07)
- **发现者**: 架构师
- **内容**: WAL 模式显著提升并发读性能；busy_timeout=5000 防止锁等待超时；foreign_keys=ON 需要手动开启
- **影响范围**: 数据库层所有操作

---

## 能力扩展

### electron-vite 集成 (2026-06-07)
- **触发**: v0.1.0 Electron 集成任务
- **安装**: electron@36, electron-vite@5, electron-builder, electron-rebuild
- **用途**: 将 React 前端原型转为 Electron 桌面应用
- **状态**: 可用

### better-sqlite3 + Drizzle ORM (2026-06-07)
- **触发**: v0.1.0 数据库集成任务
- **安装**: better-sqlite3@11, drizzle-orm@0.44, @types/better-sqlite3
- **用途**: 本地 SQLite 数据库 + 类型安全 ORM
- **状态**: 可用

### Zustand 状态管理 (2026-06-07)
- **触发**: v0.1.0 状态管理需求
- **安装**: zustand@5
- **用途**: 替代原型中的硬编码状态，支持 persist 中间件
- **状态**: 可用

---

## 进化日志

| 日期 | 类型 | 内容 | 写入位置 |
|---|---|---|---|
| 2026-06-07 | 知识发现 | 原型技术栈分析 | docs/dev-notes.md |
| 2026-06-07 | 知识发现 | Electron 安全最佳实践 | docs/dev-notes.md |
| 2026-06-07 | 知识发现 | better-sqlite3 + WAL 模式 | docs/dev-notes.md |
| 2026-06-07 | 技能补全 | electron-vite 集成 | package.json |
| 2026-06-07 | 技能补全 | better-sqlite3 + Drizzle ORM | package.json |
| 2026-06-07 | 技能补全 | Zustand 状态管理 | package.json |
| 2026-06-07 | 延期决策 | Drizzle 迁移工具 | docs/dev-notes.md |
| 2026-06-07 | 延期决策 | ESLint no-explicit-any | docs/dev-notes.md |
| 2026-06-07 | 延期决策 | 渲染进程体积优化 | docs/dev-notes.md |

---

## 质量保障体系（新增，2026-06-07）

> 背景：随着界面动效与复杂交互增加，出现"弹窗遮挡、布局错位、按钮无响应"等问题易漏检；同时缺少安全与性能基线。

### 发布验证（UI/交互）
- 新增角色：线上测试工程师（Online QA），负责发布产物/可访问环境的 UI 冒烟、取证与回归闭环
- 落地文档：`docs/线上测试与UI质量保障实施方案.md`

### 安全与性能
- 建立安全基线（Electron 安全项 + 依赖风险 + IPC/数据安全）与性能基线（启动/交互/动效/产物体积）
- 落地文档：`docs/安全与性能测试实施方案.md`、`docs/security-report.md`、`docs/performance-report.md`

### 自动化完成度盘点
- 引入"页面/按钮完成度"自动扫描（Playwright 页面覆盖 + 按钮/交互扫描）
- 落地文档：`docs/自动化功能扫描与版本迭代方案.md`、`docs/feature-inventory.md`、`docs/feature-scan-report.md`、`docs/version-plan.md`

### 自我进化机制 2.0 与五维评价（新增，2026-06-07）
- 自我进化机制升级为"可验证、可沉淀、可回归、可淘汰"的闭环（进化项台账 + 证据驱动）
- 引入五维评价体系（含权重与红线规则），每个版本至少填写一次，并挂证据链接
- 落地文档：
  - `docs/AI协作规则树_v4.1.md`
  - `docs/evolution-backlog.md`
  - `docs/quality-scorecard.md`
