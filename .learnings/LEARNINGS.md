# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice
**Areas**: frontend | backend | infra | tests | docs | config | electron
**Statuses**: pending | in_progress | resolved | wont_fix | promoted | promoted_to_skill

## Status Definitions

| Status | Meaning |
|--------|---------|
| `pending` | Not yet addressed |
| `in_progress` | Actively being worked on |
| `resolved` | Issue fixed or knowledge integrated |
| `wont_fix` | Decided not to address (reason in Resolution) |
| `promoted` | Elevated to AGENTS.md / project_memory.md |
| `promoted_to_skill` | Extracted as a reusable skill |

---

## [LRN-20260710-001] correction

**Logged**: 2026-07-10T19:35:00Z
**Priority**: high
**Status**: resolved
**Area**: electron

### Summary
ESM模式下 Electron main.ts 的 `__dirname` 未定义导致窗口空白

### Details
package.json 的 `"type": "module"` 导致 Electron 主进程脚本以 ESM 模式执行，`__dirname` 在 ESM 中不可用。
使用 `fileURLToPath(import.meta.url)` 替代后修复。

### Suggested Action
创建 Electron 主进程入口文件时，统一使用 `fileURLToPath(import.meta.url)` 模式获取 `__dirname`。

### Metadata
- Source: error
- Related Files: electron/main.ts
- Tags: electron, esm, __dirname

---

## [LRN-20260710-002] correction

**Logged**: 2026-07-10T19:22:00Z
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
React Flow v12 的 `screenToFlowPosition` 接收屏幕坐标而非容器相对坐标

### Details
CanvasView 拖拽放置节点时，错误地减去了 bounds.left/top，导致节点位置偏移。
`screenToFlowPosition` 直接接收 `event.clientX/clientY` 即可。

### Suggested Action
拖拽放置代码直接传入 clientX/clientY，不要做容器偏移计算。

### Metadata
- Source: error
- Related Files: src/pages/RouteEditor/CanvasView.tsx
- Tags: react-flow, drag-drop, coordinates

---

## [LRN-20260710-003] best_practice

**Logged**: 2026-07-10T19:45:00Z
**Priority**: medium
**Status**: resolved
**Area**: backend

### Summary
数据库读取的 JSON 字段必须添加 try/catch

### Details
handlers.ts 的 ROUTE_GET_BY_ID handler 中 `JSON.parse(snapshot)` 直接执行未做错误处理，
数据库数据损坏时会导致 IPC 调用抛出未捕获异常。添加 try/catch 后返回 null 并记日志。

### Suggested Action
所有从 SQLite 读取的 JSON 字段解析操作必须包裹 try/catch。

### Metadata
- Source: error
- Related Files: electron/handlers.ts
- Tags: sqlite, json, error-handling

---

## [LRN-20260710-004] best_practice

**Logged**: 2026-07-10T19:50:00Z
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
better-sqlite3 需要为目标 Electron 版本重新编译

### Suggested Action
每次安装或更新 Electron 后，执行 `npx electron-rebuild -f -o better-sqlite3`。

### Metadata
- Source: error
- Related Files: package.json
- Tags: electron, native-module, better-sqlite3

---

## [LRN-20260710-005] best_practice

**Logged**: 2026-07-10T20:00:00Z
**Priority**: medium
**Status**: pending
**Area**: electron

### Summary
Electron 多实例问题：后台任务清理不彻底导致多个窗口

### Details
多个后台 bash 任务同时启动 vite + electron，pid 管理混乱。
每次重新启动前应确保 `pkill -9 -f Electron && pkill -9 -f vite && sleep 2`。

### Suggested Action
建立端口进程检查 SOP：启动前先 lsof -i :5173 清理。

### Metadata
- Source: error
- Related Files: 
- Tags: electron, process-management
