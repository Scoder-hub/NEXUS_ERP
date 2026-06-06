# Bug 修复记录

## TASK-002: 工艺路线设计器 — QA 测试发现的 Bug

> 测试日期：2026-07-10
> 测试角色：QA

---

### [Bug-001] 拖拽放置节点位置偏移（已修复）

| 字段 | 内容 |
|------|------|
| **现象** | 从工序库拖拽工序到画布后，节点出现在鼠标位置的上方和左侧，偏差约面板宽度/高度 |
| **严重度** | 🔴 Critical |
| **原因** | `CanvasView.tsx` 的 `onDrop` 中将 `event.clientX/Y` 减去了 `bounds.left/top`，但 `screenToFlowPosition` 期望的是屏幕坐标 |
| **修复** | 移除 `bounds` 计算，直接传入 `event.clientX/clientY` |
| **验证** | ✅ 已修复，坐标计算正确 |
| **教训** | React Flow v12 的 `screenToFlowPosition` 接收屏幕坐标而非容器相对坐标，需注意 API 文档差异 |

---

### [Bug-002] 路线 ID 无效时编辑器无限加载（已修复）

| 字段 | 内容 |
|------|------|
| **现象** | 打开一个不存在的路线 ID（如手动输入无效ID），编辑器页面持续显示"加载中..." |
| **严重度** | 🟡 Major |
| **原因** | `routeStore.fetchRoute` 在 `route` 为 null 时跳过 else 分支，`editorLoading` 永远为 true |
| **修复** | 添加 else 分支设置 `editorLoading: false` |
| **验证** | ✅ 已修复 |
| **教训** | 异步数据获取必须处理 null/undefined 路径 |

---

### [Bug-003] 数据库快照 JSON 损坏导致崩溃（已修复）

| 字段 | 内容 |
|------|------|
| **现象** | 如果 routes 表的 snapshot 字段存储了非法 JSON，加载该路线时整个 IPC 调用抛出未捕获异常 |
| **严重度** | 🟡 Major |
| **原因** | `handlers.ts` 的 `ROUTE_GET_BY_ID` handler 中直接 `JSON.parse(snapshot)` 无错误处理 |
| **修复** | 添加 try/catch，返回 null 并记录错误日志 |
| **验证** | ✅ 已修复 |
| **教训** | 从数据库读取的 JSON 字段必须添加 try/catch，即使数据是程序自身写入的 |
