# 五维质量评价卡（Quality Scorecard）

> 用途：每个版本至少填写一次，用“证据 + 分数”驱动改进与进化项。  
> 评分：0~5；加权总分（0~100）= Σ(权重 * 分数 / 5)

---

## 1. 基本信息
- 版本：v0.x.x
- 日期：YYYY-MM-DD
- 填写人：PM / QA / DevOps / 线上测试工程师（可多人）

---

## 2. 五维评分（含权重与证据）

| 维度 | 权重 | 分数(0~5) | 证据链接（至少 1 条） | 主要问题 | 下版本行动 |
|---|---:|---:|---|---|---|
| 正确性（Correctness） | 20% |  | `docs/test-report.md` |  |  |
| 体验质量（UX/Interaction） | 20% |  | `docs/release-test-report.md` / 截图diff |  |  |
| 安全性（Security） | 25% |  | `docs/security-report.md` / 审查结论 |  |  |
| 性能（Performance） | 25% |  | `docs/performance-report.md` / build体积 |  |  |
| 可维护性与交付效率（Maintainability/Delivery） | 10% |  | `docs/review-report.md` / lint+tsc |  |  |

---

## 3. 红线判定

- 安全性 < 3 或 性能 < 3：不允许发布（除非用户批准跳过并记录风险与补偿措施）
- 正确性 < 3：不允许发布

---

## 4. 加权总分

- 计算结果：____ / 100
- 结论：通过 / 有条件通过 / 不通过

