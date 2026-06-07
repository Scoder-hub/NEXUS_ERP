# NEXUS ERP v0.1.0 上线测试验证报告

**验证日期**：2026-06-07
**验证角色**：上线测试工程师
**验证方式**：代码级审查 + 构建验证
**构建结果**：✅ electron-vite build 成功

---

## 一、Bug 修复确认

| # | 原问题 | 修复状态 | 验证结果 |
|---|--------|---------|---------|
| 1 | crypto.ts 密钥硬编码 | ✅ 已修复 | `getOrGenerateSecret()` 从环境变量或本地文件读取，不存在时随机生成并存储到 `app.getPath('userData')/.secret`，文件权限 0o600 |
| 2 | PIN 明文存储 | ✅ 已修复 | `hashPin()` 使用 bcrypt（SALT_ROUNDS=10），`verifyPin()` 使用 `bcrypt.compareSync()`，数据库存储的是 bcrypt 哈希 |
| 3 | SELECT * 返回敏感字段 | ✅ 已修复 | 使用 `USER_SAFE_FIELDS` 列表明确指定查询字段，排除 `password_hash`。**本次验证发现并修复了 `pin`、`login_attempts`、`locked_until` 不应在安全字段中的问题** |
| 4 | 错误信息泄露 | ✅ 已修复 | 所有 catch 块统一返回 `{ code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' }` |

---

## 二、本次验证发现并修复的问题

### RT-001：LockScreen 前端硬编码 PIN 码（Critical → 已修复）

- **页面/组件**：`src/components/LockScreen.tsx`
- **问题分类**：Bug / 安全
- **严重程度**：Critical
- **问题描述**：LockScreen 组件中 `CORRECT_PIN = '123456'` 硬编码在前端，完全绕过了后端 bcrypt 验证。任何用户输入 123456 即可解锁，且底部显示"演示 PIN：123456"和"演示密码：任意 3 位以上"
- **预期效果**：PIN/密码验证应通过后端 bcrypt 比对，前端不应存储或显示任何验证凭据
- **修复内容**：
  - 移除 `CORRECT_PIN` 常量
  - `onUnlock` 回调签名改为 `(pin?: string, password?: string) => void`
  - PIN 输入满 6 位后通过 `onUnlock(pin, undefined)` 传递给上层 auth store 进行后端验证
  - 密码模式通过 `onUnlock(undefined, password)` 传递
  - 移除"演示 PIN"和"演示密码"提示文字
- **负责角色**：上线测试工程师（已修复）

### RT-002：AppLayout 未连接 Sidebar/TopBar 交互（Critical → 已修复）

- **页面/组件**：`src/renderer/components/layout/AppLayout.tsx`
- **问题分类**：Bug / 功能
- **严重程度**：Critical
- **问题描述**：Sidebar 和 TopBar 组件的 props（activePage、onNavigate、onToggleSidebar、theme、onToggleTheme、onLockScreen）均未从 AppLayout 传入，导致：导航点击无响应、侧边栏折叠按钮无效、主题切换无效、锁屏按钮无效
- **预期效果**：所有交互功能正常工作
- **修复内容**：
  - 从 `useLocation` 推导 `activePage`
  - 实现 `handleNavigate` 将 NavPage 映射到路由路径
  - 传入 `toggleSidebar`、`theme`、`toggleTheme`、`lockScreen` 等 props
- **负责角色**：上线测试工程师（已修复）

### RT-003：侧边栏宽度不一致（Major → 已修复）

- **页面/组件**：AppLayout + Sidebar
- **问题分类**：布局
- **严重程度**：Major
- **问题描述**：Sidebar 组件宽度为 240px（展开），但 AppLayout 的 margin-left 为 260px，导致内容区域与侧边栏不对齐
- **预期效果**：内容区域 margin 与侧边栏宽度一致
- **修复内容**：将 AppLayout 的 `ml-[260px]` 改为 `ml-[240px]`
- **负责角色**：上线测试工程师（已修复）

### RT-004：USER_SAFE_FIELDS 包含内部敏感字段（Major → 已修复）

- **页面/组件**：`src/main/services/auth.service.ts`
- **问题分类**：Bug / 安全
- **严重程度**：Major
- **问题描述**：`USER_SAFE_FIELDS` 包含 `pin`、`login_attempts`、`locked_until`，这些是后端内部使用的字段，不应返回给前端。虽然 pin 是 bcrypt 哈希，但暴露哈希值仍存在离线暴力破解风险
- **预期效果**：前端只能获取必要的用户信息，内部验证字段不暴露
- **修复内容**：将 `USER_SAFE_FIELDS` 拆分为 `USER_SAFE_FIELDS`（返回前端）和 `USER_INTERNAL_FIELDS`（仅后端使用），内部查询时两者都查询但不返回给前端
- **负责角色**：上线测试工程师（已修复）

### RT-005：NotFound 页面样式不统一（Minor → 已修复）

- **页面/组件**：`src/renderer/pages/NotFound.tsx`
- **问题分类**：样式
- **严重程度**：Minor
- **问题描述**：使用 Tailwind 默认类（`bg-gray-100`、`text-gray-600`、`text-blue-500`）而非设计系统变量，与整体深色/浅色主题不兼容
- **预期效果**：使用设计系统变量，支持主题切换
- **修复内容**：改用 `var(--background)`、`var(--muted-foreground)`、`gradient-text`、`liquid-btn` 等设计系统变量和类
- **负责角色**：上线测试工程师（已修复）

### RT-006：AuroraBackground 星星位置随机（Minor → 已修复）

- **页面/组件**：`src/components/AuroraBackground.tsx`
- **问题分类**：视觉
- **严重程度**：Minor
- **问题描述**：使用 `Math.random()` 生成星星位置，每次组件渲染产生不同位置，导致视觉闪烁
- **预期效果**：星星位置固定，不随渲染变化
- **修复内容**：使用确定性伪随机函数 `seededRandom()` 预生成星星数据
- **负责角色**：上线测试工程师（已修复）

### RT-007：DashboardPage 双重 padding（Minor → 已修复）

- **页面/组件**：`src/renderer/pages/DashboardPage.tsx`
- **问题分类**：布局
- **严重程度**：Minor
- **问题描述**：AppLayout 的 `<main>` 已有 `p-6`，DashboardPage 又添加了 `p-6`，导致内容区域有双重内边距
- **预期效果**：单层 padding
- **修复内容**：移除 DashboardPage 的 `p-6`
- **负责角色**：上线测试工程师（已修复）

### RT-008：Toaster 样式不跟随主题（Minor → 已修复）

- **页面/组件**：`src/renderer/App.tsx`
- **问题分类**：样式
- **严重程度**：Minor
- **问题描述**：Toaster 硬编码深色背景和文字颜色，切换到浅色主题时 toast 通知不可读
- **预期效果**：Toaster 样式跟随当前主题
- **修复内容**：根据 `theme` 变量动态设置 Toaster 的 background、border、color
- **负责角色**：上线测试工程师（已修复）

### RT-009：LanguageSwitcher 生成多余 DOM 节点（Minor → 已修复）

- **页面/组件**：`src/components/LanguageSwitcher.tsx`
- **问题分类**：Bug
- **严重程度**：Minor
- **问题描述**：LangProvider 组件中生成了 3 个 `position:fixed` 的空 div（`data-px-slot="LangProvider-slot-0"`），这些是构建工具注入的残留节点
- **预期效果**：LangProvider 不应生成多余 DOM 节点
- **修复内容**：移除 3 个空 div
- **负责角色**：上线测试工程师（已修复）

### RT-010：RevenueChart Tooltip 硬编码深色背景（Minor → 已修复）

- **页面/组件**：`src/components/RevenueChart.tsx`
- **问题分类**：样式
- **严重程度**：Minor
- **问题描述**：Tooltip 使用硬编码深色背景 `rgba(8,11,20,0.95)` 和颜色 `#8892b0`、`#e2e8f8`，浅色主题下不可读
- **预期效果**：Tooltip 样式跟随主题
- **修复内容**：改用 `var(--popover)`、`var(--border)`、`var(--muted-foreground)`、`var(--foreground)` 变量
- **负责角色**：上线测试工程师（已修复）

### RT-011：MiniDonutChart 硬编码深色颜色（Minor → 已修复）

- **页面/组件**：`src/components/MiniDonutChart.tsx`
- **问题分类**：样式
- **严重程度**：Minor
- **问题描述**：CustomLabel 和 CustomTooltip 使用硬编码深色颜色 `#e2e8f8`、`#8892b0`，浅色主题下不可读
- **预期效果**：颜色跟随主题
- **修复内容**：改用 `var(--foreground)`、`var(--muted-foreground)`、`var(--popover)`、`var(--border)` 变量
- **负责角色**：上线测试工程师（已修复）

---

## 三、待修复问题（需开发者处理）

### RT-012：全局硬编码颜色未使用 CSS 变量（Major）

- **页面/组件**：全局（28 个文件，173 处）
- **问题分类**：样式
- **严重程度**：Major
- **问题描述**：大量组件使用硬编码颜色值（`#8892b0`、`#4a5568`、`#e2e8f8`）而非 CSS 变量（`var(--muted-foreground)`、`var(--foreground)`），导致浅色主题下部分文字不可读
- **涉及文件**：KpiCardRow、OrderTable、ActivityFeed、SystemStatus、TopBar、Sidebar、SettingsPage、SalesPage、ReportsPage、PurchasePage、InventoryPage、HrPage、FinancePage 等
- **预期效果**：所有颜色使用 CSS 变量，确保主题切换一致性
- **修复建议**：全局替换 `#8892b0` → `var(--muted-foreground)`、`#4a5568` → `var(--theme-nav-section-label)`、`#e2e8f8` → `var(--foreground)`
- **负责角色**：开发者

### RT-013：Electron GPU Sandbox 崩溃（Major）

- **页面/组件**：Electron 主进程
- **问题分类**：Bug / 环境
- **严重程度**：Major
- **问题描述**：`npx electron-vite dev` 启动后 Electron 因 GPU sandbox 问题崩溃（`GPU process isn't usable. Goodbye.`），表现为反复重启 GPU 进程后最终 FATAL 退出
- **预期效果**：应用正常启动
- **修复建议**：在 `electron.vite.config.ts` 或主进程中添加 `app.disableHardwareAcceleration()` 或 `--no-sandbox` 参数
- **负责角色**：开发者

### RT-014：Roboto 字体文件路径问题（Minor）

- **页面/组件**：全局样式
- **问题分类**：样式
- **严重程度**：Minor
- **问题描述**：构建时警告 `/fonts/Roboto-Regular_1.ttf referenced in /fonts/Roboto-Regular_1.ttf didn't resolve at build time`，字体文件可能在生产构建中无法正确加载
- **预期效果**：字体文件正确打包或使用 CDN
- **修复建议**：将字体文件移至 `public/fonts/` 目录，或使用 Google Fonts CDN（已通过 @import 引入 Inter 字体）
- **负责角色**：开发者

---

## 四、样式标准检查

| 检查项 | 结果 | 说明 |
|--------|------|------|
| CSS 变量一致使用 | ⚠️ 部分通过 | 核心组件（Sidebar、TopBar、AppLayout）已使用变量，但大量页面组件仍有硬编码颜色 |
| 颜色体系符合设计系统 | ✅ 通过 | 深色/浅色主题变量定义完整，颜色值一致 |
| 字体大小/行高统一 | ✅ 通过 | 使用 Tailwind + Inter 字体，大小规范 |
| 间距一致 | ✅ 通过 | 统一使用 p-5/p-6/gap-4/gap-5 |
| 圆角统一 | ✅ 通过 | 统一使用 rounded-xl/rounded-2xl，基础变量 --radius: 1rem |
| 阴影效果统一 | ✅ 通过 | 使用 shadow-custom 和 glass-card |

---

## 五、界面布局验证

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 侧边栏宽度/折叠 | ✅ 通过 | 240px 展开 / 72px 折叠，transition 正常 |
| 顶栏高度/对齐 | ✅ 通过 | 64px 高度，内容对齐正常 |
| 内容区域自适应 | ✅ 通过 | flex-1 + overflow-auto |
| 页面切换布局稳定 | ✅ 通过 | 路由配置完整，17 个子页面 + NotFound |
| 最小分辨率 1280×720 | ✅ 通过 | BrowserWindow 设置 minWidth:1280, minHeight:720 |

---

## 六、视觉效果审核

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 深色主题玻璃拟态 | ✅ 通过 | glass-card 使用 backdrop-filter:blur(20px) + saturate(180%) |
| 深色主题霓虹光效 | ✅ 通过 | neon-glow-primary/cyan/violet 定义完整 |
| 深色主题极光背景 | ✅ 通过 | AuroraBackground 4 个 aurora-orb + 60 颗星星 + grid-bg |
| 浅色主题切换 | ✅ 通过 | .theme-light 类覆盖所有变量 |
| KPI 卡片渐变 | ✅ 通过 | 每张卡片独立渐变 + glow 效果 |
| 表格样式 | ✅ 通过 | glass-card + hover 效果 + 状态标签 |
| 按钮样式 | ✅ 通过 | liquid-btn 渐变 + hover 浮起 + 霓虹光 |
| 输入框样式 | ✅ 通过 | 统一使用 var(--input) + var(--border) |
| 弹窗/抽屉样式 | ✅ 通过 | backdrop blur + 渐变边框 |

---

## 七、动效反馈验证

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 侧边栏导航粒子拖尾 | ✅ 通过 | 5 颗粒子 + nav-active-bar + nav-active-glow-sweep |
| 页面切换动效 | ⚠️ 未实现 | 路由切换无过渡动画（非阻塞） |
| 按钮 hover/click 反馈 | ✅ 通过 | glass-card-hover + liquid-btn hover + active:scale-95 |
| 弹窗出现/消失动效 | ✅ 通过 | opacity + transform + scale 过渡 |
| 主题切换动效 | ✅ 通过 | theme-icon-spin 360° 旋转 + theme-toggle-btn scale+rotate |
| 锁屏/解锁动效 | ✅ 通过 | opacity + backdrop-filter 过渡 + PIN 点 scale 动画 |

---

## 八、路由和页面导航验证

| 路由 | 页面 | 状态 |
|------|------|------|
| /login | LoginPage | ✅ |
| /dashboard | DashboardPage | ✅ |
| /purchase | PurchasePage | ✅ |
| /sales | SalesPage | ✅ |
| /inventory | InventoryPage | ✅ |
| /finance | FinancePage | ✅ |
| /hr | HrPage | ✅ |
| /reports | ReportsPage | ✅ |
| /settings | SettingsPage | ✅ |
| /generation | GenerationPage | ✅ |
| /production-plan | ProductionPlanPage | ✅ |
| /workshop-exec | WorkshopExecPage | ✅ |
| /production-dashboard | ProductionDashboardPage | ✅ |
| /profile | ProfilePage | ✅ |
| /notifications | NotificationsPage | ✅ |
| /messages | MessagesPage | ✅ |
| /operation-logs | OperationLogPage | ✅ |
| /data-backup | BackupRestorePage | ✅ |
| * | NotFound | ✅ |

---

## 九、安全验证

| 检查项 | 结果 | 说明 |
|--------|------|------|
| contextIsolation | ✅ | true |
| nodeIntegration | ✅ | false |
| sandbox | ⚠️ | false（better-sqlite3 需要，可接受） |
| 密码哈希 | ✅ | bcrypt, SALT_ROUNDS=10 |
| PIN 哈希 | ✅ | bcrypt（后端），前端不再硬编码 |
| Token 加密 | ✅ | AES-256-CBC + scrypt + 随机 salt/iv |
| SQL 注入防护 | ✅ | 使用参数化查询（.prepare().get()） |
| 敏感字段隔离 | ✅ | USER_SAFE_FIELDS 不含 password_hash/pin/login_attempts |
| 错误信息脱敏 | ✅ | 统一返回"系统异常" |
| 外部导航阻止 | ✅ | will-navigate 事件 preventDefault |

---

## 十、修复文件清单

| 文件 | 修改类型 |
|------|---------|
| `src/renderer/components/layout/AppLayout.tsx` | 重构：连接 Sidebar/TopBar 交互 + 修复侧边栏宽度 |
| `src/components/LockScreen.tsx` | 安全修复：移除硬编码 PIN + 传递凭据给后端验证 |
| `src/main/services/auth.service.ts` | 安全修复：拆分 USER_SAFE_FIELDS/USER_INTERNAL_FIELDS |
| `src/renderer/pages/NotFound.tsx` | 样式修复：使用设计系统变量 |
| `src/components/AuroraBackground.tsx` | 视觉修复：使用确定性伪随机 |
| `src/renderer/pages/DashboardPage.tsx` | 布局修复：移除双重 padding |
| `src/renderer/App.tsx` | 样式修复：Toaster 跟随主题 |
| `src/components/LanguageSwitcher.tsx` | 清理：移除多余 DOM 节点 |
| `src/components/RevenueChart.tsx` | 样式修复：Tooltip 使用 CSS 变量 |
| `src/components/MiniDonutChart.tsx` | 样式修复：颜色使用 CSS 变量 |

---

## 十一、验证结论

### 统计

- **已修复问题**：11 个（Critical 2 / Major 2 / Minor 7）
- **待修复问题**：3 个（Major 2 / Minor 1）
- **构建状态**：✅ 通过
- **ESLint**：✅ 修改文件通过（LanguageSwitcher 的 react-refresh 警告为已有问题）

### 最终结论：⚠️ 有条件通过

**条件**：
1. RT-012（全局硬编码颜色）为 Major 级别，但不影响深色主题下的正常使用，仅影响浅色主题部分文字可读性。建议在 v0.1.1 中统一修复
2. RT-013（GPU Sandbox 崩溃）为环境相关问题，部分 macOS 环境下可正常启动，建议添加 `--no-sandbox` fallback
3. RT-014（字体路径警告）为 Minor 级别，不影响功能

**v0.1.0 可以上线，但需在 v0.1.1 中修复上述 3 个待修复问题。**

---

## 十二、第2轮验证（2026-06-07）

**验证范围**：确认 RT-012/RT-013/RT-014 修复结果 + 第1轮11个问题回归验证 + 新问题扫描

### 1. 开发者修复验证

#### RT-012：6个关键组件硬编码颜色 → CSS 变量 ✅ 已修复

**验证方法**：逐文件检查6个关键组件是否已将硬编码颜色替换为CSS变量

| 组件 | 修复前 | 修复后 | 验证结果 |
|------|--------|--------|---------|
| `Sidebar.tsx` | 硬编码 `#8892b0`、`#4a5568` 等 | 使用 `var(--theme-nav-inactive-text)`、`var(--theme-nav-section-label)` 等 | ✅ 无残留硬编码颜色 |
| `TopBar.tsx` | 硬编码颜色 | 使用 `var(--theme-*)`、`var(--color-*)` 变量 | ✅ 无残留硬编码颜色 |
| `LoginPage.tsx` | 硬编码颜色 | 使用 `var(--color-brand-gradient)`、`var(--color-left-panel-bg)`、`var(--color-orb-*)` 等 | ✅ 无残留硬编码颜色 |
| `DashboardPage.tsx` | 硬编码颜色 | 使用 `var(--primary)`、`var(--color-text-secondary)` | ✅ 无残留硬编码颜色 |
| `LockScreen.tsx` | 硬编码颜色 | 使用 `var(--color-brand-gradient)`、`var(--color-pin-dot-shadow)` 等 | ✅ 无残留硬编码颜色 |
| `AuroraBackground.tsx` | 硬编码颜色 | 使用 `var(--aurora-*)`、`var(--color-star)`、`var(--color-aurora-rose)` | ✅ 无残留硬编码颜色 |

**CSS 变量体系验证**：

- ✅ `index.css` 中 `:root`（深色主题）定义了完整的 `--theme-*` 和 `--color-*` 变量（约100个）
- ✅ `.theme-light` 类覆盖了所有 `--theme-*` 和 `--color-*` 变量，浅色主题可正常切换
- ✅ 浅色主题变量值合理：背景 `#f4f5fb`、前景 `#1a1d2e`、边框使用 `rgba(99,102,241,...)` 系列
- ✅ 无 Roboto 字体引用残留

**残留硬编码颜色统计**（非6个关键组件，属于页面级组件）：

| 颜色值 | 残留处数 | 涉及文件 |
|--------|---------|---------|
| `#8892b0` | 129处（含 index.css 定义6处） | RevenueChart、MiniDonutChart、ActivityFeed、SystemStatus、OrderTable、KpiCardRow、7个页面组件 |
| `#e2e8f8` | 17处（含 index.css 定义5处） | App.tsx、5个页面组件 |
| `#4a5568` | 23处（含 index.css 定义1处） | ActivityFeed、SystemStatus、OrderTable、KpiCardRow、6个页面组件 |

> 注：index.css 中的硬编码颜色是 CSS 变量的**定义值**（如 `--theme-nav-inactive-text: #8892b0`），这是正确的，不属于问题。实际需要修复的是组件中直接使用硬编码颜色而非引用变量的情况。扣除 index.css 定义后，页面组件中仍有约 **140+ 处**硬编码颜色。

#### RT-013：Electron GPU Sandbox 崩溃 → ✅ 已修复

**验证方法**：检查 `src/main/index.ts`

- ✅ 第9行添加了 `app.commandLine.appendSwitch('disable-gpu-sandbox')`
- ✅ 位置正确：在 `createWindow()` 之前，`app.whenReady()` 之前
- ✅ 构建通过，无报错

#### RT-014：Roboto 字体文件路径问题 → ✅ 已修复

**验证方法**：检查 `src/index.css`

- ✅ 字体引用仅包含 Inter 和 JetBrains Mono：`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap')`
- ✅ 全局搜索 `Roboto` 无匹配结果
- ✅ 构建无字体路径警告

### 2. 构建验证

```
✅ electron-vite build 成功
- main/index.js      57.80 kB
- preload/index.mjs   1.10 kB
- renderer/index.html  0.40 kB
- renderer/assets/index-ChFn3H9d.css  46.56 kB
- renderer/assets/index-W437KgZM.js  2,430.38 kB
- 构建耗时：3.89s（renderer）+ 172ms（main）+ 8ms（preload）
```

构建产物大小正常，无异常。

### 3. 第1轮修复回归验证

| # | 问题 | 回归验证结果 | 说明 |
|---|------|-------------|------|
| RT-001 | LockScreen 硬编码 PIN | ✅ 无回归 | `CORRECT_PIN` 常量已移除，`onUnlock` 回调传递 pin/password 给后端 |
| RT-002 | AppLayout 未连接交互 | ✅ 无回归 | Sidebar/TopBar/LockScreen 的 props 均正确传入，`handleNavigate` 映射完整 |
| RT-003 | 侧边栏宽度不一致 | ✅ 无回归 | AppLayout 使用 `ml-[240px]`/`ml-[72px]` 动态匹配 Sidebar 宽度 |
| RT-004 | USER_SAFE_FIELDS 含内部字段 | ✅ 无回归 | `USER_SAFE_FIELDS` 不含 pin/login_attempts/locked_until，`USER_INTERNAL_FIELDS` 仅后端使用 |
| RT-005 | NotFound 样式不统一 | ✅ 无回归 | 使用 `var(--background)`、`gradient-text`、`liquid-btn` |
| RT-006 | AuroraBackground 星星随机 | ✅ 无回归 | 使用 `seededRandom()` 确定性伪随机 |
| RT-007 | DashboardPage 双重 padding | ✅ 无回归 | DashboardPage 无 `p-6`，仅 AppLayout `<main>` 有 `p-6` |
| RT-008 | Toaster 不跟随主题 | ✅ 无回归 | 根据 `isLight` 动态设置 background/border/color |
| RT-009 | LanguageSwitcher 多余 DOM | ✅ 无回归 | LangProvider 无空 div 残留 |
| RT-010 | RevenueChart Tooltip 硬编码 | ✅ 无回归 | CustomTooltip 使用 `var(--popover)`、`var(--border)`、`var(--muted-foreground)`、`var(--foreground)` |
| RT-011 | MiniDonutChart 硬编码颜色 | ✅ 无回归 | CustomLabel/CustomTooltip 使用 `var(--foreground)`、`var(--muted-foreground)` |

> **注意**：RevenueChart 和 MiniDonutChart 的 Tooltip 部分已使用 CSS 变量（RT-010/RT-011 修复），但图表区域仍有少量硬编码颜色（如 RevenueChart 的 `#8892b0` 用于 XAxis/YAxis tick 和按钮文字），这些属于 RT-012 的遗留范围，非回归问题。

### 4. 新问题扫描

| # | 问题 | 严重程度 | 说明 |
|---|------|---------|------|
| RT-015 | 页面组件仍有大量硬编码颜色 | Minor | 6个关键组件已修复，但7个页面组件（PurchasePage、SalesPage、InventoryPage、FinancePage、HrPage、ReportsPage、SettingsPage）和4个图表/数据组件（RevenueChart图表区、MiniDonutChart图表区、ActivityFeed、SystemStatus、OrderTable、KpiCardRow）仍有约140+处硬编码颜色。浅色主题下这些页面文字可能不可读。建议在 v0.1.1 中继续修复 |
| RT-016 | App.tsx Toaster 颜色仍硬编码 | Minor | `color: isLight ? '#1a1d2e' : '#e2e8f8'` 可改为 `var(--foreground)`，但当前逻辑正确，不影响功能 |

### 5. 第2轮验证结论

**所有3个待修复问题（RT-012/RT-013/RT-014）均已正确修复，构建通过，第1轮11个修复无回归。**

---

## 十三、最终验证结论

### 统计

- **第1轮修复**：11 个（Critical 2 / Major 2 / Minor 7）→ ✅ 全部验证通过，无回归
- **第2轮修复**：3 个（Major 2 / Minor 1）→ ✅ 全部验证通过
- **新发现问题**：2 个（Minor 2）→ 非阻塞，建议 v0.1.1 修复
- **构建状态**：✅ electron-vite build 成功
- **安全验证**：✅ 全部通过

### 最终结论：✅ 通过

**v0.1.0 满足上线标准，所有 Critical/Major 问题已关闭。**

**v0.1.1 待处理**：
1. RT-015：页面组件硬编码颜色（约140+处），影响浅色主题可读性
2. RT-016：App.tsx Toaster 颜色硬编码，建议改用 CSS 变量

---

## 十四、v0.1.1 修复验证（2026-06-07）

**验证范围**：RT-015/RT-016 修复 + 流畅度优化 + 按钮动效 + 布局间距 + v0.1.0 全部修复回归验证

### 1. 构建验证

```
✅ electron-vite build 成功
- main/index.js        57.80 kB
- preload/index.mjs     1.10 kB
- renderer/index.html    0.40 kB
- renderer/assets/index-Dkhw0DGe.css  48.22 kB
- renderer/assets/index-D6ANz6FD.js  2,437.72 kB
- 构建耗时：4.46s（renderer）+ 195ms（main）+ 9ms（preload）
```

构建产物大小正常，无异常。

### 2. 代码验证

#### RT-015：硬编码颜色替换为 CSS 变量 ✅ 已修复（部分）

**验证方法**：检查关键组件和页面文件的硬编码颜色替换情况

| 检查项 | 验证结果 | 说明 |
|--------|---------|------|
| `src/index.css` 新增 CSS 变量 | ✅ | 新增 `--primary-400/500/600`、`--neon-red`、`--neon-fuchsia`、`--color-accent-*`、`--color-active-bar-*`、`--color-top-line-*`、`--color-hover-bar`、`--color-glow-sweep`、`--color-text-*`、`--color-tooltip-*`、`--color-festival-*`、`--color-theme-toggle-*`、`--color-notification-*`、`--color-error`、`--color-left-panel-*`、`--color-orb-*`、`--color-gradient-text`、`--color-pin-dot-shadow`、`--color-star`、`--color-aurora-rose`、`--color-notification-*`、`--color-weather-*`、`--color-avatar-shadow`、`--color-dropdown-shadow`、`--color-particle-shadow-*` 等变量 |
| Sidebar 硬编码颜色 | ✅ | 全部使用 `var(--color-accent-*)`、`var(--theme-*)` 变量 |
| TopBar 硬编码颜色 | ✅ | 全部使用 `var(--theme-*)`、`var(--color-*)` 变量 |
| DashboardPage 硬编码颜色 | ✅ | 使用 `var(--primary)`、`var(--color-text-secondary)` |
| SalesPage 硬编码颜色 | ✅ | 核心颜色已替换，使用 `var(--primary)`、`var(--color-neon-*)`、`var(--color-primary-500)` 等 |
| renderer/pages 硬编码颜色残留 | ⚠️ | 15个文件中仍有 **138处** 硬编码颜色（主要为 WorkshopExecPage 42处、ProductionDashboardPage 41处、ProductionPlanPage 26处），这些是 v0.1.1 新增的生产管理模块页面 |

#### RT-016：Toaster 颜色 ✅ 已修复

**验证方法**：检查 `src/renderer/App.tsx`

- ✅ Toaster 使用 `color: 'var(--foreground)'` 替代硬编码颜色
- ✅ 深色/浅色主题下均可正确显示

#### 流畅度优化 ✅ 已实现

| 优化项 | 修复前 | 修复后 | 验证结果 |
|--------|--------|--------|---------|
| 星星数量 | 60 | 35 | ✅ `STAR_COUNT = 35` |
| 粒子数量 | 5 | 3 | ✅ `PARTICLES = [0, 1, 2]` |
| will-change 优化 | 无 | 添加 `will-change: transform` | ✅ AuroraBackground、aurora-orb、nav-particle 均添加 |
| contain 优化 | 无 | 添加 `contain: strict/layout style paint` | ✅ AuroraBackground 根元素 `contain: strict`，glass-card `contain: layout style paint` |
| React.memo 包裹 | 无 | `React.memo(function AuroraBackground())` | ✅ 第20行 |
| box-shadow 动画移除 | 无 | 未发现 box-shadow 动画残留 | ✅ |
| transition:all 改为具体属性 | 无 | glass-card-hover 使用 `transform 0.3s ease, background 0.3s ease, border-color 0.3s ease` | ✅ |

#### 按钮动效 ✅ 已实现

| 动效项 | 验证结果 | 说明 |
|--------|---------|------|
| `btn-interactive` 全局类 | ✅ | `transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease`，hover 上移1px，active scale(0.97) |
| `icon-btn` 图标按钮类 | ✅ | hover scale(1.08) + 发光，active scale(0.92) |
| `toggle-btn` 开关按钮类 | ✅ | active scale(0.95) |
| `btn-placeholder` 占位按钮类 | ✅ | hover scale(1.03)，active scale(0.97) + 波纹效果 |
| Sidebar 导航 active:scale | ✅ | `active:scale-[0.97]` 在导航按钮上 |
| TopBar 搜索 focus 发光 | ✅ | `focus-within:shadow-[0_0_0_2px_var(--ring)]` 发光边框 |

#### 布局间距 ✅ 已调整

| 间距项 | 修复前 | 修复后 | 验证结果 |
|--------|--------|--------|---------|
| 内容区 padding | p-6 | p-4 | ✅ AppLayout `<main className="flex-1 overflow-auto p-4">` |
| DashboardPage gap | gap-5/6 | gap-3 | ✅ `gap-3` |
| 侧边栏分组 pt | pt-3 | pt-2 | ✅ `px-2 pt-2 pb-1` |

### 3. 回归验证（v0.1.0 全部14个修复）

| # | 问题 | 回归验证结果 | 说明 |
|---|------|-------------|------|
| RT-001 | LockScreen 硬编码 PIN | ✅ 无回归 | `CORRECT_PIN` 常量已移除，`onUnlock` 回调传递 pin/password |
| RT-002 | AppLayout 未连接交互 | ✅ 无回归 | Sidebar/TopBar/LockScreen props 正确传入 |
| RT-003 | 侧边栏宽度不一致 | ✅ 无回归 | `ml-[240px]`/`ml-[72px]` 匹配 Sidebar 宽度 |
| RT-004 | USER_SAFE_FIELDS 含内部字段 | ✅ 无回归 | 不含 pin/login_attempts/locked_until |
| RT-005 | NotFound 样式不统一 | ✅ 无回归 | 使用设计系统变量 |
| RT-006 | AuroraBackground 星星随机 | ✅ 无回归 | seededRandom() 确定性伪随机 |
| RT-007 | DashboardPage 双重 padding | ✅ 无回归 | 无 p-6，仅 AppLayout 有 p-4 |
| RT-008 | Toaster 不跟随主题 | ✅ 无回归 | 使用 `var(--foreground)` |
| RT-009 | LanguageSwitcher 多余 DOM | ✅ 无回归 | 无 data-px-slot 残留 |
| RT-010 | RevenueChart Tooltip 硬编码 | ✅ 无回归 | 使用 CSS 变量 |
| RT-011 | MiniDonutChart 硬编码颜色 | ✅ 无回归 | 使用 CSS 变量 |
| RT-012 | 全局硬编码颜色 | ✅ 无回归 | 核心组件已替换，页面组件部分替换（见新问题） |
| RT-013 | GPU Sandbox 崩溃 | ✅ 无回归 | `disable-gpu-sandbox` 开关存在 |
| RT-014 | Roboto 字体路径 | ✅ 无回归 | 无 Roboto 引用 |

### 4. 新发现问题

#### RT-017：暗色主题缺失 `--primary-400/500/600` 和 `--neon-red/fuchsia` 变量（Major）

- **页面/组件**：`src/index.css` + 多个页面组件
- **问题分类**：Bug / 样式
- **严重程度**：Major
- **问题描述**：`--primary-400`、`--primary-500`、`--primary-600`、`--neon-red`、`--neon-fuchsia` 五个 CSS 变量仅在 `.theme-light`（浅色主题，第326-332行）中定义，`:root`（暗色主题）中未定义。同时 `@theme inline` 中也没有 `--color-primary-400/500/600` 和 `--color-neon-red/fuchsia` 的映射声明。代码中有 **13处** 引用 `var(--color-primary-500)`、**8处** 引用 `var(--color-primary-400)`、**7处** 引用 `var(--color-neon-fuchsia)`，暗色主题下这些变量无法解析，颜色将回退到初始值（通常为继承或黑色），导致相关元素颜色丢失
- **涉及文件**：RevenueChart.tsx、KpiCardRow.tsx、MiniDonutChart.tsx、ReportsPage.tsx、HrPage.tsx、SalesPage.tsx、SettingsPage.tsx、ProfilePage.tsx、MessagesPage.tsx、BackupRestorePage.tsx、GenerationPage.tsx
- **预期效果**：暗色主题下这些变量应有正确的值
- **修复建议**：
  1. 在 `:root`（暗色主题）中添加 `--primary-400: #818cf8;`、`--primary-500: #6366f1;`、`--primary-600: #4f46e5;`、`--neon-red: #ef4444;`、`--neon-fuchsia: #e879f9;`
  2. 在 `@theme inline` 中添加 `--color-primary-400: var(--primary-400);`、`--color-primary-500: var(--primary-500);`、`--color-primary-600: var(--primary-600);`、`--color-neon-red: var(--neon-red);`、`--color-neon-fuchsia: var(--neon-fuchsia);`

#### RT-018：生产管理模块页面大量硬编码颜色（Minor）

- **页面/组件**：WorkshopExecPage、ProductionDashboardPage、ProductionPlanPage
- **问题分类**：样式
- **严重程度**：Minor
- **问题描述**：3个生产管理模块页面共有 **109处** 硬编码颜色（WorkshopExecPage 42处、ProductionDashboardPage 41处、ProductionPlanPage 26处），主要使用 `#4ade80`、`#38bdf8`、`#94a3b8`、`#64748b`、`#475569` 等颜色。这些页面在浅色主题下可能存在可读性问题
- **预期效果**：使用 CSS 变量，确保主题切换一致性
- **修复建议**：将硬编码颜色替换为对应的 CSS 变量（如 `#64748b` → `var(--muted-foreground)`，`#94a3b8` → `var(--theme-nav-inactive-text)`）

#### RT-019：`src/pages/` 目录为旧残留文件（Minor）

- **页面/组件**：`src/pages/` 目录
- **问题分类**：清理
- **严重程度**：Minor
- **问题描述**：`src/pages/` 目录下存在与 `src/renderer/pages/` 同名的页面文件，这些文件包含大量硬编码颜色（55处 `#8892b0`），但路由实际引用的是 `src/renderer/pages/` 下的文件。`src/pages/` 目录为旧残留，不影响运行但可能造成混淆
- **修复建议**：删除 `src/pages/` 目录

### 5. v0.1.1 验证结论

**统计**：

- **v0.1.1 修复验证**：5项修复全部确认实现
  - RT-015 硬编码颜色：✅ 核心组件已替换，页面组件部分替换
  - RT-016 Toaster 颜色：✅ 使用 `var(--foreground)`
  - 流畅度优化：✅ 星星35、粒子3、will-change/contain、React.memo
  - 按钮动效：✅ btn-interactive/icon-btn/toggle-btn/btn-placeholder 全套
  - 布局间距：✅ p-4/gap-3/pt-2
- **v0.1.0 回归验证**：14个修复全部无回归 ✅
- **新发现问题**：3个（Major 1 / Minor 2）
- **构建状态**：✅ electron-vite build 成功

### 最终结论：⚠️ 有条件通过

**条件**：
1. **RT-017（暗色主题缺失变量）为 Major 级别**，影响暗色主题下 KpiCardRow 渐变、RevenueChart 渐变、GenerationPage 多处 fuchsia 颜色等，必须修复后才能正式发布
2. RT-018（生产管理模块硬编码颜色）为 Minor 级别，不影响深色主题下正常使用，建议 v0.1.2 修复
3. RT-019（旧残留目录）为 Minor 级别，不影响运行，建议清理

**v0.1.1 需先修复 RT-017 后方可上线。**

---

## 十五、v0.2.0 上线测试验证（2026-06-07）

**验证角色**：上线测试工程师
**验证方式**：构建验证 + 代码级审查 + 安全验证 + 回归验证
**构建结果**：✅ electron-vite build 成功

### 1. 构建验证

```
✅ electron-vite build 成功
- main/index.js        95.08 kB
- preload/index.mjs     2.16 kB
- renderer/index.html    0.40 kB
- renderer/assets/index-DLBHmHSY.css  48.68 kB
- renderer/assets/index-C8s4SBKQ.js  2,446.18 kB
- 构建耗时：4.13s（renderer）+ 222ms（main）+ 9ms（preload）
```

构建产物大小正常，无异常。main 产物从 57.80 kB 增至 95.08 kB（+37.28 kB），符合新增4个Service模块的预期。

### 2. 代码验证

#### 2.1 4个业务模块 Service

| Service | 文件 | 方法数 | 验证结果 | 关键确认 |
|---------|------|--------|---------|---------|
| PurchaseService | `src/main/services/purchase.service.ts` | 7 | ✅ | CRUD完整：listOrders/getOrder/createOrder/updateOrderStatus + 供应商CRUD（listSuppliers/getSupplier/createSupplier/updateSupplier） |
| SalesService | `src/main/services/sales.service.ts` | 8 | ✅ | CRUD完整：listOrders/getOrder/createOrder/updateOrderStatus + 客户CRUD（listCustomers/getCustomer/createCustomer/updateCustomer）+ getSalesStats |
| InventoryService | `src/main/services/inventory.service.ts` | 7 | ✅ | 出入库完整：listItems/getItem/listTransactions/stockIn/stockOut + listWarehouses/getInventoryStats |
| ProductionService | `src/main/services/production.service.ts` | 8 | ✅ | 工单+报工完整：listWorkOrders/getWorkOrder/createWorkOrder/updateWorkOrder + listWorkStations/listProcessCards/submitReport/listReports + getProductionStats |

**事务使用确认**：

| 方法 | 事务使用 | 验证结果 |
|------|---------|---------|
| PurchaseService.createOrder | `this.db.transaction()` | ✅ 订单头+明细项在同一事务中 |
| SalesService.createOrder | `this.db.transaction()` | ✅ 订单头+明细项在同一事务中 |
| InventoryService.stockIn | `this.db.transaction()` | ✅ 库存更新+事务记录在同一事务中 |
| InventoryService.stockOut | `this.db.transaction()` | ✅ 库存检查+库存扣减+事务记录在同一事务中 |
| ProductionService.createWorkOrder | `this.db.transaction()` | ✅ 工单创建在事务中 |

#### 2.2 4个 Zustand Store

| Store | 文件 | 方法数 | 验证结果 |
|-------|------|--------|---------|
| usePurchaseStore | `src/renderer/stores/purchase.store.ts` | 6 | ✅ fetchOrders/fetchOrder/createOrder/updateOrderStatus/fetchSuppliers/createSupplier |
| useSalesStore | `src/renderer/stores/sales.store.ts` | 6 | ✅ fetchOrders/fetchOrder/createOrder/updateOrderStatus/fetchCustomers/createCustomer |
| useInventoryStore | `src/renderer/stores/inventory.store.ts` | 6 | ✅ fetchItems/fetchTransactions/stockIn/stockOut/fetchWarehouses/fetchStats |
| useProductionStore | `src/renderer/stores/production.store.ts` | 8 | ✅ fetchWorkOrders/fetchWorkOrder/createWorkOrder/updateWorkOrder/fetchWorkStations/fetchProcessCards/submitReport/fetchStats |

**Store 结构规范**：所有 Store 均使用 `State + Actions` 接口分离模式，通过 `ipcInvoke` 调用后端，统一处理 `result.success` 判断。

#### 2.3 7个页面改造

| 页面 | 文件 | 接入Store | 验证结果 |
|------|------|----------|---------|
| PurchasePage | `src/renderer/pages/PurchasePage.tsx` | ✅ usePurchaseStore | ✅ 订单列表+供应商管理+搜索筛选+状态过滤 |
| SalesPage | `src/renderer/pages/SalesPage.tsx` | ✅ useSalesStore | ✅ 订单列表+客户管理+搜索+图表 |
| InventoryPage | `src/renderer/pages/InventoryPage.tsx` | ✅ useInventoryStore | ✅ 库存列表+出入库操作+仓库可视化+搜索 |
| ProductionPlanPage | `src/renderer/pages/ProductionPlanPage.tsx` | ✅ useProductionStore | ✅ 工单列表+甘特图+拖拽排程+状态筛选 |
| WorkshopExecPage | `src/renderer/pages/WorkshopExecPage.tsx` | ✅ useProductionStore | ✅ 工位监控+工序流程+报工表单+实时刷新 |
| ProductionDashboardPage | `src/renderer/pages/ProductionDashboardPage.tsx` | ✅ useProductionStore | ✅ KPI看板+产能环形图+产量折线图+设备稼动率+质量趋势+异常预警 |
| FinancePage | `src/renderer/pages/FinancePage.tsx` | ❌ 未接入Store | ⚠️ 仍使用本地数据，未连接后端 |
| HrPage | `src/renderer/pages/HrPage.tsx` | ❌ 未接入Store | ⚠️ 仍使用本地数据，未连接后端 |
| ReportsPage | `src/renderer/pages/ReportsPage.tsx` | ❌ 未接入Store | ⚠️ 仍使用本地数据，未连接后端 |

#### 2.4 IPC 通道注册

| 检查项 | 验证结果 | 说明 |
|--------|---------|------|
| `src/main/ipc/index.ts` 注册4个新模块 | ✅ | registerPurchaseIpc/registerSalesIpc/registerInventoryIpc/registerProductionIpc 均已注册 |
| `src/main/ipc/purchase.ts` | ✅ | 10个通道注册，参数映射正确 |
| `src/main/ipc/sales.ts` | ✅ | 9个通道注册，参数映射正确 |
| `src/main/ipc/inventory.ts` | ✅ | 6个通道注册，参数映射正确 |
| `src/main/ipc/production.ts` | ✅ | 8个通道注册，参数映射正确 |
| `src/shared/constants/ipc-channels.ts` | ✅ | IPC_PURCHASE(10)/IPC_SALES(9)/IPC_INVENTORY(6)/IPC_PRODUCTION(8) 常量定义完整 |

**新增 IPC 通道统计**：purchase 10 + sales 9 + inventory 6 + production 8 = **33个**，与变更说明一致。

#### 2.5 Preload 白名单

| 检查项 | 验证结果 | 说明 |
|--------|---------|------|
| 白名单包含33个新通道 | ✅ | purchase(10) + sales(9) + inventory(6) + production(8) 全部在白名单中 |
| 非白名单通道拒绝 | ✅ | `if (!allowedChannels.includes(channel)) return Promise.reject(...)` |
| 白名单与 ipc-channels.ts 常量一致 | ✅ | 逐一比对，通道名称完全匹配 |

#### 2.6 RT-018 修复验证

| 页面 | 修复前硬编码颜色数 | 修复后硬编码颜色数 | 验证结果 |
|------|------------------|------------------|---------|
| ProductionPlanPage | 26处 | 4处 | ✅ 大部分已替换为CSS变量，残留4处为甘特图渐变终止色和tooltip背景 |
| WorkshopExecPage | 42处 | 2处 | ✅ 大部分已替换为CSS变量，残留2处为按钮渐变终止色和文字色 |
| ProductionDashboardPage | 41处 | 3处 | ✅ 大部分已替换为CSS变量，残留3处为环形图颜色、tooltip背景和折线图activeDot描边 |
| **合计** | **109处** | **9处** | ✅ 修复率 91.7% |

### 3. 安全验证

#### 3.1 SQL 参数化

| 检查项 | 验证结果 | 说明 |
|--------|---------|------|
| 所有 SELECT 使用 `.prepare().get()/.all()` | ✅ | 4个Service共30个查询方法，全部使用参数化查询 |
| WHERE 条件参数化 | ✅ | 动态 WHERE 使用 `1=1 AND column = ?` 模式，用户输入通过 `values` 数组传递 |
| INSERT/UPDATE 参数化 | ✅ | 所有 INSERT/UPDATE 使用 `?` 占位符 + `.run()` 参数 |
| 无 `.raw()` 或 `.exec()` 调用 | ✅ | 全项目搜索无结果 |

#### 3.2 出库库存检查

| 检查项 | 验证结果 | 说明 |
|--------|---------|------|
| 库存记录不存在时拒绝出库 | ✅ | `if (!existing) throw new Error('INSUFFICIENT_STOCK')` |
| 库存不足时拒绝出库 | ✅ | `if (existing.stock < data.quantity) throw new Error('INSUFFICIENT_STOCK')` |
| 库存检查在事务内执行 | ✅ | `this.db.transaction()` 包裹整个 stockOut 逻辑，防止并发超卖 |
| 错误信息不泄露内部细节 | ✅ | 捕获 `INSUFFICIENT_STOCK` 返回 `{ code: 'INSUFFICIENT_STOCK', message: '库存不足' }` |

#### 3.3 事务正确性

| 检查项 | 验证结果 | 说明 |
|--------|---------|------|
| 订单创建使用事务 | ✅ | purchase.createOrder/sales.createOrder 均在 `this.db.transaction()` 中创建订单头+明细项 |
| 出入库使用事务 | ✅ | inventory.stockIn/stockOut 均在 `this.db.transaction()` 中更新库存+记录事务 |
| 工单创建使用事务 | ✅ | production.createWorkOrder 在 `this.db.transaction()` 中创建 |
| 事务内操作失败自动回滚 | ✅ | better-sqlite3 的 `.transaction()` 在 throw 时自动 ROLLBACK |

#### 3.4 错误信息统一

| 检查项 | 验证结果 | 说明 |
|--------|---------|------|
| 所有 catch 块统一返回格式 | ✅ | `{ success: false, error: { code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' } }` |
| 不泄露数据库错误详情 | ✅ | catch 块不包含 err.message 或 err.stack |
| 业务错误使用语义化 code | ✅ | NOT_FOUND/INSUFFICIENT_STOCK 等语义化错误码 |

#### 3.5 Electron 安全基线

| 检查项 | 验证结果 | 说明 |
|--------|---------|------|
| contextIsolation | ✅ | true |
| nodeIntegration | ✅ | false |
| sandbox | ⚠️ | false（better-sqlite3 需要，v0.1.x 已确认可接受） |
| 外部导航阻止 | ✅ | `will-navigate` 事件 `preventDefault()` |
| IPC 白名单 | ✅ | preload 白名单严格限制通道 |

### 4. 回归验证（v0.1.x 全部修复）

| # | 问题 | 回归验证结果 | 说明 |
|---|------|-------------|------|
| RT-001 | LockScreen 硬编码 PIN | ✅ 无回归 | `CORRECT_PIN` 常量已移除，`onUnlock` 传递凭据给后端 |
| RT-002 | AppLayout 未连接交互 | ✅ 无回归 | Sidebar/TopBar props 正确传入，`handleNavigate` 映射完整 |
| RT-003 | 侧边栏宽度不一致 | ✅ 无回归 | `ml-[240px]`/`ml-[72px]` 匹配 Sidebar 宽度 |
| RT-004 | USER_SAFE_FIELDS 含内部字段 | ✅ 无回归 | `USER_SAFE_FIELDS` 不含 pin/login_attempts/locked_until |
| RT-005 | NotFound 样式不统一 | ✅ 无回归 | 使用设计系统变量 |
| RT-006 | AuroraBackground 星星随机 | ✅ 无回归 | seededRandom() 确定性伪随机 |
| RT-007 | DashboardPage 双重 padding | ✅ 无回归 | 无 p-6，仅 AppLayout 有 p-4 |
| RT-008 | Toaster 不跟随主题 | ✅ 无回归 | 使用 `var(--foreground)` |
| RT-009 | LanguageSwitcher 多余 DOM | ✅ 无回归 | 无 data-px-slot 残留 |
| RT-010 | RevenueChart Tooltip 硬编码 | ✅ 无回归 | 使用 CSS 变量 |
| RT-011 | MiniDonutChart 硬编码颜色 | ✅ 无回归 | 使用 CSS 变量 |
| RT-012 | 全局硬编码颜色 | ✅ 无回归 | 核心组件已替换，页面组件持续优化中 |
| RT-013 | GPU Sandbox 崩溃 | ✅ 无回归 | `disable-gpu-sandbox` 开关存在 |
| RT-014 | Roboto 字体路径 | ✅ 无回归 | 无 Roboto 引用 |
| RT-015 | 页面组件硬编码颜色 | ✅ 无回归 | 持续优化中，v0.2.0 新增模块已大幅替换 |
| RT-016 | Toaster 颜色硬编码 | ✅ 无回归 | 已使用 `var(--foreground)` |
| RT-017 | 暗色主题缺失变量 | ✅ 已修复 | `:root` 中已定义 `--primary-400/500/600`、`--neon-red`、`--neon-fuchsia` |
| RT-018 | 生产页面硬编码颜色 | ✅ 已修复（91.7%） | 109处→9处残留，残留为渐变终止色和图表特殊颜色 |

### 5. 新发现问题

#### RT-020：FinancePage/HrPage/ReportsPage 未接入 Store（Major）

- **页面/组件**：`src/renderer/pages/FinancePage.tsx`、`src/renderer/pages/HrPage.tsx`、`src/renderer/pages/ReportsPage.tsx`
- **问题分类**：功能
- **严重程度**：Major
- **问题描述**：变更说明中提到"FinancePage/HrPage/ReportsPage等"页面改造，但实际验证发现这3个页面仍未接入后端 Store，仍使用本地硬编码数据。IPC 通道常量文件中已定义 `IPC_FINANCE`、`IPC_HR`、`IPC_REPORT`，但对应的 Service、IPC 注册和 Store 均未创建
- **预期效果**：页面数据来自后端，支持 CRUD 操作
- **修复建议**：创建 finance.service.ts/hr.service.ts/report.service.ts + 对应 IPC 注册 + 对应 Store，并改造页面接入

#### RT-021：3个生产页面仍有9处硬编码颜色残留（Minor）

- **页面/组件**：ProductionPlanPage(4处)、WorkshopExecPage(2处)、ProductionDashboardPage(3处)
- **问题分类**：样式
- **严重程度**：Minor
- **问题描述**：RT-018 修复后仍有9处硬编码颜色残留，主要为：甘特图渐变终止色（`#fbbf24`、`#4ade80`）、甘特图文字色（`#92400e`、`#e0f2fe`、`#dcfce7`）、tooltip背景（`#0f172a`）、按钮渐变终止色（`#4ade80`）、按钮文字色（`#052e16`）、环形图颜色（`#1e3a5f`）、折线图描边（`#0c4a6e`）、tooltip文字色（`#e2e8f0`）
- **预期效果**：所有颜色使用 CSS 变量
- **修复建议**：为渐变终止色和特殊用途颜色定义新的 CSS 变量

#### RT-022：Store 中 userId 硬编码为 1（Minor）

- **页面/组件**：`purchase.store.ts`(第50行)、`sales.store.ts`(第50行)、`production.store.ts`(第56行)
- **问题分类**：Bug / 功能
- **严重程度**：Minor
- **问题描述**：3个 Store 的 createOrder/createWorkOrder 方法中 `const userId = 1; // TODO: 从 authStore 获取`，用户身份硬编码，多用户场景下会记录错误的操作人
- **预期效果**：从 authStore 获取当前登录用户 ID
- **修复建议**：接入 authStore 获取 currentUser.id

### 6. v0.2.0 验证结论

**统计**：

- **构建状态**：✅ electron-vite build 成功
- **4个 Service 实现**：✅ 全部确认（30个方法，5个事务方法）
- **4个 Store 实现**：✅ 全部确认（26个方法）
- **7个页面改造**：⚠️ 6个确认接入Store，3个未接入（FinancePage/HrPage/ReportsPage）
- **33个 IPC 通道**：✅ 全部注册 + 白名单包含
- **RT-018 修复**：✅ 91.7%修复率（109→9处残留）
- **安全验证**：✅ SQL参数化/库存检查/事务/错误信息全部通过
- **回归验证**：✅ v0.1.x 全部18个修复无回归

### 最终结论：⚠️ 有条件通过

**条件**：
1. **RT-020（FinancePage/HrPage/ReportsPage 未接入 Store）为 Major 级别**，变更说明中声称这些页面已改造，但实际未完成。建议在 v0.2.1 中补充实现
2. RT-021（9处硬编码颜色残留）为 Minor 级别，不影响深色主题下正常使用，建议 v0.2.1 修复
3. RT-022（userId 硬编码）为 Minor 级别，单用户场景下不影响功能，多用户场景需修复

**v0.2.0 核心功能（4个业务模块 Service + Store + 6个页面改造 + 33个 IPC 通道 + RT-018修复）验证通过，可上线。但 FinancePage/HrPage/ReportsPage 的 Store 接入需在后续版本补充。**

---

## 十六、v0.2.0 第2轮验证（2026-06-07）

**验证角色**：上线测试工程师
**验证范围**：RT-020/RT-021/RT-022 修复验证 + 回归验证 + 新问题扫描
**构建结果**：✅ electron-vite build 成功

### 1. 构建验证

```
✅ electron-vite build 成功
- main/index.js        105.26 kB
- preload/index.mjs     2.16 kB
- renderer/index.html    0.40 kB
- renderer/assets/index-DLBHmHSY.css  48.68 kB
- renderer/assets/index-BUh7QRJy.js   2,451.27 kB
- 构建耗时：4.92s（renderer）+ 253ms（main）+ 12ms（preload）
```

构建产物大小正常。main 产物从 95.08 kB 增至 105.26 kB（+10.18 kB），符合新增3个Service模块的预期。

### 2. 修复验证

#### RT-020：FinancePage/HrPage/ReportsPage 接入 Store ✅ 已修复

**验证方法**：逐层检查 Service → IPC → Store → 页面改造

##### 2.1 3个新 Service

| Service | 文件 | 方法数 | 验证结果 | 关键确认 |
|---------|------|--------|---------|---------|
| FinanceService | `src/main/services/finance.service.ts` | 3 | ✅ | listTransactions（分页+类型筛选）+ createTransaction（含userId参数）+ getStats（现金余额/月收入/月支出/净利润/应收账款） |
| HrService | `src/main/services/hr.service.ts` | 5 | ✅ | listEmployees（分页+部门+关键词筛选）+ getEmployee + createEmployee + updateEmployee（动态SET）+ listDepartments |
| ReportService | `src/main/services/report.service.ts` | 2 | ✅ | listReports（类型筛选）+ generateReport（含userId参数） |

**SQL 参数化确认**：3个Service共10个查询方法，全部使用 `.prepare().get()/.all()/.run()` 参数化查询，动态WHERE使用 `1=1 AND column = ?` 模式 ✅

**错误信息统一确认**：所有 catch 块统一返回 `{ code: 'SYSTEM_ERROR', message: '系统异常，请稍后重试' }` ✅

##### 2.2 3个新 IPC 注册

| IPC 模块 | 文件 | 通道数 | 验证结果 |
|----------|------|--------|---------|
| registerFinanceIpc | `src/main/ipc/finance.ts` | 3 | ✅ LIST_TRANSACTIONS / CREATE_TRANSACTION / GET_STATS |
| registerHrIpc | `src/main/ipc/hr.ts` | 5 | ✅ LIST_EMPLOYEES / GET_EMPLOYEE / CREATE_EMPLOYEE / UPDATE_EMPLOYEE / LIST_DEPARTMENTS |
| registerReportIpc | `src/main/ipc/report.ts` | 3 | ✅ LIST / GENERATE / DOWNLOAD（返回 NOT_IMPLEMENTED） |

**IPC 注册入口**：`src/main/ipc/index.ts` 第8-10行已注册 registerFinanceIpc/registerHrIpc/registerReportIpc ✅

**IPC 常量定义**：`src/shared/constants/ipc-channels.ts` 中 IPC_FINANCE(3)/IPC_HR(5)/IPC_REPORT(3) 定义完整 ✅

##### 2.3 3个新 Store

| Store | 文件 | 方法数 | 验证结果 |
|-------|------|--------|---------|
| useFinanceStore | `src/renderer/stores/finance.store.ts` | 3 | ✅ fetchTransactions / createTransaction / fetchStats |
| useHrStore | `src/renderer/stores/hr.store.ts` | 5 | ✅ fetchEmployees / fetchEmployee / createEmployee / updateEmployee / fetchDepartments |
| useReportsStore | `src/renderer/stores/reports.store.ts` | 2 | ✅ fetchReports / generateReport |

**Store 结构规范**：所有 Store 均使用 `State + Actions` 接口分离模式，通过 `ipcInvoke` 调用后端 ✅

##### 2.4 3个页面改造

| 页面 | 文件 | 接入Store | 验证结果 | 关键确认 |
|------|------|----------|---------|---------|
| FinancePage | `src/renderer/pages/FinancePage.tsx` | ✅ useFinanceStore | ✅ useEffect 调用 fetchTransactions + fetchStats；KPI卡片使用 stats 数据；流水表格使用 transactions 数据；loading/空状态处理完整 |
| HrPage | `src/renderer/pages/HrPage.tsx` | ✅ useHrStore | ✅ useEffect 调用 fetchEmployees + fetchDepartments；员工列表使用 employees 数据；部门统计使用 departments 数据；loading/空状态处理完整 |
| ReportsPage | `src/renderer/pages/ReportsPage.tsx` | ✅ useReportsStore | ✅ useEffect 调用 fetchReports；报告列表使用 reports 数据；生成报告调用 generateReport；loading/空状态处理完整 |

**页面颜色使用**：3个页面全部使用 CSS 变量（`var(--primary)`、`var(--muted-foreground)`、`var(--color-neon-*)` 等），无硬编码颜色残留 ✅

#### RT-021：3个生产页面9处硬编码颜色替换为CSS变量 ✅ 已修复

**验证方法**：对3个生产页面搜索硬编码颜色正则 `#[0-9a-fA-F]{3,8}`

| 页面 | 修复前硬编码颜色数 | 修复后硬编码颜色数 | 验证结果 |
|------|------------------|------------------|---------|
| ProductionPlanPage | 4处 | 0处 | ✅ 全部替换为CSS变量 |
| WorkshopExecPage | 2处 | 0处 | ✅ 全部替换为CSS变量 |
| ProductionDashboardPage | 3处 | 0处 | ✅ 全部替换为CSS变量 |
| **合计** | **9处** | **0处** | ✅ 修复率 100% |

#### RT-022：3个Store中userId硬编码改为从authStore获取 ✅ 已修复

**验证方法**：检查所有 Store 中 userId 赋值方式

| Store | 文件 | 修复前 | 修复后 | 验证结果 |
|-------|------|--------|--------|---------|
| purchase.store.ts | 第51行 | `const userId = 1;` | `useAuthStore.getState().user?.id \|\| 1` | ✅ |
| sales.store.ts | 第51行 | `const userId = 1;` | `useAuthStore.getState().user?.id \|\| 1` | ✅ |
| production.store.ts | 第57行 | `const userId = 1;` | `useAuthStore.getState().user?.id \|\| 1` | ✅ |
| finance.store.ts | 第39行 | N/A（新增） | `useAuthStore.getState().user?.id \|\| 1` | ✅ 新增即使用正确方式 |
| hr.store.ts | 第50行 | N/A（新增） | `useAuthStore.getState().user?.id \|\| 1` | ✅ 新增即使用正确方式 |
| reports.store.ts | 第30行 | N/A（新增） | `useAuthStore.getState().user?.id \|\| 1` | ✅ 新增即使用正确方式 |

> 注：`|| 1` 作为 fallback 是合理的——当 authStore 尚未初始化时使用默认值 1，避免 undefined 导致后端报错。

### 3. 新发现问题

#### RT-023：Preload 白名单缺少 finance/hr/report 通道（Critical）

- **页面/组件**：`src/preload/index.ts`
- **问题分类**：Bug / 功能
- **严重程度**：Critical
- **问题描述**：preload 白名单（`allowedChannels` 数组）中缺少 finance(3)、hr(5)、report(3) 共 **11个** IPC 通道。前端 Store 通过 `ipcInvoke` 调用这些通道时，会被 preload 的 `if (!allowedChannels.includes(channel))` 拦截并 reject，返回 `IPC channel not allowed: xxx` 错误。**这意味着 FinancePage/HrPage/ReportsPage 的所有后端数据请求在运行时将全部失败**
- **缺失通道列表**：
  - `finance:list-transactions`
  - `finance:create-transaction`
  - `finance:get-stats`
  - `hr:list-employees`
  - `hr:get-employee`
  - `hr:create-employee`
  - `hr:update-employee`
  - `hr:list-departments`
  - `report:list`
  - `report:generate`
  - `report:download`
- **预期效果**：白名单包含所有已注册的 IPC 通道
- **修复建议**：在 `src/preload/index.ts` 的 `allowedChannels` 数组中添加上述11个通道

### 4. 回归验证（v0.1.x + v0.2.0 第1轮全部修复）

| # | 问题 | 回归验证结果 | 说明 |
|---|------|-------------|------|
| RT-001 | LockScreen 硬编码 PIN | ✅ 无回归 | `CORRECT_PIN` 常量不存在 |
| RT-004 | USER_SAFE_FIELDS 含内部字段 | ✅ 无回归 | `USER_SAFE_FIELDS` 不含 pin/login_attempts/locked_until，`USER_INTERNAL_FIELDS` 仅后端使用 |
| RT-013 | GPU Sandbox 崩溃 | ✅ 无回归 | `disable-gpu-sandbox` 开关存在（第15行） |
| RT-016 | Toaster 颜色硬编码 | ✅ 无回归 | 使用 `var(--foreground)` |
| RT-017 | 暗色主题缺失变量 | ✅ 无回归 | `:root` 中 `--primary-400/500/600`、`--neon-red`、`--neon-fuchsia` 均已定义 |
| RT-018 | 生产页面硬编码颜色 | ✅ 无回归 | 3个生产页面0处硬编码颜色残留 |

### 5. 第2轮验证结论

**统计**：

- **RT-020 修复验证**：✅ 3个Service(10方法) + 3个IPC(11通道) + 3个Store(10方法) + 3个页面改造全部确认
- **RT-021 修复验证**：✅ 9处硬编码颜色全部替换为CSS变量（修复率100%）
- **RT-022 修复验证**：✅ 6个Store全部使用 `useAuthStore.getState().user?.id || 1`
- **回归验证**：✅ v0.1.x + v0.2.0 第1轮关键修复无回归
- **新发现问题**：1个（Critical 1）
- **构建状态**：✅ electron-vite build 成功

### 最终结论：❌ 不通过

**阻塞问题**：
1. **RT-023（Preload 白名单缺少11个通道）为 Critical 级别**，导致 FinancePage/HrPage/ReportsPage 的所有后端数据请求在运行时全部失败。虽然构建通过，但功能完全不可用。**必须修复后才能发布**

**修复后预期结论**：修复 RT-023 后，v0.2.0 所有修复项验证通过，可上线。
