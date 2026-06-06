# 兴诚电瓷 IMS — 项目规范

## 技术栈

- Electron 30 + React 18 + TypeScript 5.8
- Vite 6 + TailwindCSS 3
- Zustand 5 + SQLite (better-sqlite3)
- React Flow (工艺路线设计器)

## 设计系统

- 主色: 深空蓝 `#2563EB`
- 信息色: 冰川青 `#06B6D4`
- 成功色: 翡翠绿 `#10B981`
- 错误色: 朱砂红 `#EF4444`
- 警告色: 琥珀黄 `#F59E0B`
- 所有视觉属性通过 CSS 变量 (Design Token) 管理，禁止硬编码
- 宁圆不方：所有可见元素有圆角

## 编码规范

- 每文件 ≤ 300 行
- 每文件夹 ≤ 8 个文件
- 禁止 any
- 禁止 window.confirm/alert/prompt
- 删除必须二次确认
- 所有列表必须有 empty 状态
- 使用 kebab-case 命名文件
- PascalCase 命名组件
- camelCase 命名函数/变量

## 架构原则

- Index-Z 分层: Z-0 Electron 主进程 → Z-1 React 渲染进程 → Z-2 业务页面 → Z-3 业务服务层 → Z-4 插件层
- src/core/ 不能引入业务逻辑
- UI 组件不能直接操作数据库
- 渲染进程不能绕过 IPC 调用 Node.js API

## 角色流程

七角色串联：PM → UX 设计师 → 架构师 → 开发者 → 审查员 → QA → DevOps
每个角色完成后输出交接摘要到 `docs/dev-tasks.md`
