# Errors Log

Command failures, exceptions, and unexpected behaviors.

---

## [ERR-20260710-001]

**Logged**: 2026-07-10T19:35:00Z
**Severity**: critical
**Status**: resolved

**Error**: `ReferenceError: __dirname is not defined` in Electron main process
**Context**: 启动 Electron 时主进程崩溃，窗口空白
**Cause**: package.json 的 `"type": "module"` 导致 ESM 模式下 `__dirname` 不可用
**Fix**: 改用 `fileURLToPath(import.meta.url)` 获取 `__dirname`
**Resolved**: ✅

---

## [ERR-20260710-002]

**Logged**: 2026-07-10T19:22:00Z
**Severity**: critical
**Status**: resolved

**Error**: 拖拽工序节点到画布后位置严重偏移（左上角）
**Context**: 用户从左侧工序库拖拽工序到画布
**Cause**: `screenToFlowPosition` 传入了错误坐标（减去了 bounds.offset）
**Fix**: 直接传入 `event.clientX/Y`
**Resolved**: ✅

---

## [ERR-20260710-003]

**Logged**: 2026-07-10T20:00:00Z
**Severity**: minor
**Status**: resolved

**Error**: 多次弹出多个 Electron 桌面窗口
**Context**: 连续启动后台任务导致多实例
**Cause**: 后台进程重叠、kill 不彻底
**Fix**: 启动前先 `pkill -9 -f Electron && sleep 2`
**Resolved**: ✅
