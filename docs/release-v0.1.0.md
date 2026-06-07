# Porcelain ERP v0.1.0 发布记录

## 版本信息

| 项目 | 内容 |
|---|---|
| 版本号 | v0.1.0 |
| 发布日期 | 2026-06-07 |
| 构建工具 | electron-vite 5.0.0 + electron-builder 26.0.12 |
| Electron 版本 | 36.4.0 |

## 变更内容

### 已完成任务

| 任务编号 | 任务名称 | 说明 |
|---|---|---|
| TASK-001 | 基础框架搭建 | Electron + React + Vite + TypeScript 项目初始化，UI 组件库集成 |
| TASK-002 | 系统管理模块 | 用户管理、角色权限、系统设置基础功能 |
| TASK-003 | 视觉一致性修复 | 统一设计系统（深色/浅色主题+玻璃拟态+霓虹光效） |
| TASK-004 | 认证与权限 | 登录认证、权限控制、IPC 安全通道 |
| TASK-005 | 仪表板 | KPI 卡片、收入图表、订单表格、活动动态 |

### 主要功能模块

- **认证系统**：登录/锁屏、权限校验、加密存储
- **仪表板**：KPI 数据展示、收入趋势图、订单列表、活动动态
- **系统管理**：用户管理、角色权限、系统设置
- **数据层**：Drizzle ORM + SQLite、25+ 数据表定义、种子数据
- **UI 框架**：shadcn/ui 组件库、深色/浅色主题切换、响应式布局
- **国际化**：i18next 多语言支持基础架构

## 构建信息

### 构建产物

| 产物 | 大小 | 说明 |
|---|---|---|
| out/main/index.js | 57.61 kB | 主进程代码 |
| out/preload/index.mjs | 1.10 kB | 预加载脚本 |
| out/renderer/index.html | 0.40 kB | 渲染进程入口 |
| out/renderer/assets/index-B7hF_lzF.css | 42.18 kB | 样式文件 |
| out/renderer/assets/index-BtLOzk7E.js | 2,427.87 kB | 渲染进程 JS |

### 构建配置

- **appId**: com.porcelain-erp.app
- **productName**: Porcelain ERP
- **输出目录**: dist-electron
- **macOS 目标**: dmg, zip
- **Windows 目标**: nsis, portable
- **Linux 目标**: AppImage, deb

### 构建警告

- 字体文件 `/fonts/Roboto-Regular_1.ttf` 在构建时未解析，将在运行时解析（不影响功能）

## 数据库迁移

首次创建，无需迁移。数据库文件在应用首次启动时自动创建。

包含的表：users, roles, permissions, departments, employees, products, customers, suppliers, warehouses, inventory_items, inventory_transactions, purchase_orders, sales_orders, work_orders, work_stations, finance_transactions, notifications, operation_logs, backup_records, chat_messages, reports, report_records, approval_items, process_cards, system_settings

## 配置变更

| 配置项 | 变更 |
|---|---|
| package.json | 新增 `build` 字段（electron-builder 配置） |
| resources/ | 新增应用图标占位目录 |

## 回滚方案

1. **代码回滚**：`git revert` 到上一个稳定版本 tag
2. **数据库回滚**：v0.1.0 为首次发布，无历史数据需回滚
3. **配置回滚**：移除 package.json 中的 `build` 字段和 `resources/` 目录
4. **紧急处理**：如生产环境出现严重问题，直接卸载应用并重新安装上一版本

## 发布验证清单

- [x] 应用能正常启动，无白屏/崩溃
- [x] 登录功能正常，跳转到工作台
- [x] 核心路径（登录→仪表板→系统管理）可正常操作
- [x] 数据库初始化成功，数据可正常读写
- [x] electron-vite build 构建成功，无错误
- [x] 输出文件结构完整（main/preload/renderer）
- [ ] 应用图标文件待补充（当前为占位目录）
- [ ] electron-builder 打包待执行（需图标文件后进行）
