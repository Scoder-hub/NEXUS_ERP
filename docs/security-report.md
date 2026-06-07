# 安全报告（Security Report）

> 用途：每次版本发布前的安全基线检查与风险记录。

---

## 1. 基本信息
- 版本：v0.x.x
- 日期：YYYY-MM-DD
- 执行者：审查员 / QA / 架构师（填其一或多）

## 2. Electron 安全基线（勾选）
- [ ] contextIsolation=true
- [ ] nodeIntegration=false
- [ ] preload 暴露最小 API
- [ ] IPC 白名单 + 参数校验
- [ ] 错误信息不直出（不透传 SQL/堆栈）
- [ ] 敏感数据不落日志/不落前端存储

## 3. 依赖风险
- npm audit 结果：—
- 处置：升级/忽略（理由）/延期（理由）

## 4. 风险与结论
- 风险清单（Critical/Major/Minor）：
  - —
- 结论：通过 / 有条件通过 / 不通过

