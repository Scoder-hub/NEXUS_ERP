# TASK-002: 工艺路线设计器 — 设计文档

> 版本: v1.0
> 日期: 2026-07-10
> 角色: UX 设计师 + 架构师（并行输出）

---

# 第一部分：UX 交互设计

## 1. 信息架构

### 1.1 导航入口

在 App 顶部导航栏"生产"和"库存"之间新增 **"工艺"** 按钮：

```
[总览] [生产] [工艺] [库存] [质量] [设备]
```

- 点击"工艺"进入工艺路线列表页（默认视图）
- 列表页中点击"新建路线"或"编辑"进入画布编辑器
- 画布编辑器为独立页面视图，非弹窗

### 1.2 页面清单

| 页面 | 路径概念 | 用途 |
|------|---------|------|
| 工艺路线列表 | 列表页 | 浏览、搜索、筛选、新建、删除路线 |
| 画布编辑器 | 编辑页 | 拖拽设计工艺路线流程图 |
| 路线详情（只读） | 查看页 | 查看已发布路线，不可编辑 |

### 1.3 页面流转图

```
[导航栏"工艺"] → [路线列表页]
                      ├── 点击"新建" → [画布编辑器]（空画布）
                      ├── 点击路线卡片"编辑" → [画布编辑器]（加载已有路线）
                      └── 点击已发布路线"查看" → [路线详情页]（只读）
```

---

## 2. 画布编辑器布局

### 2.1 三栏布局

```
┌─────────────────────────────────────────────────────┐
│  ← 返回列表   工艺路线设计器   保存(Ctrl+S)  [发布]  │ ← 顶栏
├──────────┬──────────────────────────┬───────────────┤
│          │                          │               │
│  工序库   │      画布区域            │  节点参数     │
│  ─────── │   (React Flow)          │  编辑面板     │
│  □ 制泥   │                          │               │
│  □ 成型   │   ┌────┐    ┌────┐      │  (选中节点    │
│  □ 修坯   │   │制泥│───→│成型│      │   时显示)     │
│  □ 上釉   │   └────┘    └────┘      │               │
│  □ 烧成   │         ↘              │  工序: 成型    │
│  □ 胶装   │         ┌────┐         │  责任人: 成型工│
│  □ 试验   │         │修坯│         │  工时: 30 min  │
│  □ 包装   │         └────┘         │  温度: ___ ℃   │
│          │                          │               │
│  ─────── │     + 添加终点           │  [确认] [取消] │
│  [自定义] │                          │               │
│          │                          │               │
├──────────┴──────────────────────────┴───────────────┤
│  状态栏: 草稿 · 节点: 4 · 未保存变更                │
└─────────────────────────────────────────────────────┘
```

### 2.2 各区域说明

| 区域 | 宽度 | 功能 |
|------|------|------|
| **工序库面板（左）** | 220px | 列出所有工序，可拖拽到画布 |
| **画布区域（中）** | 自适应（flex:1） | React Flow 画布，用于设计流程图 |
| **参数面板（右）** | 320px | 选中节点后显示该节点的参数编辑表单 |
| **顶栏** | 全宽 48px | 返回按钮、标题、保存按钮、发布按钮、路线状态标签 |
| **状态栏** | 全宽 28px | 显示当前路线状态、节点/边数量、保存状态 |

---

## 3. 工序库面板（左侧）

### 3.1 设计要点

- **标题区**：显示"工序库"，右侧有搜索图标（点击展开搜索框）
- **分组标题**：分为"标准工序"和"自定义工序"两组
- **工序列表**：每项为一行，显示工序名称 + 工序编号 + 拖拽手柄图标
- **交互**：鼠标按住拖拽手柄或整个行，拖拽到画布生成节点
- **空状态**：自定义工序无数据时显示"暂无自定义工序"
- **搜索**：输入关键词实时过滤工序列表

### 3.2 工序项展示

```
┌──────────────────────────┐
│ 🔍 搜索工序              │ ← 搜索框（展开时显示）
├──────────────────────────┤
│  标准工序                │ ← 分组标题
│  ┌────────────────────┐ │
│  │ ☰ 01 制泥         │ │ ← 可拖拽
│  │ ☰ 02 成型         │ │
│  │ ☰ 03 修坯         │ │
│  │ ☰ 04 上釉         │ │
│  │ ☰ 05 烧成         │ │
│  │ ☰ 06 胶装         │ │
│  │ ☰ 07 试验         │ │
│  │ ☰ 08 包装         │ │
│  └────────────────────┘ │
├──────────────────────────┤
│  自定义工序              │ ← 分组标题
│  ┌────────────────────┐ │
│  │ （暂无）           │ │ ← 空状态提示
│  └────────────────────┘ │
└──────────────────────────┘
```

---

## 4. 节点设计

### 4.1 节点状态与样式

每个工艺节点有 **7 种状态**，统一遵循 Design Token 语义色：

| 状态 | 视觉表现 | 场景 |
|------|---------|------|
| **default** | 白底蓝边框，工序名居中显示 | 正常放置到画布上 |
| **selected** | 蓝底白字，边框加粗+阴影（--color-primary-500） | 鼠标单击选中节点 |
| **hover** | 边框变蓝（--color-primary-300），微阴影 | 鼠标悬停 |
| **connecting** | 绿色边框（--color-success-500），脉动动画 | 正在拖拽连线，该节点为合法目标 |
| **invalid** | 红色边框（--color-error-500），警告图标 | 参数未配置完整/参数值越界 |
| **readonly** | 灰色背景（--color-neutral-100），无交互反馈 | 路线已发布，画布为只读模式 |
| **dragging** | 半透明（opacity: 0.7），跟随鼠标 | 节点正在被拖拽移动时 |

### 4.2 节点尺寸与内容

```
┌──────────────────────────┐
│       ⚙️ 成型           │ ← 工序图标 + 工序名称
│       ─────────          │
│       责任人: 成型工     │ ← 关键参数预览（最多显示2行）
│       工时: 30 min       │
│                          │
│  [输入] ───────── [输出] │ ← 连接端口（左右两侧）
└──────────────────────────┘
```

- **宽度**：180px（固定）
- **高度**：自适应（最少 80px，最大 150px）
- **圆角**：8px（--radius-md）
- **端口**：左侧为输入（隐藏），右侧为输出（hover 时显现），起/终点特殊处理

### 4.3 特殊节点

| 节点类型 | 图标 | 颜色 | 说明 |
|---------|------|------|------|
| **起点** | 🟢 | 绿色标识 | 圆形节点，仅输出端口 |
| **终点** | 🔴 | 红色标识 | 圆形节点，仅输入端口 |
| **工序节点** | ⚙️ | 蓝色标识 | 矩形节点，完整显示工序信息 |
| **质检节点** | 🔍 | 琥珀色标识 | 菱形节点（或特殊标识），2 个输出端口 |

> 注意：质检节点和并行分支节点延期到 v0.2，阶段一只实现工序节点+起点+终点

---

## 5. 连线设计

### 5.1 连线状态

| 状态 | 视觉 | 场景 |
|------|------|------|
| **default** | 灰色实线（--color-neutral-300），线宽 2px | 正常连接 |
| **hover** | 蓝色实线（--color-primary-400），线宽 3px | 鼠标悬停 |
| **selected** | 蓝色实线（--color-primary-500），线宽 3px，端点高亮 | 鼠标单击选中 |
| **creating** | 绿色虚线（--color-success-500），箭头跟随鼠标 | 正在拖拽创建新连线 |
| **invalid** | 红色虚线（--color-error-500），抖动动画 | 循环连接检测阻止 |
| **readonly** | 灰色实线（--color-neutral-200），不可交互 | 已发布路线 |

### 5.2 连线规则

- 使用 Smart Bezier 曲线路径
- 箭头终点指向目标节点
- 连线两端在端口位置显示小圆点
- 连线可选中后按 Delete 删除

---

## 6. 参数编辑面板（右侧）

### 6.1 面板行为

| 触发条件 | 面板行为 |
|---------|---------|
| 未选中任何节点 | 显示空状态提示："点击或双击节点编辑参数" |
| 选中一个工序节点 | 显示该工序的参数编辑表单 |
| 选中起点/终点 | 显示"起点/终点无需配置参数" |
| 选中连线 | 显示连线的简要信息（从→到） |
| 多选 | 显示"已选中 N 个节点" |
| 参数值超出安全范围 | 输入框变红 + 提示文字 |
| 必填参数为空 | 输入框显示"请填写此项"错误提示 |

### 6.2 参数编辑表单

```
┌──────────────────────────────┐
│  参数配置                    │
│  ──────────────────────────  │
│                              │
│  工序名称                    │
│  [ 成型                   ] │ ← 可编辑（仅自定义工序）
│                              │
│  责任人角色 *               │ ← 标*为必填
│  [ 成型工  ▼             ] │ ← 下拉选择
│                              │
│  标准工时（分钟/件）*       │
│  [ 30                     ] │ ← 数字输入，单位后缀
│                              │
│  参数模板                    │
│  [ 通用成型参数  ▼       ] │ ← 下拉选择模板
│                              │
│  ─── 模板参数 ───           │ ← 分隔线
│                              │
│  预热温度（℃）             │
│  [ 80                     ] │ ← 数字输入，带安全范围标注
│  (安全范围: 60~120℃)       │
│                              │
│  最高温度（℃）*            │
│  [ 1050                  ] │ ← 数字输入
│  (安全范围: 950~1200℃)     │
│                              │
│  保温时间（分钟）          │
│  [ 120                    ] │ ← 数字输入
│                              │
│  ──────────────────────────  │
│                              │
│  [ 确认 ]    [ 取消 ]       │
└──────────────────────────────┘
```

### 6.3 参数类型

| 类型 | 控件 | 验证规则 |
|------|------|---------|
| 文本 | Input | 非空校验（必填时），最大长度 50 |
| 数字 | Input[type=number] | 范围校验（安全上下限），禁止负数 |
| 选择 | Select/Dropdown | 单选，必填时必须有值 |
| 开关 | Toggle | 布尔值 |
| 多行文本 | Textarea | 最大长度 200 |

---

## 7. 路线列表页

### 7.1 列表布局

```
┌──────────────────────────────────────────────────────────┐
│  工艺路线                         [+ 新建路线]  [搜索]  │ ← 标题+操作栏
├──────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐│
│  │ 路线名称       状态    节点数   版本   更新日期  操作 ││ ← 表头
│  ├──────────────────────────────────────────────────────┤│
│  │ 10kV绝缘子...  ✅已发布  6     v1.2  07-08  [查看]  ││
│  │ 针式绝缘子...  📝草稿    4     v0.1  07-09  [编辑]  ││
│  │ ...                                                  ││
│  └──────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────┤
│  共 N 条                                                │ ← 分页/计数
└──────────────────────────────────────────────────────────┘
```

### 7.2 列表过滤与排序

- **状态筛选**：全部 / 草稿 / 待审核 / 已发布 / 已归档
- **搜索**：按路线名称关键词模糊搜索
- **排序**：按更新日期降序（默认）、按名称升序

### 7.3 路线状态展示

| 状态 | 标签颜色 | 操作按钮 |
|------|---------|---------|
| 草稿 | 灰色 | 编辑、删除 |
| 待审核 | 琥珀色 | 查看（只读） |
| 已发布 | 绿色 | 查看（只读）、新建版本 |
| 已归档 | 深灰色 | 查看（只读） |

---

## 8. 交互细节

### 8.1 拖拽交互流程

```
用户在左侧工序库按下工序项
  → 工序项跟随鼠标（半透明）
  → 拖拽到画布区域上方
  → 画布显示蓝色高亮提示"放置区域"
  → 松开鼠标
    ├── 在画布内松开 → 生成对应工序节点（居中偏下位置，自动偏移避免重叠）
    └── 在画布外松开 → 取消操作，工序项回到原位
```

### 8.2 连接交互流程

```
用户将鼠标移到节点右侧输出端口
  → 端口高亮变大 + 提示"拖拽连接"
  → 按下鼠标左键开始拖拽
  → 出现绿色虚线跟随鼠标
  → 拖到目标节点左侧输入端口上方
    ├── 合法目标 → 输入端口高亮绿色 → 松开 → 创建连线
    └── 非法目标（自身/已连接/形成循环）→ 端口变红 → 松开 → 阻止创建 + 提示"不能形成循环回路"
  → 在空白处松开 → 取消创建
```

### 8.3 保存交互流程

```
用户按 Ctrl+S 或点击保存按钮
  → 按钮变为"保存中..."（禁用态，加载动画）
  → 前端收集画布数据（节点+位置+连接+参数）
  → 通过 IPC 写入 SQLite
    ├── 成功 → 保存成功提示（绿色 toast，2s 自动消失）
    │         → 按钮恢复"保存"
    │         → 更新状态栏为"已保存"
    └── 失败 → 保存失败提示（红色 toast）
              → 自动备份到 localStorage
              → 按钮恢复"保存" + 显示"本地已备份"提示
```

### 8.4 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+S | 保存当前路线 |
| Ctrl+Z | 撤销上一步操作 |
| Ctrl+Shift+Z | 重做 |
| Delete/Backspace | 删除选中节点或连线 |
| Ctrl+A | 全选所有节点 |
| Ctrl+C / Ctrl+V | 复制粘贴节点 |
| 滚轮 | 缩放画布 |
| 空格+拖拽 | 平移画布（类似 Figma） |

---

## 9. 响应式与适配

- 最小窗口宽度：1024px（画布编辑器）
- 左侧工序库面板可折叠（点击折叠按钮变为仅图标）
- 右侧参数面板可折叠（点击 X 关闭，双击节点重新打开）
- 画布区域自适应填充剩余空间

---

## 10. 错误处理与异常状态

| 场景 | 用户看到什么 |
|------|------------|
| 数据库写入失败 | 红色 toast"保存失败，已备份到本地" + 底部状态栏显示"本地有未同步数据" |
| 画布加载失败 | 居中显示错误页面："加载失败，请重试" + 重试按钮 |
| 循环连接检测 | 连接创建被阻止 + 红色警示提示"操作被阻止：不能形成循环回路" |
| 参数值越界 | 输入框变红 + 字段下方显示"安全范围: X~Y" |
| 必填参数未填 | 保存时弹出提示"请完善标记 * 的必填参数" + 定位到第一个未填字段 |
| 网络断开 | 无影响（纯离线应用），如有同步需求显示离线标识 |

---

# 第二部分：技术设计（架构师）

## 1. 模块划分

```
src/
├── pages/
│   ├── RouteList/          # 工艺路线列表页
│   │   ├── index.tsx
│   │   ├── RouteTable.tsx
│   │   └── RouteTableRow.tsx
│   └── RouteEditor/        # 画布编辑器页
│       ├── index.tsx        # 三栏布局容器
│       ├── ProcessPanel.tsx # 左侧工序库面板
│       ├── CanvasView.tsx   # 中间画布（React Flow 封装）
│       ├── ParamPanel.tsx   # 右侧参数编辑面板
│       ├── nodes/           # 自定义节点
│       │   ├── ProcessNode.tsx   # 工序节点
│       │   ├── StartNode.tsx     # 起点节点
│       │   └── EndNode.tsx       # 终点节点
│       └── edges/           # 自定义连线
│           └── ProcessEdge.tsx
├── stores/
│   └── routeStore.ts        # 工艺路线状态管理（Zustand）
├── lib/
│   └── db/
│       ├── schema.ts        # Drizzle ORM Schema
│       ├── migrations/      # 数据库迁移文件
│       └── routeService.ts   # 路线 CRUD 操作（IPC handler 调用层）
├── hooks/
│   ├── useCanvas.ts         # 画布交互逻辑封装
│   ├── useProcessLibrary.ts # 工序库数据 hooks
│   └── useRouteParams.ts    # 参数编辑 hooks
├── components/
│   └── ui/                  # 通用 UI 组件
│       ├── Toast.tsx
│       ├── ConfirmDialog.tsx
│       └── StatusBadge.tsx
```

## 2. 数据模型（Drizzle ORM Schema）

### 2.1 `process_library`（标准工序库）

```typescript
// lib/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

/** 工序库表 — 存储标准/自定义工序定义 */
export const processLibrary = sqliteTable('process_library', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),           // 工序编号，如 'P01'
  name: text('name').notNull(),                     // 工序名，如 '制泥'
  nameEn: text('name_en'),                          // 英文名
  category: text('category').notNull().default('standard'), // standard | custom
  description: text('description'),                 // 工序说明
  icon: text('icon').default('gear'),               // 图标标识
  responsibleRole: text('responsible_role'),        // 默认责任人角色
  defaultParams: text('default_params'),             // 默认参数模板 JSON
  sortOrder: integer('sort_order').default(0),      // 排序序号
  isActive: integer('is_active').default(1),        // 1=启用 0=禁用
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})
```

### 2.2 `routes`（工艺路线主表）

```typescript
/** 工艺路线表 — 存储路线定义 */
export const routes = sqliteTable('routes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),                     // 路线名称
  version: text('version').notNull().default('v0.1'), // 版本号
  status: text('status').notNull().default('draft'), // draft | pending | published | archived
  snapshot: text('snapshot').notNull(),              // JSON 全量快照（包含 nodes + edges + params）
  nodeCount: integer('node_count').default(0),       // 节点数（冗余，便于列表展示）
  edgeCount: integer('edge_count').default(0),       // 连线数（冗余）
  createdBy: text('created_by').default('system'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  publishedAt: text('published_at'),                 // 发布时间
})
```

### 2.3 `route_history`（路线版本历史）

```typescript
/** 路线版本历史表 — 保存每次快照用于回溯 */
export const routeHistory = sqliteTable('route_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  routeId: integer('route_id').notNull().references(() => routes.id),
  version: text('version').notNull(),
  snapshot: text('snapshot').notNull(),
  changeDescription: text('change_description'),
  createdBy: text('created_by').default('system'),
  createdAt: text('created_at').notNull(),
})
```

### 2.4 JSON 快照结构

```typescript
/** 画布 JSON 快照类型定义 */
interface RouteSnapshot {
  nodes: RouteNode[]
  edges: RouteEdge[]
  viewport: { x: number; y: number; zoom: number }  // 画布视口状态
}

interface RouteNode {
  id: string                     // React Flow node id
  type: 'process' | 'start' | 'end'
  position: { x: number; y: number }
  data: {
    processId: number            // 关联 process_library.id
    name: string
    params: Record<string, any>  // 工艺参数键值对
    requiredParams: string[]     // 已配置的必填参数列表
    isValid: boolean             // 参数完整性校验
  }
}

interface RouteEdge {
  id: string                     // React Flow edge id
  source: string                 // 源节点 id
  target: string                 // 目标节点 id
  sourceHandle?: string
  targetHandle?: string
}
```

## 3. IPC 接口定义

### 3.1 工序库 IPC

```typescript
// electron/preload.ts → contextBridge.exposeInMainWorld('electronAPI', { ... })

interface ProcessLibraryAPI {
  /** 获取所有启用的工序 */
  getAll(): Promise<ProcessLibraryItem[]>
  
  /** 按分类获取工序 */
  getByCategory(category: 'standard' | 'custom'): Promise<ProcessLibraryItem[]>
  
  /** 搜索工序（按名称模糊匹配） */
  search(query: string): Promise<ProcessLibraryItem[]>
}

interface ProcessLibraryItem {
  id: number
  code: string
  name: string
  nameEn?: string
  category: 'standard' | 'custom'
  description?: string
  icon: string
  responsibleRole?: string
  defaultParams?: string  // JSON string
  sortOrder: number
  isActive: boolean
}
```

### 3.2 路线 IPC

```typescript
interface RouteAPI {
  /** 获取路线列表（支持过滤和分页） */
  list(params: {
    status?: string
    search?: string
    page?: number
    pageSize?: number
  }): Promise<{ items: RouteListItem[]; total: number }>
  
  /** 获取单条路线详情（含完整 snapshot） */
  getById(id: number): Promise<RouteDetail | null>
  
  /** 创建新路线 */
  create(data: { name: string }): Promise<RouteDetail>
  
  /** 保存路线（更新 snapshot） */
  save(id: number, data: {
    name?: string
    snapshot: string  // JSON string
    nodeCount: number
    edgeCount: number
  }): Promise<void>
  
  /** 发布路线（draft → published） */
  publish(id: number): Promise<void>
  
  /** 删除路线（仅草稿状态可删除） */
  delete(id: number): Promise<void>
  
  /** 新建版本（published → 新 draft 版本） */
  newVersion(id: number): Promise<RouteDetail>
}

interface RouteListItem {
  id: number
  name: string
  version: string
  status: string
  nodeCount: number
  edgeCount: number
  updatedAt: string
}

interface RouteDetail {
  id: number
  name: string
  version: string
  status: string
  snapshot: RouteSnapshot  // 解析后的 JSON
  nodeCount: number
  edgeCount: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
}
```

### 3.3 IPC 通道命名

```typescript
// 所有 IPC 通道使用统一命名空间
const IPC_CHANNELS = {
  // 工序库
  PROCESS_LIBRARY_GET_ALL: 'process-library:get-all',
  PROCESS_LIBRARY_GET_BY_CATEGORY: 'process-library:get-by-category',
  PROCESS_LIBRARY_SEARCH: 'process-library:search',
  
  // 路线
  ROUTE_LIST: 'route:list',
  ROUTE_GET_BY_ID: 'route:get-by-id',
  ROUTE_CREATE: 'route:create',
  ROUTE_SAVE: 'route:save',
  ROUTE_PUBLISH: 'route:publish',
  ROUTE_DELETE: 'route:delete',
  ROUTE_NEW_VERSION: 'route:new-version',
}
```

## 4. Zustand Store 结构

```typescript
// stores/routeStore.ts

interface RouteState {
  // ── 列表页状态 ──
  routeList: RouteListItem[]
  listLoading: boolean
  listFilter: { status?: string; search?: string }
  
  // ── 编辑器状态 ──
  currentRoute: RouteDetail | null
  editorLoading: boolean
  isDirty: boolean                           // 是否有未保存变更
  selectedNodeId: string | null
  
  // ── 工序库 ──
  processLibrary: ProcessLibraryItem[]
  libraryLoading: boolean
  
  // ── 画布状态（同步 React Flow 实例） ──
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  
  // ── Actions ──
  fetchRouteList: () => Promise<void>
  fetchRoute: (id: number) => Promise<void>
  createRoute: (name: string) => Promise<RouteDetail>
  saveRoute: () => Promise<void>
  publishRoute: () => Promise<void>
  deleteRoute: (id: number) => Promise<void>
  
  fetchProcessLibrary: () => Promise<void>
  
  addNode: (processId: number, position: { x: number; y: number }) => void
  removeSelected: () => void
  selectNode: (nodeId: string | null) => void
  
  resetEditor: () => void
}
```

## 5. 组件接口定义

### 5.1 核心组件 Props

```typescript
// ProcessPanel（左侧工序库面板）
interface ProcessPanelProps {
  library: ProcessLibraryItem[]
  loading: boolean
  onSearch: (query: string) => void
}

// CanvasView（中间画布）
interface CanvasViewProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onNodeClick: (nodeId: string) => void
  onNodeDoubleClick: (nodeId: string) => void
  onPaneClick: () => void
  readonly?: boolean
}

// ParamPanel（右侧参数面板）
interface ParamPanelProps {
  node: RouteNode | null          // 当前选中的节点
  processLibrary: ProcessLibraryItem[]
  onParamsChange: (nodeId: string, params: Record<string, any>) => void
  onClose: () => void
}

// ProcessNode（工序节点）
interface ProcessNodeProps {
  data: {
    name: string
    params?: Record<string, any>
    isValid: boolean
    selected?: boolean
  }
  selected: boolean
}
```

### 5.2 通用 UI 组件 Props

```typescript
interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number  // ms, 默认 2000
  onClose: () => void
}

interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

interface StatusBadgeProps {
  status: 'draft' | 'pending' | 'published' | 'archived'
  size?: 'sm' | 'md'
}
```

## 6. 初始化数据（标准工序库种子）

```typescript
// 应用首次启动时写入 8 道标准工序
const SEED_PROCESSES = [
  { code: 'P01', name: '制泥', nameEn: 'Clay Prep', category: 'standard',
    description: '配料、球磨、过筛、除铁、陈腐', icon: 'mud', sortOrder: 1,
    responsibleRole: '制泥工' },
  { code: 'P02', name: '成型', nameEn: 'Forming', category: 'standard',
    description: '旋坯/注浆/压制，形成胚体', icon: 'form', sortOrder: 2,
    responsibleRole: '成型工' },
  { code: 'P03', name: '修坯', nameEn: 'Trimming', category: 'standard',
    description: '修整胚体外形，挖修孔位', icon: 'trim', sortOrder: 3,
    responsibleRole: '修坯工' },
  { code: 'P04', name: '上釉', nameEn: 'Glazing', category: 'standard',
    description: '浸釉/喷釉，控制釉层厚度', icon: 'glaze', sortOrder: 4,
    responsibleRole: '上釉工' },
  { code: 'P05', name: '烧成', nameEn: 'Firing', category: 'standard',
    description: '窑炉烧制，控制温度曲线', icon: 'fire', sortOrder: 5,
    responsibleRole: '烧成工' },
  { code: 'P06', name: '胶装', nameEn: 'Cementing', category: 'standard',
    description: '铁帽胶装，水泥养护', icon: 'cement', sortOrder: 6,
    responsibleRole: '胶装工' },
  { code: 'P07', name: '试验', nameEn: 'Testing', category: 'standard',
    description: '工频耐压、机电破坏、热震试验', icon: 'test', sortOrder: 7,
    responsibleRole: '试验员' },
  { code: 'P08', name: '包装', nameEn: 'Packaging', category: 'standard',
    description: '检验分级、打包入库', icon: 'package', sortOrder: 8,
    responsibleRole: '包装工' },
]
```

## 7. 依赖分析

| 依赖 | 用途 | 版本约束 |
|------|------|---------|
| `@xyflow/react` ^12.0.0 | 画布引擎 | 已安装 |
| `zustand` ^5.0.0 | 状态管理 | 已安装 |
| `better-sqlite3` ^11.0.0 | SQLite 数据库 | 已安装 |
| `drizzle-orm` ^0.33.0 | ORM 层 | 需新增 |
| `drizzle-kit` ^0.22.0 | 迁移工具 | 需新增（dev） |
| `nanoid` ^5.0.0 | 节点/边 ID 生成 | 需新增 |

## 8. 安全审查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| SQL 注入 | ✅ 安全 | Drizzle ORM 参数化查询 |
| IPC 暴露 | ✅ 安全 | preload.ts 通过 contextBridge 白名单暴露 |
| 输入验证 | ✅ 设计覆盖 | 参数类型校验 + 范围校验 + 非空校验 |
| 数据完整性 | ✅ 设计覆盖 | DAG 循环检测 + 必填参数校验 |
| 并发写入 | ⚠️ 单用户桌面应用，无需处理 |
| 敏感数据 | ✅ 本地数据库，无用户敏感信息 |

## 9. 性能评估

| 场景 | 预期表现 | 优化策略 |
|------|---------|---------|
| 20 节点加载 | <100ms | JSON 快照直接反序列化 |
| 50 节点编辑 | 流畅（≥30fps） | React Flow 虚拟化渲染 |
| 保存/写入 | <50ms | 直接 SQLite INSERT/UPDATE |
| 参数编辑响应 | 即时 | 本地 Zustand store 无 IPC 调用 |

---

## 10. 影响范围

| 影响模块 | 修改内容 |
|---------|---------|
| `src/App.tsx` | 导航栏新增"工艺"按钮入口，注册路由 |
| `src/styles/global.css` | 新增画布编辑器相关样式 |
| `electron/main.ts` | 注册 IPC handlers |
| `electron/preload.ts` | 暴露新的 electronAPI 方法 |
| `package.json` | 新增 drizzle-orm、drizzle-kit、nanoid 依赖 |

---

# 第三部分：TASK-003 版本管理 — UX 交互设计

> 日期：2026-07-11
> 角色：UX 设计师
> 基于 PRD：TASK-003 工艺路线版本管理

---

## 1. 信息架构变更

### 1.1 新增页面/视图

| 视图 | 触发方式 | 用途 |
|------|---------|------|
| **版本历史弹窗** | 编辑器顶栏「历史版本」按钮 | 查看该路线全部历史版本 |
| **版本对比视图** | 历史弹窗中选择两个版本后点「对比」 | 并排展示两个版本的差异 |
| **保存确认弹窗** | 点击保存按钮时 | 输入变更说明后确认保存 |

### 1.2 页面流转图（新增流程）

```
[编辑器] → 点击「历史版本」→ [版本历史弹窗]
                       ├── 选中单版本 → 「回滚到此版本」 → [回滚确认弹窗] → [编辑器还原]
                       ├── 选中两个版本 → 「对比」 → [版本对比视图]
                       └── 关闭弹窗 → [编辑器]

[编辑器] → 点击「保存」 → [保存确认弹窗]（输入变更说明）
                       └── 确认保存 → 保存成功 Toast → [编辑器（清除dirty标记）]
```

---

## 2. 编辑器顶栏变更

### 2.1 新版顶栏布局

```
┌──────────────────────────────────────────────────────────────┐
│  ← 返回列表   工艺路线设计器 [已发布]  v0.3  [历史版本] [保存] [发布] │
│                        版本号标签↗        ↗新增按钮             │
└──────────────────────────────────────────────────────────────┘
```

| 新增/变更元素 | 说明 |
|-------------|------|
| **版本号标签** | 显示当前版本号 `v0.3`，位于状态标签右侧，灰色文字+小号字 |
| **「历史版本」按钮** | 独立按钮，位于保存按钮左侧，图标 `📋` + 文字 |
| **保存按钮升级** | 原来直接保存，现在点击弹出「保存确认弹窗」 |

---

## 3. 保存确认弹窗

### 3.1 交互流程

```
点击「保存」
  → 检测 isDirty
    ├── false → 提示"没有需要保存的变更"
    └── true → 弹出保存确认弹窗（模态，禁止操作后台）
                  ├── 输入变更说明（必填）
                  ├── 显示新版本号预览（v0.3 → v0.4）
                  └── [确认保存] / [取消]
```

### 3.2 弹窗设计

```
┌──────────────────────────────────┐
│  💾 保存路线                     │
│  ────────────────────────────    │
│                                  │
│  路线：10kV 绝缘子工艺路线        │
│  当前版本：v0.3                  │
│  新版本号：v0.4                  │
│                                  │
│  变更说明 *                     │
│  ┌────────────────────────────┐ │
│  │ 添加了烧成温度参数调整...  │ │
│  │                            │ │
│  └────────────────────────────┘ │
│  限200字符，已输入 12/200       │
│                                  │
│  [取消]    [确认保存]            │
└──────────────────────────────────┘
```

**交互细节**：
- 变更说明输入框自动聚焦
- 输入为空时「确认保存」按钮禁用
- 支持 Ctrl+Enter 快捷保存
- 按 Esc 取消

---

## 4. 版本历史弹窗

### 4.1 触发与布局

点击编辑器顶栏「历史版本」按钮，弹出全屏模态弹窗（宽度 70%，高度 80%）：

```
┌─────────────────────────────────────────────────────┐
│  📋 版本历史          路线：10kV绝缘子工艺路线      × │
│  ────────────────────────────────────────────────    │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  □  | 版本  | 日期           | 变更说明       │ │
│  │  ├──────────────────────────────────────────────┤ │
│  │  │  □  | v0.4 | 07-11 14:30 | 添加温度参数   │ │  ← 当前版本 高亮
│  │  │  ☑  | v0.3 | 07-11 11:00 | 调整成型参数   │ │  ← 已选（对比用）
│  │  │  □  | v0.2 | 07-10 16:20 | 新增修坯节点   │ │
│  │  │  □  | v0.1 | 07-10 09:00 | 初始版本       │ │
│  │  └──────────────────────────────────────────────┘ │
│                                                       │
│  [回滚到此版本]  [对比]                               │
│  （选中1个时显示）  （选中2个时显示）                 │
└─────────────────────────────────────────────────────┘
```

### 4.2 版本历史列表元素

| 元素 | 说明 |
|------|------|
| **复选框** | 单选或双选（选1个可回滚，选2个可对比） |
| **版本号** | 如 `v0.3`，当前版本用蓝色高亮标记 |
| **日期时间** | 格式 `MM-DD HH:mm` |
| **变更说明** | 保存时输入的文字，截断显示 |
| **当前版本指示** | 当前正在编辑的版本行，蓝色背景标记 |

### 4.3 交互规则

| 操作 | 行为 |
|------|------|
| 选中 1 个版本 | 「回滚到此版本」按钮启用 |
| 选中 2 个版本 | 「对比」按钮启用 |
| 选中 >2 个版本 | 自动取消最先选中的（只保留最近2个） |
| 当前版本被选中 | 「回滚」按钮禁用（已在当前版本） |
| 空历史 | 显示"暂无版本记录"空状态 |
| 点击行（非复选框） | 展开该版本的缩略信息（节点数、参数概览） |

---

## 5. 版本对比视图

### 5.1 布局设计

点击「对比」后，在当前弹窗内切换为对比视图：

```
┌─────────────────────────────────────────────────────────────┐
│  📋 版本对比    v0.2 vs v0.3            [返回列表]    ×    │
│  ────────────────────────────────────────────────────────    │
│                                                              │
│  差异摘要: 节点 4→5 (+1)  ·  参数变更 3 处                  │
│                                                              │
│  ┌────────── v0.2 ──────────┐  ┌────────── v0.3 ──────────┐ │
│  │         ⚙️ 制泥          │  │         ⚙️ 制泥          │ │
│  │  责任人: 制泥工          │  │  责任人: 制泥工          │ │
│  │  球磨时间: 8h            │  │  球磨时间: 10h ← 变更   │ │
│  │                          │  │                          │ │
│  │         ⚙️ 成型          │  │         ⚙️ 成型          │ │
│  │         ⚙️ 修坯          │  │         ⚙️ 修坯          │ │
│  │                          │  │         ⚙️ 上釉  ← 新增 │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│                                                              │
│  参数变更明细:                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 制泥 → 球磨时间: 8h → 10h (+2h)                       ││
│  │ 新增节点: 上釉 (工序#P04)                              ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 5.2 对比内容

| 对比维度 | 展示方式 |
|---------|---------|
| **节点数量变化** | 顶部摘要行显示 `节点 4→5 (+1)` |
| **节点新增/删除** | 并排画布中用高亮色标注（新增=绿色，删除=红色） |
| **参数变更** | 底部明细列表：`工序名 → 参数名: 旧值 → 新值` |
| **连线变化** | 合并到节点变更中（节点变化自动带动连线） |

### 5.3 空/边界状态

| 场景 | 处理 |
|------|------|
| 两个版本完全相同 | 显示"两个版本内容一致，无差异" |
| 对比的版本数据损坏 | 显示"该版本数据不可读"，跳过对比 |
| 节点数 0 vs N | 显示"从空画布新增了 N 个节点" |

---

## 6. 回滚确认流程

### 6.1 交互流程

```
在历史弹窗中选中一个版本 → 点击「回滚到此版本」
  → 回滚确认弹窗
    ├── "将 v0.2 恢复到编辑器，当前未保存变更将丢失"
    ├── [取消] / [确认回滚]
    └── 确认 → 回滚成功 Toast → 编辑器加载该版本快照
           → 自动创建 v0.3（内容与 v0.2 相同）
           → 进入编辑状态，isDirty=false
```

### 6.2 回滚确认弹窗设计

```
┌──────────────────────────────────┐
│  ⚠️ 回滚确认                     │
│  ────────────────────────────    │
│                                  │
│  将回滚到版本 v0.2              │
│                                  │
│  回滚操作将：                    │
│  • 把路线内容恢复到 v0.2 的状态   │
│  • 自动创建新版本 v0.3            │
│  • v0.3 的内容与 v0.2 相同       │
│                                  │
│  ⚠️ 当前未保存的变更将丢失       │
│                                  │
│  [取消]    [确认回滚]            │
└──────────────────────────────────┘
```

---

## 7. 版本号展示规范

| 位置 | 展示方式 |
|------|---------|
| **编辑器顶栏** | 状态标签右侧，灰色 `v0.3` |
| **路线列表页** | 现有「版本」列保持不变 |
| **历史弹窗** | 每行左侧版本号 |
| **对比视图** | 两栏标题上方版本号 |
| **状态栏** | 版本号跟随状态  `状态: 草稿 · v0.3 · 节点: 5` |

---

## 8. 键盘快捷键（新增）

| 快捷键 | 操作 |
|--------|------|
| `Ctrl+S` | 弹出保存确认弹窗（原为直接保存） |
| `Ctrl+Enter` | 在保存弹窗中确认保存 |
| `Esc` | 关闭弹窗 |

---

## 9. 异常/错误状态

| 场景 | 处理 |
|------|------|
| 保存失败（DB 错误） | Toast 红色 "保存失败，请重试"，数据保留在编辑器 |
| 历史数据加载失败 | 弹窗内显示 "版本历史加载失败，请刷新重试" |
| 回滚失败 | Toast 红色 "回滚失败"，编辑器保持不变 |
| 版本数据损坏 | 历史列表中该行标记 ⚠️ 图标，不可选中 |

---

# 第四部分：TASK-003 版本管理 — 技术设计（架构师）

> 日期：2026-07-11
> 角色：架构师
> 基于：PRD TASK-003 + UX 交互设计

---

## 1. 新增/修改文件清单

```
src/
├── pages/
│   └── RouteEditor/
│       ├── index.tsx                        # 修改：顶栏新增版本按钮
│       ├── VersionHistoryDialog.tsx         # 新增：版本历史弹窗
│       ├── SaveConfirmDialog.tsx            # 新增：保存确认弹窗
│       └── VersionCompareView.tsx           # 新增：版本对比视图
├── stores/
│   └── routeStore.ts                        # 修改：新增版本管理状态+actions
├── lib/
│   └── types/
│       └── route.ts                         # 修改：新增版本历史类型
├── components/
│   └── ui/
│       └── ConfirmDialog.tsx                # 修改：增强 variant
electron/
├── handlers.ts                              # 修改：新增版本历史 IPC
└── preload.ts                               # 修改：暴露版本历史 API
```

---

## 2. 新增类型定义

### 2.1 版本历史条目

```typescript
// src/lib/types/route.ts — 新增

/** 版本历史条目（用于列表展示） */
export interface VersionHistoryItem {
  id: number
  routeId: number
  version: string
  changeDescription: string
  createdBy: string
  createdAt: string
  nodeCount: number     // 版本节点数（冗余方便显示）
  edgeCount: number     // 版本连线数
}

/** 版本历史详情（含完整快照） */
export interface VersionHistoryDetail extends VersionHistoryItem {
  snapshot: RouteSnapshot
}

/** 版本对比结果 */
export interface VersionDiff {
  versionA: string
  versionB: string
  summary: {
    nodesBefore: number
    nodesAfter: number
    edgesBefore: number
    edgesAfter: number
    paramChanges: ParamChange[]
  }
  addedNodeIds: string[]
  removedNodeIds: string[]
  changedNodeIds: string[]
}

export interface ParamChange {
  nodeName: string
  paramName: string
  oldValue: any
  newValue: any
}
```

### 2.2 SaveData 扩展

```typescript
// src/lib/types/route.ts — RouteSaveData 扩展

export interface RouteSaveData {
  name?: string
  snapshot: string
  nodeCount: number
  edgeCount: number
  changeDescription: string   // 新增：变更说明（必填）
}
```

---

## 3. 新增 IPC 通道

```typescript
// electron/handlers.ts — 新增通道

const CHANNELS = {
  // ... 已有通道保持不变 ...

  // 版本管理（新增）
  ROUTE_GET_HISTORY: 'route:get-history',           // 获取版本历史列表
  ROUTE_GET_HISTORY_DETAIL: 'route:get-history-detail', // 获取单个版本详情
  ROUTE_ROLLBACK: 'route:rollback',                 // 回滚到指定版本
}
```

### 3.1 版本历史 IPC 签名

```typescript
// preload.ts 暴露的 API

interface RouteAPI {
  // ... 已有 API 保持不变 ...

  /** 获取路线版本历史列表（按时间倒序） */
  getHistory(routeId: number): Promise<VersionHistoryItem[]>

  /** 获取单个版本历史详情（含 snapshot） */
  getHistoryDetail(historyId: number): Promise<VersionHistoryDetail | null>

  /** 回滚到指定版本（复制快照到 currentRoute，创建新版本） */
  rollback(routeId: number, historyId: number, changeDescription: string): Promise<RouteDetail>
}
```

---

## 4. IPC Handler 实现逻辑

### 4.1 ROUTE_SAVE 改造

现有 `ROUTE_SAVE` handler 改造为「保存 + 自动记录历史」：

```typescript
// 伪代码逻辑
ipcMain.handle(CHANNELS.ROUTE_SAVE, (_e, id, data) => {
  const now = new Date().toISOString()

  // 1. 读取当前路线的旧快照和版本号
  const current = db.prepare("SELECT * FROM routes WHERE id = ?").get(id)

  // 2. 将旧快照写入 route_history（存档历史版本）
  db.prepare(
    "INSERT INTO route_history (route_id, version, snapshot, change_description, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(id, current.version, current.snapshot, data.changeDescription, now)

  // 3. 计算新版本号（minor + 1）
  const { major, minor } = parseVersion(current.version)
  const newVersion = `v${major}.${minor + 1}`

  // 4. 更新 routes 表（新快照 + 新版本号）
  db.prepare(
    "UPDATE routes SET snapshot = ?, version = ?, node_count = ?, edge_count = ?, updated_at = ? WHERE id = ?"
  ).run(data.snapshot, newVersion, data.nodeCount, data.edgeCount, now, id)

  return { newVersion }
})
```

### 4.2 ROUTE_GET_HISTORY

```typescript
ipcMain.handle(CHANNELS.ROUTE_GET_HISTORY, (_e, routeId: number) => {
  const rows = db
    .prepare(`
      SELECT h.id, h.route_id as routeId, h.version,
             h.change_description as changeDescription,
             h.created_at as createdAt, h.created_by as createdBy
      FROM route_history h
      WHERE h.route_id = ?
      ORDER BY h.created_at DESC
    `)
    .all(routeId)
  return rows
})
```

### 4.3 ROUTE_ROLLBACK

```typescript
ipcMain.handle(CHANNELS.ROUTE_ROLLBACK, (_e, routeId: number, historyId: number, changeDescription: string) => {
  // 1. 读取历史版本的 snapshot
  const historyRow = db.prepare("SELECT * FROM route_history WHERE id = ?").get(historyId)
  if (!historyRow) throw new Error("历史版本不存在")

  // 2. 读取当前路线
  const current = db.prepare("SELECT * FROM routes WHERE id = ?").get(routeId)
  const now = new Date().toISOString()

  // 3. 先将当前状态存档到历史
  db.prepare(
    "INSERT INTO route_history (route_id, version, snapshot, change_description, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(routeId, current.version, current.snapshot, `回滚前自动存档`, now)

  // 4. 计算新版本号
  const { major, minor } = parseVersion(current.version)
  const newVersion = `v${major}.${minor + 1}`

  // 5. 将历史版本的 snapshot 写入当前路线（版本号递增）
  const historySnapshot = JSON.parse(historyRow.snapshot)
  const snapshotStr = JSON.stringify(historySnapshot)
  const nodeCount = historySnapshot.nodes?.length || 0
  const edgeCount = historySnapshot.edges?.length || 0
  db.prepare(
    "UPDATE routes SET snapshot = ?, version = ?, node_count = ?, edge_count = ?, updated_at = ? WHERE id = ?"
  ).run(snapshotStr, newVersion, nodeCount, edgeCount, now, routeId)

  // 6. 将回滚说明也写入历史
  db.prepare(
    "INSERT INTO route_history (route_id, version, snapshot, change_description, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(routeId, newVersion, snapshotStr, changeDescription, now)

  // 7. 返回新的 RouteDetail
  return {
    id: routeId,
    name: current.name,
    version: newVersion,
    status: current.status,
    snapshot: historySnapshot,
    nodeCount,
    edgeCount,
    createdAt: current.created_at,
    updatedAt: now,
    publishedAt: current.published_at,
  }
})
```

---

## 5. Zustand Store 扩展

```typescript
// stores/routeStore.ts — 新增状态和 actions

interface RouteState {
  // ... 已有状态保持不变 ...

  // ── 版本管理（新增）──
  versionHistory: VersionHistoryItem[]
  historyLoading: boolean
  showSaveDialog: boolean                    // 控制保存弹窗显隐
  saveChangeDescription: string              // 当前保存变更说明

  // ── 版本 Actions（新增）──
  fetchVersionHistory: (routeId: number) => Promise<void>
  rollbackToVersion: (historyId: number, description: string) => Promise<void>
  setSaveDialogOpen: (open: boolean) => void
  setSaveChangeDescription: (desc: string) => void
  saveRouteWithHistory: (description: string) => Promise<void>  // 替代原 saveRoute

  // ── 版本对比（新增）──
  compareVersions: (historyIdA: number, historyIdB: number) => Promise<VersionDiff | null>
}
```

### 5.1 saveRouteWithHistory 逻辑

```typescript
saveRouteWithHistory: async (description: string) => {
  const { currentRoute, nodes, edges } = get()
  if (!currentRoute) return

  const viewport = { x: 0, y: 0, zoom: 1 }
  const snapshot = JSON.stringify({ nodes, edges, viewport })

  // 调用新的 save handler（后端自动处理版本存档+版本号递增）
  const result = await window.electronAPI.route.save(currentRoute.id, {
    snapshot,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    changeDescription: description,
  })

  // 计算新版本号并从返回结果更新
  set({
    isDirty: false,
    showSaveDialog: false,
    currentRoute: {
      ...currentRoute,
      snapshot: { nodes: nodes as any, edges: edges as any, viewport },
      version: result.newVersion,  // 从后端返回的新版本号
      nodeCount: nodes.length,
      edgeCount: edges.length,
      updatedAt: new Date().toISOString(),
    },
  })
}
```

---

## 6. 版本差异计算（前端纯函数）

```typescript
// src/lib/utils/versionDiff.ts — 新增

/** 计算两个版本快照的差异 */
export function computeVersionDiff(
  snapshotA: RouteSnapshot,
  snapshotB: RouteSnapshot,
  metaA: { version: string },
  metaB: { version: string },
): VersionDiff {
  const nodesA = new Map(snapshotA.nodes.map(n => [n.id, n]))
  const nodesB = new Map(snapshotB.nodes.map(n => [n.id, n]))

  const paramChanges: ParamChange[] = []
  const changedNodeIds: string[] = []
  const addedNodeIds: string[] = []
  const removedNodeIds: string[] = []

  // 找出新增和参数变更的节点
  for (const [id, nodeB] of nodesB) {
    if (!nodesA.has(id)) {
      addedNodeIds.push(id)
    } else {
      const nodeA = nodesA.get(id)!
      // 对比参数
      const paramsA = nodeA.data.params || {}
      const paramsB = nodeB.data.params || {}
      const allKeys = new Set([...Object.keys(paramsA), ...Object.keys(paramsB)])
      let hasParamChange = false
      for (const key of allKeys) {
        if (JSON.stringify(paramsA[key]) !== JSON.stringify(paramsB[key])) {
          paramChanges.push({
            nodeName: nodeB.data.name || id,
            paramName: key,
            oldValue: paramsA[key],
            newValue: paramsB[key],
          })
          hasParamChange = true
        }
      }
      if (hasParamChange) changedNodeIds.push(id)
    }
  }

  // 找出删除的节点
  for (const [id] of nodesA) {
    if (!nodesB.has(id)) {
      removedNodeIds.push(id)
    }
  }

  return {
    versionA: metaA.version,
    versionB: metaB.version,
    summary: {
      nodesBefore: snapshotA.nodes.length,
      nodesAfter: snapshotB.nodes.length,
      edgesBefore: snapshotA.edges.length,
      edgesAfter: snapshotB.edges.length,
      paramChanges,
    },
    addedNodeIds,
    removedNodeIds,
    changedNodeIds,
  }
}
```

---

## 7. 新组件 Props 接口

```typescript
// VersionHistoryDialog
interface VersionHistoryDialogProps {
  routeId: number
  currentVersion: string
  open: boolean
  onClose: () => void
  onRollback: (historyId: number) => void
  onCompare: (historyIdA: number, historyIdB: number) => void
}

// SaveConfirmDialog
interface SaveConfirmDialogProps {
  open: boolean
  routeName: string
  currentVersion: string
  nextVersion: string
  description: string
  onDescriptionChange: (desc: string) => void
  onConfirm: () => void
  onCancel: () => void
  saving?: boolean  // 保存中状态
}

// VersionCompareView
interface VersionCompareViewProps {
  diff: VersionDiff
  snapshotA: RouteSnapshot
  snapshotB: RouteSnapshot
  onBack: () => void
}
```

---

## 8. ROUTE_PUBLISH 改造

发布时也需要生成历史存档 + 版本号跳主版本：

```typescript
ipcMain.handle(CHANNELS.ROUTE_PUBLISH, (_e, id: number) => {
  const current = db.prepare("SELECT * FROM routes WHERE id = ?").get(id)
  const now = new Date().toISOString()

  // 1. 存档当前版本
  db.prepare(
    "INSERT INTO route_history (route_id, version, snapshot, change_description, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(id, current.version, current.snapshot, `发布为 v${parseInt(current.version.split('.')[0]) + 1}.0`, now)

  // 2. 计算新主版本号
  const major = parseInt(current.version.replace('v', '').split('.')[0]) + 1
  const newVersion = `v${major}.0`

  // 3. 更新状态和版本号
  db.prepare(
    "UPDATE routes SET status = 'published', version = ?, published_at = ?, updated_at = ? WHERE id = ?"
  ).run(newVersion, now, now, id)
})
```

---

## 9. 安全审查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| SQL 注入 | ✅ 安全 | Drizzle + 参数化查询 |
| IPC 暴露 | ✅ 安全 | preload.ts 白名单新增通道 |
| 版本数据完整性 | ✅ 安全 | rollback 使用完整 JSON 替换，无合并逻辑 |
| 回滚权限 | ✅ 安全 | 仅草稿状态可回滚（published 需先 newVersion） |

---

## 10. 性能评估

| 场景 | 预期表现 | 说明 |
|------|---------|------|
| 保存+写历史（20节点） | <100ms | 一次 INSERT + 一次 UPDATE |
| 加载版本历史列表（100条） | <50ms | 仅查元数据字段 |
| 加载版本快照详情 | <200ms | 含 JSON.parse |
| 版本对比（20节点） | <10ms | 纯内存 Map 遍历 |
| 回滚操作 | <100ms | 一次 SELECT + 一次 INSERT + 一次 UPDATE |

---

## 11. 影响范围

| 影响模块 | 修改内容 |
|---------|---------|
| `src/lib/types/route.ts` | 新增 VersionHistoryItem/VersionDiff/ParamChange 类型 |
| `src/stores/routeStore.ts` | 新增版本历史和对比状态 + actions |
| `src/pages/RouteEditor/index.tsx` | 顶栏新增版本号+历史按钮，保存逻辑改造 |
| `src/pages/RouteEditor/VersionHistoryDialog.tsx` | 新增 |
| `src/pages/RouteEditor/SaveConfirmDialog.tsx` | 新增 |
| `src/pages/RouteEditor/VersionCompareView.tsx` | 新增 |
| `src/lib/utils/versionDiff.ts` | 新增 |
| `electron/handlers.ts` | 改造 ROUTE_SAVE/ROUTE_PUBLISH，新增 3 个 handler |
| `electron/preload.ts` | 暴露 getHistory/getHistoryDetail/rollback |
| `src/styles/global.css` | 新增版本相关样式 |

---

## 12. 版本号工具函数

```typescript
// src/lib/utils/version.ts — 新增

/** 解析版本号为 major/minor */
export function parseVersion(v: string): { major: number; minor: number } {
  const cleaned = v.replace('v', '')
  const parts = cleaned.split('.')
  return {
    major: parseInt(parts[0]) || 0,
    minor: parseInt(parts[1]) || 0,
  }
}

/** 计算新版本号（minor+1） */
export function nextMinorVersion(v: string): string {
  const { major, minor } = parseVersion(v)
  return `v${major}.${minor + 1}`
}

/** 计算新主版本号（major+1, minor=0） */
export function nextMajorVersion(v: string): string {
  const { major } = parseVersion(v)
  return `v${major + 1}.0`
}
```

---

# 第五部分：TASK-004 自定义工序 + 工序分类 — UX 交互设计

> 日期：2026-07-11
> 角色：UX 设计师
> 基于 PRD：TASK-004 自定义工序 + 工序分类

---

## 1. 信息架构变更

### 1.1 新增视图/页面

| 视图 | 触发方式 | 用途 |
|------|---------|------|
| **工序管理弹窗** | 左侧工序库面板「管理工序」按钮 | 统一的工序列表管理界面（新增/编辑/禁用/删除） |
| **工序编辑表单** | 管理弹窗中点击「新增」或「编辑」 | 填写工序名称、编码、责任人、参数模板 |
| **参数模板编辑器** | 工序编辑表单内嵌入 | 动态增删改参数行 |

### 1.2 入口变更

```
工序库面板（左侧）
├── 标题行：[工序库] [管理工序⚙️]    ← 新增管理按钮
├── 标准工序组
│   ├── P01 制泥  (不可操作)
│   └── ...
└── 自定义工序组
    ├── C001 烘干  (可编辑/禁用/删除)
    └── （空状态: 暂无自定义工序）
```

---

## 2. 工序库面板改造

### 2.1 新版面板布局

```
┌──────────────────────────┐
│  工序库          [⚙️管理] │ ← 标题 + 管理按钮
├──────────────────────────┤
│  🔍 [搜索工序...]        │ ← 搜索框（原有）
├──────────────────────────┤
│  ▼ 标准工序 (8)          │ ← 分组标题+计数
│  ┌────────────────────┐ │
│  │ ☰ P01 制泥        │ │
│  │ ☰ P02 成型        │ │
│  └────────────────────┘ │
├──────────────────────────┤
│  ▼ 自定义工序 (2)    [+ │ ← 分组标题+计数+行内新增
│  ┌────────────────────┐ │
│  │ ☰ C001 烘干    ✎ ┊ │ │ ← hover显示编辑/禁用图标
│  │ ☰ C002 打磨    ✎ ┊ │ │
│  └────────────────────┘ │
└──────────────────────────┘
```

### 2.2 新增/变更的 UI 元素

| 元素 | 位置 | 交互 |
|------|------|------|
| **「管理工序」按钮 ⚙️** | 面板标题右侧 | 点击弹出工序管理弹窗 |
| **分组计数** | 每组标题末尾 | 显示 `(N)` 该组数量 |
| **行内编辑图标 ✎** | 自定义工序行 hover 显示 | 点击直接编辑该工序 |
| **行内禁用开关 ┊** | 自定义工序行 hover 显示 | 点击切换启用/禁用 |
| **「+」按钮** | 自定义工序组标题右侧 | 快速新增自定义工序 |

---

## 3. 工序管理弹窗

### 3.1 弹窗布局

点击「管理工序」按钮，弹出模态弹窗（宽度 65%，高度 75%）：

```
┌──────────────────────────────────────────────────┐
│  工序管理                           [+ 新增工序] ×│
│  ──────────────────────────────────────────────  │
│                                                   │
│  筛选: [全部 ▼]  [搜索工序...]                    │
│                                                   │
│  ┌──────────────────────────────────────────────┐│
│  │ 编码   | 名称       | 分类   | 状态  | 操作  ││
│  │──────────────────────────────────────────────││
│  │ P01   | 制泥       | 标准   | ✅启用 | —    ││ ← 标准不可操作
│  │ P02   | 成型       | 标准   | ✅启用 | —    ││
│  │ ...   | ...        | ...    | ...   | ...   ││
│  │ C001  | 烘干       | 自定义 | ✅启用 | ✎🗑️  ││ ← 自定义可操作
│  │ C002  | 打磨       | 自定义 | ⛔禁用 | ✎🗑️  ││
│  └──────────────────────────────────────────────┘│
│                                                   │
│  共 N 条                                         │
└──────────────────────────────────────────────────┘
```

### 3.2 操作按钮行为

| 操作 | 条件 | 行为 |
|------|------|------|
| **标准工序行** | — | 操作栏显示「—」，不可操作 |
| **自定义工序「✎」** | 所有自定义工序 | 弹出工序编辑表单 |
| **自定义工序「🗑️」** | 未被引用 | 弹出删除确认 |
| **自定义工序「🗑️」** | 被引用 | 提示阻止 |
| **启用/禁用** | 自定义工序 | 点击切换 |

---

## 4. 工序编辑表单（新增/编辑共用）

### 4.1 弹窗表单

```
┌──────────────────────────────────────┐
│  ✏️ 新增自定义工序         [取消][保存] │
│  ─────────────────────────────────  │
│                                      │
│  工序名称 *                          │
│  [ 烘干                          ]  │
│                                      │
│  工序编码                            │
│  [ C001   ]（自动生成，可手改）       │
│                                      │
│  责任人角色                          │
│  [ 烘干工  ▼                    ]  │
│                                      │
│  工序描述                            │
│  [ 对胚体进行烘干处理...        ]  │
│                                      │
│  ──── 默认参数模板 ────              │
│  ┌──────────────────────────────────┐│
│  │ 参数名        类型   必填  操作   ││
│  │────────────────────────────────││
│  │ [烘干温度] [数字▼] [☑]   [🗑️] ││
│  │ [烘干时长] [数字▼] [☑]   [🗑️] ││
│  │                         [+新增] ││
│  └──────────────────────────────────┘│
│                                      │
└──────────────────────────────────────┘
```

### 4.2 参数行编辑器

| 元素 | 控件 | 说明 |
|------|------|------|
| **参数名** | Input | 必填，限 30 字 |
| **类型** | Select | 文本/数字/选择/开关 |
| **默认值** | 动态 | 按类型切换控件 |
| **必填** | Checkbox | ☑ 标记 |
| **单位** | Input | 仅数字类型 |
| **安全范围** | Min/Max | 仅数字类型 |
| **删除** | 🗑️ | 至少保留 1 个参数 |
| **新增** | [+新增] | 表底部 |

---

## 5. 删除确认弹窗

```
┌──────────────────────────────────┐
│  🗑️ 删除工序                     │
│  ────────────────────────────    │
│                                  │
│  确定删除自定义工序「烘干」？    │
│  此操作不可撤销。                │
│                                  │
│  [取消]    [确认删除]            │
└──────────────────────────────────┘
```

**被引用时**:
```
┌──────────────────────────────────┐
│  ⛔ 无法删除                      │
│  ────────────────────────────    │
│                                  │
│  工序「烘干」正被以下路线使用：  │
│  • 10kV绝缘子工艺路线 (v0.3)    │
│  • 针式绝缘子工艺路线 (v1.0)    │
│                                  │
│  [我知道了]                      │
└──────────────────────────────────┘
```

---

## 6. 空/边界状态

| 场景 | 处理 |
|------|------|
| 自定义工序数量为 0 | 显示"暂无自定义工序，点击「+」创建" |
| 所有自定义工序被禁用 | 组标题旁显示"(全部禁用)" |
| 搜索无结果 | "未找到匹配的工序" |
| 工序库加载失败 | "加载失败，点击重试" |
| 编辑弹窗关闭未保存 | 提示"有未保存的更改，是否放弃？" |

---

# 第六部分：TASK-004 自定义工序 + 工序分类 — 技术设计（架构师）

> 日期：2026-07-11
> 角色：架构师
> 基于：PRD TASK-004 + UX 交互设计

---

## 1. 设计原则

- **复用优先**：自定义工序数据复用现有 `process_library` 表，`category = 'custom'` 区分
- **最小改动**：不修改标准工序数据，不新增表，只扩展已有表字段和 IPC 通道
- **渐进增强**：现有 8 道标准工序完全不受影响，只新增自定义工序管理能力

---

## 2. 新增/修改文件清单

```
src/
├── pages/
│   └── RouteEditor/
│       ├── ProcessPanel.tsx                    # 修改：管理按钮+行内操作+分组计数
│       ├── ProcessManageDialog.tsx             # 新增：工序管理弹窗
│       └── ProcessEditDialog.tsx               # 新增：工序编辑表单（含参数模板编辑器）
├── lib/
│   └── types/
│       └── route.ts                            # 修改：新增类型定义
├── lib/utils/
│   └── processCode.ts                          # 新增：编码生成工具函数
├── components/
│   └── ui/
│       └── ParamTemplateEditor.tsx             # 新增：参数模板编辑器组件
├── stores/
│   └── routeStore.ts                           # 修改：新增工序管理 actions
├── styles/
│   └── global.css                              # 修改：新增样式
electron/
├── handlers.ts                                 # 修改：新增 4 个工序管理 IPC handler
└── preload.ts                                  # 修改：暴露工序管理 API
```

---

## 3. 新增类型定义

```typescript
// src/lib/types/route.ts — 新增

/** 创建自定义工序的请求参数 */
export interface CreateCustomProcessData {
  name: string
  code?: string
  category: 'custom'
  responsibleRole?: string
  description?: string
  defaultParams: ParamTemplateItem[]
}

/** 更新自定义工序的请求参数 */
export interface UpdateCustomProcessData {
  id: number
  name?: string
  code?: string
  responsibleRole?: string
  description?: string
  defaultParams?: ParamTemplateItem[]
  isActive?: boolean
}

/** 参数模板条目 */
export interface ParamTemplateItem {
  name: string
  type: 'text' | 'number' | 'select' | 'boolean'
  required: boolean
  defaultValue?: any
  unit?: string
  min?: number
  max?: number
  options?: string[]
}

/** 删除工序的返回（含引用检查） */
export interface DeleteProcessResult {
  success: boolean
  message: string
  referencedBy?: { id: number; name: string; version: string }[]
}
```

### 3.1 ElectronAPI 扩展

```typescript
// src/lib/types/route.ts — ElectronAPI 扩展

interface ElectronAPI {
  processLibrary: {
    getAll: () => Promise<ProcessLibraryItem[]>
    getByCategory: (category: string) => Promise<ProcessLibraryItem[]>
    search: (query: string) => Promise<ProcessLibraryItem[]>
    // 新增
    create: (data: CreateCustomProcessData) => Promise<ProcessLibraryItem>
    update: (data: UpdateCustomProcessData) => Promise<ProcessLibraryItem>
    toggleActive: (id: number, isActive: boolean) => Promise<void>
    delete: (id: number) => Promise<DeleteProcessResult>
  }
}
```

---

## 4. 新增 IPC 通道

```typescript
// electron/handlers.ts

const CHANNELS = {
  // ... 已有通道保持不变 ...

  // 工序管理（新增）
  PROCESS_LIBRARY_CREATE: 'process-library:create',
  PROCESS_LIBRARY_UPDATE: 'process-library:update',
  PROCESS_LIBRARY_TOGGLE_ACTIVE: 'process-library:toggle-active',
  PROCESS_LIBRARY_DELETE: 'process-library:delete',
}
```

### 4.1 IPC Handler 实现（关键逻辑）

```typescript
/* ── 创建自定义工序 ── */
ipcMain.handle(CHANNELS.PROCESS_LIBRARY_CREATE, (_e, data: CreateCustomProcessData) => {
  const now = new Date().toISOString()
  // 自动生成编码 C001
  const maxCode = db.prepare(
    "SELECT code FROM process_library WHERE category = 'custom' ORDER BY code DESC LIMIT 1"
  ).get() as { code: string } | undefined
  const nextNum = maxCode ? (parseInt(maxCode.code.replace('C', '')) || 0) + 1 : 1
  const code = `C${String(nextNum).padStart(3, '0')}`

  // 查重
  const exists = db.prepare("SELECT id FROM process_library WHERE name = ? AND is_active = 1").get(data.name)
  if (exists) throw new Error('工序名称已存在')

  const result = db.prepare(`
    INSERT INTO process_library (code, name, category, description, icon, responsible_role, default_params, sort_order, is_active, created_at, updated_at)
    VALUES (?, ?, 'custom', ?, 'custom', ?, ?, 99, 1, ?, ?)
  `).run(code, data.name, data.description || '', data.responsibleRole || '',
    JSON.stringify(data.defaultParams || []), now, now)

  return { id: result.lastInsertRowid, code, name: data.name, category: 'custom', /* ... */ }
})

/* ── 删除自定义工序（含引用检查） ── */
ipcMain.handle(CHANNELS.PROCESS_LIBRARY_DELETE, (_e, id: number) => {
  const refs = db.prepare(`
    SELECT DISTINCT r.id, r.name, r.version FROM routes r
    WHERE r.snapshot LIKE ?
  `).all(`%"processId":${id}%`) as any[]

  if (refs.length > 0) {
    return { success: false, message: `该工序正被 ${refs.length} 条路线使用`,
      referencedBy: refs.map((r: any) => ({ id: r.id, name: r.name, version: r.version })) }
  }

  db.prepare("DELETE FROM process_library WHERE id = ? AND category = 'custom'").run(id)
  return { success: true, message: '删除成功' }
})
```

---

## 5. Preload 暴露

```typescript
// electron/preload.ts — 新增
processLibrary: {
  getAll: () => ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_GET_ALL),
  getByCategory: (category: string) => ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_GET_BY_CATEGORY, category),
  search: (query: string) => ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_SEARCH, query),
  // 新增
  create: (data: any) => ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_CREATE, data),
  update: (data: any) => ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_UPDATE, data),
  toggleActive: (id: number, isActive: boolean) =>
    ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_TOGGLE_ACTIVE, id, isActive),
  delete: (id: number) => ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_DELETE, id),
},
```

---

## 6. Zustand Store 扩展

```typescript
// stores/routeStore.ts — 新增

interface RouteState {
  // 新增状态
  manageDialogOpen: boolean
  editDialogOpen: boolean
  editingProcess: ProcessLibraryItem | null

  // 新增 Actions
  setManageDialogOpen: (open: boolean) => void
  setEditDialogOpen: (open: boolean, process?: ProcessLibraryItem | null) => void
  createCustomProcess: (data: CreateCustomProcessData) => Promise<void>
  updateCustomProcess: (data: UpdateCustomProcessData) => Promise<void>
  toggleProcessActive: (id: number, isActive: boolean) => Promise<void>
  deleteCustomProcess: (id: number) => Promise<DeleteProcessResult>
}

// 实现
createCustomProcess: async (data) => {
  const newProcess = await window.electronAPI.processLibrary.create(data)
  set((s) => ({ processLibrary: [...s.processLibrary, newProcess] }))
},
updateCustomProcess: async (data) => {
  await window.electronAPI.processLibrary.update(data)
  await get().fetchProcessLibrary()
},
toggleProcessActive: async (id, isActive) => {
  await window.electronAPI.processLibrary.toggleActive(id, isActive)
  await get().fetchProcessLibrary()
},
deleteCustomProcess: async (id) => {
  const result = await window.electronAPI.processLibrary.delete(id)
  if (result.success) await get().fetchProcessLibrary()
  return result
},
```

---

## 7. 新组件 Props 接口

```typescript
// ProcessManageDialog
interface ProcessManageDialogProps {
  open: boolean
  onClose: () => void
  library: ProcessLibraryItem[]
  loading: boolean
  onCreate: () => void
  onEdit: (process: ProcessLibraryItem) => void
  onToggleActive: (id: number, isActive: boolean) => void
  onDelete: (id: number) => void
}

// ProcessEditDialog
interface ProcessEditDialogProps {
  open: boolean
  process?: ProcessLibraryItem | null
  onSave: (data: CreateCustomProcessData | UpdateCustomProcessData) => void
  onCancel: () => void
  saving?: boolean
}

// ParamTemplateEditor
interface ParamTemplateEditorProps {
  params: ParamTemplateItem[]
  onChange: (params: ParamTemplateItem[]) => void
}

// ProcessPanel 扩展
interface ProcessPanelProps {
  library: ProcessLibraryItem[]
  loading: boolean
  onSearch: (query: string) => void
  onDragStart: (processId: number) => void
  onManageClick: () => void                    // 新增
  onQuickEdit: (process: ProcessLibraryItem) => void  // 新增
  onQuickToggleActive: (id: number, isActive: boolean) => void  // 新增
}
```

---

## 8. 编码自动生成工具函数

```typescript
// src/lib/utils/processCode.ts — 新增

export function getNextCustomCode(existingCodes: string[]): string {
  const maxNum = existingCodes
    .filter(c => c.startsWith('C'))
    .map(c => parseInt(c.replace('C', '')) || 0)
    .reduce((max, n) => Math.max(max, n), 0)
  return `C${String(maxNum + 1).padStart(3, '0')}`
}
```

---

## 9. 数据库兼容性

| 项 | 处理方式 |
|---|---------|
| 已有 8 道标准工序 | 完全不变，`category='standard'` |
| 已有 `process_library` 表 | 现有字段完全满足需求，无需 DDL 变更 |
| 已有路线快照中的 `processId` | 自定义工序的 id 与标准工序共用自增序列，引用不受影响 |
| 已有 `is_active` 字段 | 目前全为 1，标准工序不可禁用，自定义工序可切换 |

---

## 10. 安全审查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| SQL 注入 | ✅ 安全 | 全部参数化查询 |
| IPC 暴露 | ✅ 安全 | preload.ts 白名单新增通道 |
| 输入验证 | ✅ 设计覆盖 | 名称/编码查重、参数类型校验、引用检查 |
| 数据完整性 | ✅ 设计覆盖 | 标准工序不可写保护（WHERE category='custom'） |
| 引用完整性 | ✅ 设计覆盖 | 删除前检查 route snapshot JSON 中是否引用 |

---

## 11. 性能评估

| 场景 | 预期表现 | 说明 |
|------|---------|------|
| 加载工序库（50条） | <30ms | 单表 SQL 查询 |
| 新增自定义工序 | <50ms | 单条 INSERT |
| 编辑自定义工序 | <30ms | 单条 UPDATE |
| 删除前引用检查 | <100ms | LIKE 查询 snapshot JSON |
| 参数模板编辑 | 即时 | 前端本地状态，无 IPC 调用 |

---

## 12. 影响范围

| 影响模块 | 修改内容 |
|---------|---------|
| `src/lib/types/route.ts` | 新增 4 个类型 + ElectronAPI 扩展 |
| `src/lib/utils/processCode.ts` | 新增（编码生成） |
| `src/stores/routeStore.ts` | 新增工序管理 actions |
| `src/pages/RouteEditor/ProcessPanel.tsx` | 改造：管理按钮+行内操作+分组计数 |
| `src/pages/RouteEditor/ProcessManageDialog.tsx` | 新增 |
| `src/pages/RouteEditor/ProcessEditDialog.tsx` | 新增 |
| `src/components/ui/ParamTemplateEditor.tsx` | 新增 |
| `electron/handlers.ts` | 新增 4 个 IPC handler |
| `electron/preload.ts` | 暴露 4 个新 API |
| `src/styles/global.css` | 新增工序管理样式 |

---

# 第七部分：TASK-005 质检节点 — UX 交互设计

> 日期：2026-07-11
> 角色：UX 设计师
> 基于 PRD：TASK-005 质检节点

---

## 1. 信息架构变更

### 1.1 工序库面板新增

```
工序库面板（左侧）
├── 标准工序 (8)
├── 自定义工序 (N)
└── 特殊节点                    ← 新增分组
    └── 🔍 质检节点  [拖拽]     ← 可拖拽到画布
```

- 「特殊节点」分组位于工序库最底部
- 质检节点作为唯一特殊节点，显示 🔍 图标 + 名称
- 拖拽方式和普通工序一致

### 1.2 参数面板行为扩展

| 选中节点 | 面板行为 |
|---------|---------|
| 选中质检节点 | 显示「质检参数配置」表单（检测项目列表） |
| 选中质检节点的连线 | 显示「通过」或「不通过」标签信息 |

---

## 2. 质检节点视觉设计

### 2.1 节点外观

```
         ┌──────────┐
         │    🔍    │         ← 放大镜图标
         │   质检    │         ← 节点名称
         │  检测名称  │         ← 检测项目预览（最多显示1项）
         └────┬─────┘
              │
    ┌─────────┼─────────┐
    │ 通过    │   不通过 │     ← 两个输出端口
    │ 🟢      │     🔴  │
```

### 2.2 节点状态

| 状态 | 视觉表现 |
|------|---------|
| **default** | 菱形（由 CSS transform: rotate(45deg) 包裹实现），琥珀色边框 `#F59E0B`，白底 |
| **selected** | 琥珀色边框加粗 + 阴影 |
| **hover** | 边框变亮 |
| **invalid** | 红色边框 + 警告图标（参数未配置时） |
| **readonly** | 灰色背景，无交互 |
| **connecting** | 输出端口合法目标时绿色脉动 |

### 2.3 节点尺寸

- **宽×高**：80×80px（视觉方形，旋转45°后为菱形）
- **实际点击区域**：使用 clip-path 或透明 padding 扩大可点击区域
- **端口位置**：
  - 左侧：输入端口（一个）
  - 右侧上方：通过端口（绿色高亮）
  - 右侧下方：不通过端口（红色高亮）

### 2.4 端口标注

- 鼠标 hover 到输出端口时，显示小标签：
  - 上方端口：「✅ 通过」
  - 下方端口：「❌ 不通过」
- 标签为 Tooltip 样式，浅色背景

---

## 3. 连线设计

### 3.1 连线标签

```
  ┌─────┐     ✅ 通过      ┌─────┐
  │质检  │ ──────────────→ │下一工序│
  │节点  │                  └─────┘
  │      │     ❌ 不通过    ┌─────┐
  │      │ ──────────────→ │返工  │
  └─────┘                  └─────┘
```

### 3.2 连线样式

| 类型 | 连线颜色 | 标签 |
|------|---------|------|
| 通过路径 | 绿色 `--color-success-500` | 「✅ 通过」浅绿背景 |
| 不通过路径 | 红色 `--color-error-500` | 「❌ 不通过」浅红背景 |
| 默认（非质检节点连线） | 灰色 `--color-neutral-300` | 无标签 |

---

## 4. 质检参数配置

### 4.1 参数面板内容

当选中质检节点时，右侧参数面板显示：

```
┌──────────────────────────────┐
│  质检参数配置                 │
│  ──────────────────────────  │
│                              │
│  节点名称                    │
│  [ 外观检查质检            ] │ ← 可编辑
│                              │
│  ──── 检测项目 ────          │
│                              │
│  ┌──────────────────────────┐│
│  │ #  检测项目    标准  范围 ││
│  │─────────────────────────││
│  │ 1  工频耐压   70kV  ±10% ││  ← 已有项目
│  │ 2  外观检查   合格   —   ││
│  │                         ││
│  │ [+ 添加检测项目]         ││
│  └──────────────────────────┘│
│                              │
│  [确认]    [取消]            │
└──────────────────────────────┘
```

### 4.2 添加/编辑检测项目

```
┌──────────────────────────────┐
│  ✏️ 添加检测项目              │
│  ──────────────────────────  │
│                              │
│  检测项目名称 *              │
│  [ 工频耐压              ]  │
│                              │
│  标准值                     │
│  [ 70                     ]  │
│                              │
│  单位                       │
│  [ kV                    ]  │
│                              │
│  允许偏差                   │
│  ○ 无偏差                   │
│  ● 百分比 ± [ 10       ] %  │
│  ○ 绝对值 ± [           ]   │
│                              │
│  [确认]    [取消]            │
└──────────────────────────────┘
```

### 4.3 检测项目显示规则

- 每个检测项目显示为一行：序号 + 名称 + 标准值 + 偏差范围
- 至少 1 个、最多 10 个检测项目
- 无检测项目时节点标记为 invalid

---

## 5. 交互流程

### 5.1 拖拽放置

```
用户在工序库「特殊节点」中拖拽「质检节点」
  → 拖拽到画布
  → 生成 InspectionNode（菱形+琥珀色）
  → 默认名称「质检 N」（N=当前路线中质检节点序号）
  → 默认参数为空（标记为 invalid）
```

### 5.2 连接交互

```
用户从质检节点输出端口拖线
  → 鼠标靠近上方端口（通过）→ 端口高亮绿 + 提示「通过」
  → 鼠标靠近下方端口（不通过）→ 端口高亮红 + 提示「不通过」
  → 松开连接到目标节点
  → 连线上显示对应的标签（通过/不通过）
```

### 5.3 保存前校验

```
用户点击保存
  → 检查所有质检节点
    ├── 每个质检节点都有 2 条出线 → 允许保存
    └── 存在质检节点出线 < 2 → 弹窗警告 + 定位到该节点
```

---

## 6. 异常/边界状态

| 场景 | 处理 |
|------|------|
| 质检节点无检测项目 | 节点红色边框 invalid，参数面板提示 "请添加检测项目" |
| 仅 1 条出线 | 保存时警告 "质检节点必须连接通过和不通过两条路径" |
| 两条出线连接到同一节点 | 允许（通过和不通过都去同一工序） |
| 删除质检节点 | 与普通节点删除行为一致 |
| 只读模式下查看质检节点 | 显示完整但不可编辑 |

---

# 第八部分：TASK-005 质检节点 — 技术设计（架构师）

> 日期：2026-07-11
> 角色：架构师
> 基于：PRD TASK-005 + UX 交互设计

---

## 1. 设计原则

- **新节点类型**：质检节点不是工序，不关联 `process_library`，是独立的内置节点类型
- **最小侵入**：复用现有节点机制（React Flow nodeTypes），新增 `inspection` 类型
- **端口扩展**：通过 React Flow 的 Handle 多端口机制实现双输出

---

## 2. 新增/修改文件清单

```
src/
├── pages/
│   └── RouteEditor/
│       ├── nodes/
│       │   └── InspectionNode.tsx        # 新增：质检节点组件（菱形+双输出端口）
│       ├── edges/
│       │   └── InspectionEdge.tsx        # 新增：质检连线组件（通过/不通过标签）
│       ├── ProcessPanel.tsx              # 修改：新增「特殊节点」分组
│       ├── CanvasView.tsx                # 修改：注册 InspectionNode + InspectionEdge
│       └── ParamPanel.tsx                # 修改：质检节点参数编辑表单
├── stores/
│   └── routeStore.ts                     # 修改：addInspectionNode action + 保存校验
├── lib/
│   └── types/
│       └── route.ts                      # 修改：RouteNode.type 扩展 + InspectionData
├── components/
│   └── ui/
│       └── InspectionParamForm.tsx       # 新增：质检参数配置子组件
├── lib/
│   └── utils/
│       └── inspectionValidation.ts       # 新增：质检节点校验工具
└── styles/
    └── global.css                        # 修改：质检节点/连线样式
```

---

## 3. 类型定义扩展

```typescript
// src/lib/types/route.ts — 扩展

// RouteNode.type 扩展
export type RouteNodeType = 'process' | 'start' | 'end' | 'inspection'

// RouteNode 中 type 字段更新
export interface RouteNode {
  id: string
  type: RouteNodeType
  position: { x: number; y: number }
  data: {
    processId?: number           // inspection 类型无此字段
    name: string
    params: Record<string, any>  // inspection 时存储检测项目
    requiredParams?: string[]
    isValid?: boolean
    // 质检节点独有
    inspectionItems?: InspectionItem[]
  }
}

/** 检测项目 */
export interface InspectionItem {
  id: string
  name: string          // 检测项目名称，如「工频耐压」
  standardValue?: number // 标准值
  unit?: string          // 单位，如 kV
  deviationType?: 'none' | 'percent' | 'absolute'  // 偏差类型
  deviationValue?: number // 偏差值
}

/** 质检连线数据 */
export interface InspectionEdgeData {
  label: 'pass' | 'fail'
  labelText: string      // '✅ 通过' 或 '❌ 不通过'
}

// Handle ID 常量
export const INSPECTION_HANDLES = {
  PASS: 'pass',
  FAIL: 'fail',
} as const
```

---

## 4. 质检节点组件设计

### 4.1 InspectionNode

```typescript
// src/pages/RouteEditor/nodes/InspectionNode.tsx

// 使用 CSS 菱形 + 琥珀色主题
// 三个 Handle：
//   - type="target", position=Left (1个输入)
//   - type="source", position=Right, id="pass" (通过)
//   - type="source", position=Right, id="fail" (不通过)
//
// 参数预览：显示第一个检测项目名称
// 状态：selected / invalid / readonly 通过 className 控制
```

### 4.2 InspectionEdge（连线组件）

```typescript
// src/pages/RouteEditor/edges/InspectionEdge.tsx

// 自定义连线组件，根据 data.label 显示不同样式和标签：
//   - label='pass' → 绿色连线 + ✅ 通过 标签
//   - label='fail' → 红色连线 + ❌ 不通过 标签
// 使用 React Flow 的 EdgeLabelRenderer 渲染标签
```

---

## 5. Edge 类型注册

```typescript
// CanvasView.tsx 中扩展

const edgeTypes = {
  inspection: InspectionEdge,
  // smoothstep 为已有默认类型
}
```

在 `onConnect` 时，根据 `sourceHandle` 自动设置 edge type 和 data：

```typescript
// routeStore.ts onConnect 改造

onConnect: (connection) => {
  const { sourceHandle } = connection
  if (sourceHandle === 'pass' || sourceHandle === 'fail') {
    // 质检节点的连线
    const isPass = sourceHandle === 'pass'
    set({
      edges: addEdge({
        ...connection,
        type: 'inspection',
        data: {
          label: isPass ? 'pass' : 'fail',
          labelText: isPass ? '✅ 通过' : '❌ 不通过',
        } as InspectionEdgeData,
      }, get().edges),
      isDirty: true,
    })
  } else {
    // 普通连线
    set({
      edges: addEdge({ ...connection, type: 'smoothstep' }, get().edges),
      isDirty: true,
    })
  }
},
```

---

## 6. 序列化兼容

现有 RouteSnapshot 的 `edges` 中增加了 `type` 和 `data` 字段，已有旧路线：

```typescript
// 旧路线中的 edge 对象
{ id, source, target }  // 无 type，默认 smoothstep

// 新路线中的 edge 对象（含质检连线）
{ id, source, target, type: 'inspection', data: { label: 'pass', labelText: '✅ 通过' } }
```

React Flow 对不存在的 edge type 会回退到默认 `smoothstep`，因此旧路线完全兼容。

---

## 7. ProcessPanel 改造

```typescript
// ProcessPanel.tsx — 新增「特殊节点」分组

// 在自定义工序分组之后追加：
{/* 特殊节点 */}
<div className="process-panel__group">
  <div className="process-panel__group-title">特殊节点</div>
  <ul className="process-panel__list">
    <li
      className="process-panel__item process-panel__item--inspection"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'inspection' }))
        e.dataTransfer.effectAllowed = 'copy'
      }}
    >
      <span className="process-panel__item-icon">🔍</span>
      <span className="process-panel__item-name">质检节点</span>
    </li>
  </ul>
</div>
```

---

## 8. CanvasView 拖拽落点改造

```typescript
// CanvasView.tsx onDrop 改造

const onDrop = useCallback((event: DragEvent) => {
  event.preventDefault()
  const data = event.dataTransfer.getData('application/json')
  if (!data || !reactFlowInstance.current || !reactFlowWrapper.current) return

  const parsed = JSON.parse(data)
  const position = reactFlowInstance.current.screenToFlowPosition({
    x: event.clientX, y: event.clientY,
  })

  if (parsed.type === 'inspection') {
    onDropInspectionNode(position)  // 新增回调
  } else {
    onDropNode(parsed.processId, position)
  }
}, [onDropNode, onDropInspectionNode])
```

---

## 9. Store 扩展

```typescript
// stores/routeStore.ts — 新增

// 新增状态
inspectionCount: number  // 当前路线中质检节点计数（用于自动命名）

// 新增 Action
addInspectionNode: (position: { x: number; y: number }) => void  // 添加质检节点
validateInspectionNodes: () => boolean  // 保存前校验（所有质检节点都有2条出线）

// addInspectionNode 实现
addInspectionNode: (position) => {
  const { nodes, inspectionCount } = get()
  const id = `inspection_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const newNode: Node = {
    id,
    type: 'inspection',
    position,
    data: {
      name: `质检 ${inspectionCount + 1}`,
      params: {},
      inspectionItems: [],
      isValid: false,
    },
  }
  set({
    nodes: [...nodes, newNode],
    inspectionCount: inspectionCount + 1,
    isDirty: true,
  })
}

// validateInspectionNodes 实现
validateInspectionNodes: () => {
  const { nodes, edges } = get()
  const inspectionNodes = nodes.filter(n => n.type === 'inspection')
  for (const node of inspectionNodes) {
    const outgoingEdges = edges.filter(e => e.source === node.id)
    if (outgoingEdges.length !== 2) {
      return false  // 校验失败
    }
    // 检查是否有通过和不通过两条
    const handleIds = outgoingEdges.map(e => e.sourceHandle)
    if (!handleIds.includes('pass') || !handleIds.includes('fail')) {
      return false
    }
  }
  return true
}
```

---

## 10. ParamPanel 扩展

```typescript
// ParamPanel.tsx — 新增质检节点参数编辑

// 当 selectedNode.type === 'inspection' 时：
// 渲染 InspectionParamForm 组件
// 包含：
// - 节点名称编辑
// - 检测项目列表（可添加/编辑/删除）
// - 每个检测项：名称/标准值/单位/偏差类型/偏差值
```

---

## 11. 保存前校验

```typescript
// RouteEditor/index.tsx — handleSave 改造

const handleSave = useCallback(async () => {
  if (!store.validateInspectionNodes()) {
    // 弹出警告弹窗
    setShowValidationWarning(true)
    return
  }
  await store.saveRoute()
}, [])
```

---

## 12. 安全审查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| SQL 注入 | ✅ 不涉及 | 质检节点不新增数据库操作 |
| IPC 安全 | ✅ 不涉及 | 纯前端节点类型，无需新 IPC |
| 数据完整性 | ✅ 安全 | 质检节点数据作为快照 JSON 存储 |
| 旧数据兼容 | ✅ 安全 | 旧路线无 inspection 类型节点，无影响 |

---

## 13. 性能评估

| 场景 | 预期表现 | 说明 |
|------|---------|------|
| 质检节点渲染（单个） | <5ms | 简单的菱形 CSS 节点 |
| 质检连线渲染 | <5ms | 自定义 edge 增加 label 渲染 |
| 保存前校验（10个质检节点） | <1ms | 纯内存遍历 |
| 旧路线加载 | 无额外开销 | 无 inspection 节点时 0 影响 |

---

## 14. 影响范围

| 影响模块 | 修改内容 |
|---------|---------|
| `src/lib/types/route.ts` | RouteNodeType 扩展 + InspectionItem/InspectionEdgeData 类型 |
| `src/stores/routeStore.ts` | 新增 addInspectionNode / validateInspectionNodes，onConnect 改造 |
| `src/pages/RouteEditor/nodes/InspectionNode.tsx` | 新增 |
| `src/pages/RouteEditor/edges/InspectionEdge.tsx` | 新增 |
| `src/pages/RouteEditor/ProcessPanel.tsx` | 新增「特殊节点」分组 |
| `src/pages/RouteEditor/CanvasView.tsx` | 注册 nodeTypes/edgeTypes，拖拽落点改造 |
| `src/pages/RouteEditor/ParamPanel.tsx` | 质检节点参数编辑表单 |
| `src/pages/RouteEditor/index.tsx` | 保存前校验逻辑 |
| `src/components/ui/InspectionParamForm.tsx` | 新增 |
| `src/lib/utils/inspectionValidation.ts` | 新增 |
| `src/styles/global.css` | 质检节点/连线样式 |

---

# 第九部分：TASK-006 生产管理 — UX 交互设计

> 日期：2026-07-11
> 角色：UX 设计师
> 基于 PRD：TASK-006 生产管理 — 工单管理 + 工序流转

---

## 1. 信息架构

### 1.1 导航入口

顶部导航栏「生产」按钮从占位状态激活：

```
[总览] [📍生产] [工艺] [库存] [质量] [设备]
         ↕ 激活高亮
```

- 点击「生产」进入工单列表页（默认视图）
- 列表页中点击「新建工单」或「工单号」进入工单详情页
- 工单详情页内嵌工序流转看板和报工操作区

### 1.2 页面清单

| 页面 | 路径概念 | 用途 |
|------|---------|------|
| **工单列表** | `/production` | 浏览、筛选、搜索、新建工单 |
| **工单创建** | `/production/new` | 填写工单信息并提交 |
| **工单详情** | `/production/:id` | 查看工单全貌、执行报工、查看流转记录 |

### 1.3 页面流转图

```
[导航栏"生产"] → [工单列表页]
                    ├── 点击「+ 新建工单」 → [工单创建页]
                    ├── 点击「工单号」→ [工单详情页]
                    │          ├── 选择当前工序 → [报工操作区]（在详情页内嵌）
                    │          ├── 点击「回退」→ [回退确认弹窗]
                    │          └── 点击「关闭工单」→ [关闭确认弹窗]
                    └── 筛选/搜索 → 列表刷新
```

---

## 2. 工单列表页

### 2.1 页面布局

```
┌──────────────────────────────────────────────────────────────────┐
│  生产管理                              [+ 新建工单]              │ ← 标题+操作栏
├──────────────────────────────────────────────────────────────────┤
│  筛选: [全部状态 ▼] [产品选择 ▼] [日期范围]  [搜索工单号...]    │ ← 过滤栏
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ 工单号        产品      数量  进度          状态    更新日期 ││ ← 表头
│  ├──────────────────────────────────────────────────────────────┤│
│  │ WO-20260711  10kV绝缘子  500  ████████░░ 80%  🟢生产中  07-11││ ← 进度条
│  │ WO-20260710  针式绝缘子  200  ██████████ 100% ✅已完成  07-10││
│  │ WO-20260709  支柱绝缘子  300  ░░░░░░░░░░  0%  ⏳待排产  07-09││
│  │ ...                                                          ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│  共 N 条                                                    [1] [2]│ ← 分页
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 工单列表每行元素

| 元素 | 说明 |
|------|------|
| **工单号** | 蓝色可点击，进入详情页 |
| **产品** | 产品名称/编码 |
| **数量** | 计划数量（件） |
| **进度条** | 已完成工序数/总工序数，百分比显示，颜色随状态变化（生产中蓝色、已完成绿色） |
| **状态标签** | 带颜色标签：待排产灰 / 生产中蓝 / 已完成绿 / 已关闭灰 |
| **更新日期** | 格式 `MM-DD` |
| **操作按钮** | 生产中/待排产 →「编辑」，已完成 →「查看」 |

### 2.3 筛选栏

| 筛选维度 | 控件 | 说明 |
|---------|------|------|
| **状态** | 下拉选择 | 全部 / 待排产 / 生产中 / 已完成 / 已关闭 |
| **产品** | 下拉选择 | 按产品名称筛选 |
| **日期** | 日期范围选择 | 按创建日期范围筛选 |
| **搜索** | Input | 按工单号模糊搜索 |

### 2.4 空状态

```
┌──────────────────────────────────────────┐
│                                          │
│          📋 暂无工单                      │
│    点击「+ 新建工单」开始生产管理         │
│                                          │
│          [ + 新建工单 ]                   │
│                                          │
└──────────────────────────────────────────┘
```

---

## 3. 工单创建页

### 3.1 页面布局

```
┌──────────────────────────────────────────────────────┐
│  ← 返回列表     新建生产工单              [取消] [保存] │ ← 顶栏
├──────────────────────────────────────────────────────┤
│                                                      │
│  产品信息                                            │
│  ┌──────────────────────────────────────────────────┐│
│  │  产品名称 *         [ 10kV绝缘子  ▼          ]  ││ ← 下拉选择
│  │  计划数量 *         [ 500                  ] 件 ││ ← 数字输入
│  │  批号（可选）       [ B20260711-001        ]    ││ ← 自动生成可修改
│  │  备注              [ 急单，优先排产       ]    ││ ← textarea
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  工艺路线                                            │
│  ┌──────────────────────────────────────────────────┐│
│  │  关联工艺路线 *    [ 查看可选路线 ▼         ]  ││
│  │                                                   ││
│  │  已选: 10kV绝缘子标准工艺路线 v1.0              ││  ← 选中后显示
│  │         制泥 → 成型 → 修坯 → 上釉 → 烧成        ││    路线摘要
│  │         → 胶装 → 试验 → 包装                    ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  排产信息                                            │
│  ┌──────────────────────────────────────────────────┐│
│  │  计划开始日期     [ 2026-07-11  📅          ]    ││
│  │  计划完成日期     [ 2026-07-18  📅          ]    ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3.2 选择工艺路线弹窗

点击「查看可选路线」弹出选择弹窗：

```
┌──────────────────────────────────────────────┐
│  选择工艺路线                        ×       │
│  ──────────────────────────────────────      │
│                                               │
│  [搜索路线名称...]                             │
│                                               │
│  ┌──────────────────────────────────────────┐│
│  │ 路线名称              版本  节点数  操作  ││
│  │──────────────────────────────────────────││
│  │ 10kV绝缘子工艺路线    v1.0  8      [选择]││
│  │ 针式绝缘子工艺路线    v1.2  6      [选择]││
│  │ 支柱绝缘子工艺路线    v0.3  5      [选择]││
│  └──────────────────────────────────────────┘│
│                                               │
│  仅显示「已发布」的工艺路线                    │
└──────────────────────────────────────────────┘
```

### 3.3 表单校验

| 字段 | 规则 | 错误提示 |
|------|------|---------|
| 产品名称 | 必填 | "请选择产品" |
| 计划数量 | > 0 | "数量必须大于 0" |
| 关联路线 | 必选 | "请选择工艺路线" |
| 批号 | 可选，自动生成 | — |
| 开始日期 | 可选 | — |

---

## 4. 工单详情页

### 4.1 页面布局

```
┌──────────────────────────────────────────────────────────────┐
│  ← 返回列表  WO-20260711-001    🟢生产中    [编辑] [关闭]   │ ← 顶栏
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌── 工单信息 ─────────────────────────────────────────────┐ │
│  │  产品: 10kV绝缘子                        批号: B20260711-001│
│  │  数量: 500 件         已报工: 350 件 (70%)              │ │
│  │  路线: 10kV绝缘子标准工艺路线 v1.0                      │ │
│  │  创建: 生产主管  2026-07-11 08:00                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌── 工序流转 ─────────────────────────────────────────────┐ │
│  │  当前工序: 修坯 (工序3/8)                                │ │
│  │                                                          │ │
│  │  ┌────┐   ┌────┐   ┌────┐   ┌────┐   ┌────┐           │ │
│  │  │✅制泥│→ │✅成型│→ │🟦修坯│→ │⬜上釉│→ │⬜烧成│...  │ │ ← 工序流转条
│  │  └────┘   └────┘   └────┘   └────┘   └────┘           │ │
│  │  已完成     已完成    进行中     待开始    待开始        │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌── 工序报工 ─────────────────────────────────────────────┐ │
│  │  当前工序: 修坯                                          │ │
│  │                                                          │ │
│  │  完成数量 *     [ 150            ] 件                    │ │
│  │  其中合格数 *   [ 145            ] 件                    │ │
│  │  不合格数       5 件                                      │ │ ← 自动计算
│  │  投入工时 *     [ 180            ] 分钟                  │ │
│  │  设备           [ 修坯机-01  ▼   ]                      │ │
│  │  备注           [               ]                        │ │
│  │                                                          │ │
│  │                                       [ 提交报工 ]       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌── 报工记录 ─────────────────────────────────────────────┐ │
│  │  工序      操作人    完成数  合格数  工时  时间         │ │
│  │──────────────────────────────────────────────────────────│ │
│  │  制泥      张三      200     195     240   07-11 08:30  │ │
│  │  成型      李四      200     190     300   07-11 10:15  │ │
│  │  成型      李四      150     145     180   07-11 14:00  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 工序流转条设计

工序流转条是工单详情页的核心视觉组件，展示工单在工艺路线各节点的进度：

**各节点状态**：

| 状态 | 图标/颜色 | 说明 |
|------|----------|------|
| **已完成** | 绿色 ✅ 圆角方块 | 该工序已全部报工 |
| **进行中（当前工序）** | 蓝色 🟦 圆角方块 + 脉动边框 | 当前可操作工序 |
| **待开始** | 灰色 ⬜ 虚框 | 尚未到达的工序 |
| **质检节点** | 琥珀色 🔶 菱形 + 特殊标记 | 需完成质检才流转 |
| **跳过（可选）** | 灰色虚线框 + ↩️ | 可跳过的工序 |

**节点间连线**：
- 已完成节点之间：绿色实线箭头
- 进行中→待开始：灰色虚线箭头
- 所有连线方向从左到右

**交互**：
- 点击任意已完成的工序节点：展开该工序的报工摘要
- 点击当前工序（进行中）：滚动到报工操作区
- Hover 节点：显示该工序累计完成数/合格率

### 4.3 布局说明

| 区域 | 说明 |
|------|------|
| **工单信息卡片** | 顶栏下方，展示工单核心信息，背景浅色 |
| **工序流转条** | 水平排列的工序节点，带状态和连接线 |
| **工序报工区** | 当前工序的表单操作区域（仅生产中状态可见） |
| **报工记录表** | 全部已完成的报工记录列表（按时间倒序） |

---

## 5. 工序报工操作

### 5.1 报工表单

当工单状态为「生产中」时，报工区显示在当前工序下方：

**字段说明**:

| 字段 | 控件 | 说明 |
|------|------|------|
| **完成数量** | 数字输入，必填 | 本次报工完成的总件数 |
| **其中合格数** | 数字输入，必填 | 合格品数量 |
| **不合格数** | 自动计算 | = 完成数量 - 合格数，不可修改 |
| **投入工时** | 数字输入，必填 | 本次报工投入的工时（分钟） |
| **设备** | 下拉选择，可选 | 从设备列表中选择 |
| **备注** | Input，可选 | 报工备注 |

### 5.2 报工提交后行为

```
提交报工
  → 校验：完成数量 ≤ 工单剩余量
    ├── 失败 → 红色提示 "报工数量（含累计）不能超过工单总量 N"
    └── 成功 → 保存报工记录
        → 更新在制品数（上工序减、本工序加）
        → 刷新工序流转条
        → Toast "工序报工成功"
        → 如果本工序为末道工序 → 工单自动「已完成」
        → 如果本工序有质检节点 → 提示 "质检节点待检验"
```

### 5.3 质检节点特殊处理

当当前工序为质检节点时，报工区显示：

```
┌── 工序报工 ─────────────────────────────────────────────┐
│  当前工序: 🔶 试验（质检节点）                          │
│                                                          │
│  ⚠️ 本工序为质量检验节点                                 │
│                                                          │
│  检验数量     [ 150            ] 件                      │
│                                                          │
│  合格数 *     [ 148            ] 件                      │
│  不合格数     2 件                                        │
│                                                          │
│  ┌── 检测项目 ─────────────────────────────────────┐    │
│  │  ☑ 工频耐压: 70kV    实测: [ 72  ] ✅          │    │
│  │  ☐ 外观检查: 合格    实测: [ 合格 ▼ ]          │    │
│  │  ☐ 机电破坏: ≥120kN  实测: [ 135  ]            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  [ 提交检验结果 ]                                        │
└──────────────────────────────────────────────────────────┘
```

- 检测项目从工艺路线质检节点的配置自动加载
- 每项实测值填写后自动判定（合格/不合格）
- 全部项目判定完成后可提交
- 不合格数量自动汇总

---

## 6. 工单状态流转展示

### 6.1 状态标签

```
待排产 → ⏳ 灰色标签 "待排产"
生产中 → 🟢 蓝色标签 "生产中（3/8）"
已完成 → ✅ 绿色标签 "已完成"
已关闭 → 🔘 灰色标签 "已关闭"
```

### 6.2 状态变更记录

在工单详情页底部，展示状态变更时间线：

```
┌── 状态变更记录 ────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🟢 2026-07-11 08:00  创建工单 → 待排产   生产主管   │ │
│  │ 🟢 2026-07-11 08:30  待排产 → 生产中    生产主管   │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. 关闭工单确认弹窗

```
┌──────────────────────────────────┐
│  🔒 关闭工单                      │
│  ────────────────────────────    │
│                                   │
│  确认关闭工单 WO-20260711-001？  │
│                                   │
│  关闭后：                        │
│  • 工单标记为「已关闭」          │
│  • 不可再执行工序报工            │
│  • 数据保留用于追溯              │
│                                   │
│  [取消]    [确认关闭]            │
└──────────────────────────────────┘
```

---

## 8. 工序回退确认弹窗

```
┌──────────────────────────────────┐
│  ↩️ 工序回退                      │
│  ────────────────────────────    │
│                                   │
│  回退工序: 修坯 ← 上釉           │
│                                   │
│  回退原因 *                      │
│  [ 上釉发现修坯尺寸超差，退回重修│
│  ]                               │
│                                   │
│  [取消]    [确认回退]            │
└──────────────────────────────────┘
```

---

## 9. 键盘快捷键

| 快捷键 | 操作 |
|--------|------|
| `Ctrl+S` | 保存新建工单 |
| `Ctrl+Enter` | 提交报工 |
| `Esc` | 关闭弹窗 |
| `F5` | 刷新工单详情 |

---

## 10. 异常/错误状态

| 场景 | 处理方式 |
|------|---------|
| 工单详情加载失败 | 显示"加载失败，点击重试" + 重试按钮 |
| 报工提交失败（DB错误） | Toast 红色"提交失败，请重试"，数据保留在表单 |
| 当前工序为质检节点但未配置检测项目 | 黄色警告"该质检节点参数不完整，请联系工艺工程师" |
| 工单所有工序已报工但状态未更新 | 手动「刷新」按钮，触发状态检查 |
| 工单列表为空 | 空状态引导 + 新建工单按钮 |
| 选择工艺路线时无已发布的路线 | 提示"暂无可用的工艺路线，请先在工艺模块创建并发布" |

---

## 11. 与现有模块的关系

### 11.1 导航关系

```
工艺模块（TASK-002~005）              生产模块（TASK-006）
┌──────────────────┐                 ┌──────────────────┐
│ 工艺路线设计      │                 │ 工单管理          │
│ 工序库管理        │ ──提供路线──→  │ 工序流转          │
│ 质检节点配置      │ ──提供质检标准→ │ 质检节点报工      │
└──────────────────┘                 └──────────────────┘
```

### 11.2 数据复用

| 工艺模块数据 | 生产模块使用方式 |
|-------------|----------------|
| 工艺路线（已发布） | 工单创建时选择，决定工序流转顺序 |
| 工序名称/编码 | 报工记录中引用 |
| 质检节点检测项目 | 质检节点报工时自动加载检测项 |
| 工序参数模板 | 报工时可查看当前工序标准参数 |

---

## 12. 响应式说明

| 屏幕宽度 | 布局调整 |
|---------|---------|
| ≥1200px | 三栏：工单信息 + 工序流转 + 报工表单 并排 |
| 900-1200px | 两栏：信息+流转 上，报工单 下 |
| <900px | 单栏：垂直排列，全部展开 |



---

# 第十部分：TASK-006 生产管理 — 技术设计（架构师）

> 日期：2026-07-11
> 角色：架构师
> 基于：PRD TASK-006 + UX 交互设计（第九部分）

---

## 1. 设计原则

- **复用优先**：工单流转严格遵循已发布工艺路线的节点顺序和质检配置
- **数据不可篡改**：报工记录只可红冲不可删除，状态变更只可追加
- **自动计算**：在制品数量由报工记录实时聚合，不依赖独立录入
- **渐进扩展**：本次只实现 P0/P1 功能，P2 功能预留接口
- **最少新增依赖**：不引入新 npm 包，复用现有技术栈

---

## 2. 新增/修改文件清单

```
src/
├── pages/
│   └── Production/                              # 新增：生产管理模块目录
│       ├── OrderList/
│       │   └── index.tsx                        # 新增：工单列表页
│       ├── OrderCreate/
│       │   └── index.tsx                        # 新增：工单创建页
│       └── OrderDetail/
│           ├── index.tsx                        # 新增：工单详情页
│           ├── ProcessFlowBar.tsx               # 新增：工序流转条组件
│           ├── WorkReportForm.tsx               # 新增：报工表单组件（含质检特殊处理）
│           └── StatusTimeline.tsx               # 新增：状态变更时间线组件
├── stores/
│   └── workOrderStore.ts                        # 新增：工单 Zustand Store
├── lib/
│   └── types/
│       └── production.ts                        # 新增：生产管理类型定义
├── components/
│   └── ui/
│       └── RouteSelectDialog.tsx                # 新增：工艺路线选择弹窗（仅已发布）
├── styles/
│   └── global.css                               # 修改：新增生产页面样式
├── App.tsx                                      # 修改：注册生产路由 + 导航激活

electron/
├── database.ts                                  # 修改：新增产品/工单/报工/日志表
├── handlers.ts                                  # 修改：注册生产相关 IPC handler
├── production-handlers.ts                       # 新增：生产管理 IPC handler 实现
└── preload.ts                                   # 修改：暴露生产管理 API
```

---

## 3. 数据库设计（Drizzle ORM Schema）

### 3.1 产品表（新建）

```typescript
// src/lib/db/schema.ts — 新增
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),           // 产品编码，如 PRD-001
  name: text("name").notNull(),                     // 产品名称，如 10kV绝缘子
  specs: text("specs"),                             // 规格型号
  unit: text("unit").default("件"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
```

### 3.2 工单表（新建）

```typescript
// src/lib/db/schema.ts — 新增
export const workOrders = sqliteTable("work_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNo: text("order_no").notNull().unique(),     // 工单号 WO-YYYYMMDD-NNN
  productId: integer("product_id").notNull(),        // 关联产品
  productName: text("product_name").notNull(),       // 产品名称冗余（产品表可删时保留）
  plannedQty: integer("planned_qty").notNull(),      // 计划数量
  batchNo: text("batch_no"),                          // 批号，如 B20260711-001
  routeId: integer("route_id").notNull(),             // 关联工艺路线 ID
  routeName: text("route_name").notNull(),            // 路线名称冗余
  routeVersion: text("route_version").notNull(),      // 路线版本号
  routeSnapshot: text("route_snapshot").notNull(),    // 创建时的路线快照（JSON）（锁定节点顺序）
  status: text("status").notNull().default("pending"), // 状态：pending/in_progress/completed/closed
  currentProcessIndex: integer("current_process_index").default(0), // 当前工序索引（路线节点数组下标）
  totalProcessCount: integer("total_process_count").default(0),    // 总工序数
  plannedStartDate: text("planned_start_date"),
  plannedEndDate: text("planned_end_date"),
  remark: text("remark"),
  createdBy: text("created_by").default("system"),    // 创建人
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  closedAt: text("closed_at"),                         // 关闭时间
});
```

**关于 `routeSnapshot` 的说明**：
- 工单创建时，将所选路线的完整 JSON 快照（节点+边）复制到此字段
- 后续即使原始路线变更或归档，工单的工序流转不受影响
- 报工时从 `routeSnapshot` 解析当前工序的名称/参数/质检配置

### 3.3 报工记录表（新建）

```typescript
export const workReports = sqliteTable("work_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),              // 关联工单
  processIndex: integer("process_index").notNull(),    // 工序在路线中的索引（从0开始）
  processName: text("process_name").notNull(),         // 工序名称冗余
  nodeId: text("node_id").notNull(),                   // 路线节点 ID（来自快照）
  operator: text("operator").notNull(),                 // 操作人
  completedQty: integer("completed_qty").notNull(),     // 完成数量
  qualifiedQty: integer("qualified_qty").notNull(),     // 合格数
  defectiveQty: integer("defective_qty").default(0),    // 不合格数（= completed - qualified）
  workHours: integer("work_hours").notNull(),           // 投入工时（分钟）
  equipmentId: integer("equipment_id"),                 // 关联设备（可选）
  remark: text("remark"),
  isReversed: integer("is_reversed").default(0),        // 是否已红冲（0=正常，1=已红冲）
  reversedAt: text("reversed_at"),                      // 红冲时间
  reversedBy: text("reversed_by"),                      // 红冲操作人
  createdAt: text("created_at").notNull(),
  createdBy: text("created_by").default("system"),
});
```

### 3.4 报工明细表（质检检测项目记录）

```typescript
export const workReportDetails = sqliteTable("work_report_details", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: integer("report_id").notNull(),            // 关联报工记录
  inspectionName: text("inspection_name").notNull(),   // 检测项目名称
  standardValue: text("standard_value"),               // 标准值（字符串，可能含单位）
  actualValue: text("actual_value"),                   // 实测值
  deviation: text("deviation"),                        // 偏差描述
  result: text("result").notNull(),                    // 判定结果：合格/不合格
  createdAt: text("created_at").notNull(),
});
```

此表仅在质检节点报工时写入，普通工序报工不产生该表记录。

### 3.5 工单状态变更日志表（新建）

```typescript
export const workOrderLogs = sqliteTable("work_order_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  fromStatus: text("from_status"),                     // 变更前状态（首次创建为 null）
  toStatus: text("to_status").notNull(),               // 变更后状态
  changeType: text("change_type").notNull(),           // 变更类型：create/start/close/report/reverse/rollback
  description: text("description"),
  operator: text("operator").notNull(),
  createdAt: text("created_at").notNull(),
});
```

### 3.6 索引策略

```sql
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_order_no ON work_orders(order_no);
CREATE INDEX idx_work_orders_product_id ON work_orders(product_id);
CREATE INDEX idx_work_reports_order_id ON work_reports(order_id);
CREATE INDEX idx_work_reports_order_process ON work_reports(order_id, process_index);
CREATE INDEX idx_work_order_logs_order_id ON work_order_logs(order_id);
CREATE INDEX idx_work_report_details_report_id ON work_report_details(report_id);
```

---

## 4. 类型定义

### 4.1 新建文件 `src/lib/types/production.ts`

```typescript
/* ── 产品 ── */
export interface ProductItem {
  id: number;
  code: string;
  name: string;
  specs?: string;
  unit: string;
  isActive: boolean;
}

/* ── 工单状态 ── */
export type WorkOrderStatus = "pending" | "in_progress" | "completed" | "closed";

/* ── 工单列表项 ── */
export interface WorkOrderListItem {
  id: number;
  orderNo: string;
  productName: string;
  plannedQty: number;
  status: WorkOrderStatus;
  currentProcessIndex: number;
  totalProcessCount: number;
  routeName: string;
  updatedAt: string;
}

/* ── 工单详情 ── */
export interface WorkOrderDetail {
  id: number;
  orderNo: string;
  productId: number;
  productName: string;
  plannedQty: number;
  batchNo?: string;
  routeId: number;
  routeName: string;
  routeVersion: string;
  routeSnapshot: RouteSnapshot; // 从 JSON 解析
  status: WorkOrderStatus;
  currentProcessIndex: number;
  totalProcessCount: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  remark?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

/* ── 工单创建参数 ── */
export interface CreateWorkOrderData {
  productId: number;
  productName: string;
  plannedQty: number;
  batchNo?: string;
  routeId: number;
  routeName: string;
  routeVersion: string;
  routeSnapshot: string; // JSON 字符串
  plannedStartDate?: string;
  plannedEndDate?: string;
  remark?: string;
}

/* ── 工单列表查询参数 ── */
export interface WorkOrderListParams {
  status?: WorkOrderStatus | "all";
  productId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/* ── 报工记录 ── */
export interface WorkReportItem {
  id: number;
  orderId: number;
  processIndex: number;
  processName: string;
  nodeId: string;
  operator: string;
  completedQty: number;
  qualifiedQty: number;
  defectiveQty: number;
  workHours: number;
  equipmentId?: number;
  equipmentName?: string;
  remark?: string;
  isReversed: boolean;
  createdAt: string;
  details?: WorkReportDetailItem[]; // 质检节点报工时的检测明细
}

/* ── 报工提交参数 ── */
export interface SubmitWorkReportData {
  orderId: number;
  processIndex: number;
  processName: string;
  nodeId: string;
  operator: string;
  completedQty: number;
  qualifiedQty: number;
  workHours: number;
  equipmentId?: number;
  remark?: string;
  inspectionResults?: InspectionResult[];  // 质检节点时传入
}

/* ── 质检检测结果 ── */
export interface InspectionResult {
  inspectionName: string;
  standardValue?: string;
  actualValue: string;
  result: "合格" | "不合格";
}

/* ── 报工检测明细 ── */
export interface WorkReportDetailItem {
  id: number;
  reportId: number;
  inspectionName: string;
  standardValue?: string;
  actualValue: string;
  result: "合格" | "不合格";
}

/* ── 状态变更日志 ── */
export interface WorkOrderLogItem {
  id: number;
  fromStatus?: string;
  toStatus: string;
  changeType: string;
  description?: string;
  operator: string;
  createdAt: string;
}

/* ── 工单进度 ── */
export interface WorkOrderProgress {
  orderId: number;
  orderNo: string;
  status: WorkOrderStatus;
  currentProcessIndex: number;
  totalProcessCount: number;
  processes: ProcessProgressItem[];
}

export interface ProcessProgressItem {
  index: number;
  nodeId: string;
  name: string;
  type: "process" | "inspection";
  status: "pending" | "current" | "completed" | "skipped";
  /** 累计完成数量（从报工记录聚合） */
  totalCompletedQty: number;
  totalQualifiedQty: number;
  /** 是否有未完成的报工 */
  hasPendingReport: boolean;
}

/* ── 在制品数据（后续 TASK-007 会扩展） ── */
export interface WipData {
  processIndex: number;
  processName: string;
  wipQty: number; // 流入 - 流出
}
```

### 4.2 ElectronAPI 扩展

```typescript
// ElectronAPI 新增生产管理接口
interface ElectronAPI {
  // ... 已有接口保持不变 ...

  // 新增：生产管理 API
  production: {
    // 产品
    listProducts: () => Promise<ProductItem[]>;

    // 工单
    listWorkOrders: (params: WorkOrderListParams) => Promise<{
      items: WorkOrderListItem[];
      total: number;
    }>;
    getWorkOrder: (id: number) => Promise<WorkOrderDetail | null>;
    createWorkOrder: (data: CreateWorkOrderData) => Promise<WorkOrderDetail>;
    updateWorkOrderStatus: (id: number, status: string) => Promise<void>;
    closeWorkOrder: (id: number) => Promise<void>;
    rollbackProcess: (orderId: number, toIndex: number, reason: string) => Promise<void>;

    // 报工
    submitWorkReport: (data: SubmitWorkReportData) => Promise<WorkReportItem>;
    reverseWorkReport: (reportId: number, reason: string) => Promise<void>;
    listWorkReports: (orderId: number) => Promise<WorkReportItem[]>;

    // 进度与日志
    getWorkOrderProgress: (orderId: number) => Promise<WorkOrderProgress>;
    getWorkOrderLogs: (orderId: number) => Promise<WorkOrderLogItem[]>;
  };

  // 复用：已存在 route 模块，新增 getPublishedList
  route: {
    // ... 已有接口 ...
    getPublishedList: () => Promise<RouteListItem[]>; // 新增
  };
}
```

---

## 5. IPC 通道设计

### 5.1 通道命名与 Handler 签名

```typescript
// electron/production-handlers.ts

const CHANNELS = {
  PRODUCT_LIST: "production:product-list",

  WORK_ORDER_LIST: "production:work-order-list",
  WORK_ORDER_GET_BY_ID: "production:work-order-get-by-id",
  WORK_ORDER_CREATE: "production:work-order-create",
  WORK_ORDER_UPDATE_STATUS: "production:work-order-update-status",
  WORK_ORDER_CLOSE: "production:work-order-close",
  WORK_ORDER_ROLLBACK: "production:work-order-rollback",

  WORK_REPORT_SUBMIT: "production:work-report-submit",
  WORK_REPORT_REVERSE: "production:work-report-reverse",
  WORK_REPORT_LIST: "production:work-report-list",

  WORK_ORDER_PROGRESS: "production:work-order-progress",
  WORK_ORDER_LOGS: "production:work-order-logs",
};
```

### 5.2 核心 Handler 逻辑

#### 创建工单

```typescript
ipcMain.handle(CHANNELS.WORK_ORDER_CREATE, (_e, data: CreateWorkOrderData) => {
  const db = getDb();
  const now = new Date().toISOString();

  // 自动生成工单号
  const dateStr = now.slice(0, 10).replace(/-/g, "");
  const lastOrder = db.prepare(
    "SELECT order_no FROM work_orders WHERE order_no LIKE ? ORDER BY id DESC LIMIT 1"
  ).get(`${dateStr}-%`) as { order_no: string } | undefined;
  const seq = lastOrder ? (parseInt(lastOrder.order_no.split("-").pop() || "0") + 1) : 1;
  const orderNo = `WO-${dateStr}-${String(seq).padStart(3, "0")}`;

  // 解析路线快照，计算总工序数
  const snapshot = JSON.parse(data.routeSnapshot);
  const processNodes = snapshot.nodes.filter((n: any) =>
    n.type === "process" || n.type === "inspection"
  );

  // INSERT 工单
  const result = db.prepare(`
    INSERT INTO work_orders (...) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(orderNo, data.productId, /* ... 全部字段 */);

  // 写入状态变更日志
  db.prepare(`
    INSERT INTO work_order_logs (order_id, from_status, to_status, change_type, operator, created_at)
    VALUES (?, NULL, 'pending', 'create', ?, ?)
  `).run(result.lastInsertRowid, "system", now);

  return { id: result.lastInsertRowid, orderNo, /* ... */ };
});
```

#### 提交报工

```typescript
ipcMain.handle(CHANNELS.WORK_REPORT_SUBMIT, (_e, data: SubmitWorkReportData) => {
  const db = getDb();

  // 1. 校验：累计报工 ≤ 工单计划数量
  const totalReported = db.prepare(`
    SELECT COALESCE(SUM(completed_qty), 0) as total
    FROM work_reports
    WHERE order_id = ? AND process_index = ? AND is_reversed = 0
  `).get(data.orderId, data.processIndex) as { total: number };

  const order = db.prepare("SELECT planned_qty FROM work_orders WHERE id = ?")
    .get(data.orderId) as { planned_qty: number };

  if (totalReported.total + data.completedQty > order.planned_qty) {
    throw new Error("报工数量（含累计）不能超过工单总量");
  }

  // 2. 插入报工记录
  const defectiveQty = data.completedQty - data.qualifiedQty;
  const r = db.prepare(`
    INSERT INTO work_reports (...) VALUES (...)
  `).run(/* ... */);
  const reportId = r.lastInsertRowid;

  // 3. 如果有质检检测结果，插入明细
  if (data.inspectionResults?.length) {
    const insertDetail = db.prepare(`
      INSERT INTO work_report_details (report_id, inspection_name, standard_value, actual_value, result, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const item of data.inspectionResults) {
      insertDetail.run(reportId, item.inspectionName, item.standardValue, item.actualValue, item.result, now);
    }
  }

  // 4. 检查是否为首次报工 → 自动变更为"生产中"
  const firstReport = db.prepare(`
    SELECT COUNT(*) as c FROM work_reports WHERE order_id = ? AND is_reversed = 0
  `).get(data.orderId) as { c: number };
  if (firstReport.c === 1) {
    db.prepare("UPDATE work_orders SET status = 'in_progress', updated_at = ? WHERE id = ?")
      .run(now, data.orderId);
    // 写日志
  }

  // 5. 检查是否为末道工序末次报工 → 自动完成
  const detail = db.prepare("SELECT total_process_count FROM work_orders WHERE id = ?")
    .get(data.orderId) as { total_process_count: number };
  if (data.processIndex === detail.total_process_count - 1
    && totalReported.total + data.completedQty >= order.planned_qty) {
    db.prepare("UPDATE work_orders SET status = 'completed', updated_at = ? WHERE id = ?")
      .run(now, data.orderId);
    // 写日志
  }

  return { id: reportId, /* ... */ };
});
```

#### 获取工单进度

```typescript
ipcMain.handle(CHANNELS.WORK_ORDER_PROGRESS, (_e, orderId: number) => {
  const db = getDb();
  const order = db.prepare("SELECT * FROM work_orders WHERE id = ?")
    .get(orderId) as any;
  const snapshot = JSON.parse(order.route_snapshot);

  // 按路线节点顺序构建进度列表
  const processNodes = snapshot.nodes.filter((n: any) =>
    ["process", "inspection", "start", "end"].includes(n.type)
  );

  // 聚合每个工序的报工数据
  const reports = db.prepare(`
    SELECT process_index, SUM(completed_qty) as total_qty,
           SUM(qualified_qty) as total_qualified
    FROM work_reports WHERE order_id = ? AND is_reversed = 0
    GROUP BY process_index
  `).all(orderId) as any[];

  const reportMap = new Map(reports.map(r => [r.process_index, r]));

  const processes = processNodes.map((node: any, i: number) => {
    const report = reportMap.get(i);
    let status: string;
    if (i < order.current_process_index) status = "completed";
    else if (i === order.current_process_index) status = "current";
    else status = "pending";

    if (node.type === "inspection" && status === "current") {
      // 如果质检节点已提交报工则标记 completed
      // （具体由当前索引推进逻辑决定）
    }

    return {
      index: i,
      nodeId: node.id,
      name: node.data?.name || node.type,
      type: node.type,
      status,
      totalCompletedQty: report?.total_qty || 0,
      totalQualifiedQty: report?.total_qualified || 0,
    };
  });

  return { orderId, orderNo: order.order_no, status: order.status,
    currentProcessIndex: order.current_process_index,
    totalProcessCount: order.total_process_count, processes };
});
```

---

## 6. Zustand Store 设计

### 6.1 新建文件 `src/stores/workOrderStore.ts`

```typescript
import { create } from "zustand";
import type {
  WorkOrderListItem,
  WorkOrderDetail,
  WorkReportItem,
  WorkOrderLogItem,
  WorkOrderProgress,
  WorkOrderListParams,
  SubmitWorkReportData,
  CreateWorkOrderData,
  ProductItem,
} from "../lib/types/production";
import type { RouteListItem } from "../lib/types/route";

interface WorkOrderState {
  /* ── 列表页 ── */
  orderList: WorkOrderListItem[];
  listLoading: boolean;
  listParams: WorkOrderListParams;
  listTotal: number;
  products: ProductItem[];
  publishedRoutes: RouteListItem[];

  /* ── 详情页 ── */
  currentOrder: WorkOrderDetail | null;
  orderLoading: boolean;
  progress: WorkOrderProgress | null;
  workReports: WorkReportItem[];
  orderLogs: WorkOrderLogItem[];

  /* ── 创建页 ── */
  createLoading: boolean;

  /* ── Actions ── */
  fetchOrderList: (params?: WorkOrderListParams) => Promise<void>;
  fetchOrderDetail: (id: number) => Promise<void>;
  createWorkOrder: (data: CreateWorkOrderData) => Promise<WorkOrderDetail>;
  closeWorkOrder: (id: number) => Promise<void>;
  rollbackProcess: (orderId: number, toIndex: number, reason: string) => Promise<void>;

  submitWorkReport: (data: SubmitWorkReportData) => Promise<void>;
  reverseWorkReport: (reportId: number, reason: string) => Promise<void>;

  fetchProducts: () => Promise<void>;
  fetchPublishedRoutes: () => Promise<void>;

  setListParams: (params: Partial<WorkOrderListParams>) => void;
  resetDetail: () => void;
}

export const useWorkOrderStore = create<WorkOrderState>((set, get) => ({
  // ... 状态 + Actions 实现
}));
```

---

## 7. 组件 Props 接口

### 7.1 ProcessFlowBar（工序流转条）

```typescript
// src/pages/Production/OrderDetail/ProcessFlowBar.tsx
interface ProcessFlowBarProps {
  processes: ProcessProgressItem[];  // 从 getWorkOrderProgress 获取
  currentIndex: number;
  onProcessClick?: (index: number) => void;
  readonly?: boolean;
}
```

### 7.2 WorkReportForm（报工表单）

```typescript
// src/pages/Production/OrderDetail/WorkReportForm.tsx
interface WorkReportFormProps {
  orderId: number;
  processIndex: number;
  processName: string;
  nodeType: "process" | "inspection";
  /** 质检节点专属：从路线快照解析的检测项目列表 */
  inspectionItems?: InspectionItem[];
  /** 路线快照中该节点的参数（可选） */
  nodeParams?: Record<string, any>;
  onSubmit: (data: SubmitWorkReportData) => Promise<void>;
  onSuccess?: () => void;
}
```

### 7.3 StatusTimeline（状态变更时间线）

```typescript
// src/pages/Production/OrderDetail/StatusTimeline.tsx
interface StatusTimelineProps {
  logs: WorkOrderLogItem[];
}
```

### 7.4 RouteSelectDialog（工艺路线选择弹窗）

```typescript
// src/components/ui/RouteSelectDialog.tsx
interface RouteSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (route: RouteListItem) => void;
  routes: RouteListItem[];
}
```

---

## 8. 与现有模块的集成

### 8.1 与 TASK-002（工艺路线）的集成

```
工单创建时
  → 调用 route:get-published-list 获取已发布路线
  → 用户选择路线后，调用 route:get-by-id 获取完整快照
  → 将快照 JSON 存入 work_orders.route_snapshot 字段

工单流转时
  → 从 routeSnapshot 解析节点列表（nodes）
  → 过滤出 type="process" | type="inspection" 的节点
  → 按 nodeIds 排序确定工序顺序
  → currentProcessIndex 指向当前工序
```

### 8.2 与 TASK-005（质检节点）的集成

```
报工提交时
  → 检查当前节点 type === "inspection"
  → 如果是质检节点：
    ├── 工单详情页显示 InspectionReportForm
    ├── 从 routeSnapshot 解析 inspectionItems
    ├── 填写实测值后自动判定合格/不合格
    └── 提交时一并写入 work_reports + work_report_details
  → 如果不是质检节点：显示普通 WorkReportForm
```

### 8.3 工单号生成规则

```
WO-{YYYYMMDD}-{3位流水号}
  └── 当天第1单: WO-20260711-001
  └── 当天第2单: WO-20260711-002
```

### 8.4 批号生成规则

```
B{YYYYMMDD}-{3位流水号}
  └── 用户可手动修改
  └── 自动生成时为当天第 N 批
```

### 8.5 状态自动变更规则

| 触发动作 | 前置条件 | 新状态 | 说明 |
|---------|---------|--------|------|
| 首次提交报工 | 工单状态为 pending | in_progress | 任何工序的首次报工 |
| 末道工序报工完成 | completed_qty ≥ planned_qty | completed | 末道工序累计报工达标 |
| 关闭工单 | 任意状态 | closed | 手动关闭，不可逆 |
| 回退工序 | 生产中状态 | 不变 | 仅 currentProcessIndex 回退 |
| 红冲报工 | 报工已存在 | 不变 | 不影响状态，只调整数量 |

---

## 9. 路由与导航

### 9.1 路由注册（App.tsx）

```typescript
// 新增路由
<Route path="/production" element={<OrderList />} />
<Route path="/production/new" element={<OrderCreate />} />
<Route path="/production/:id" element={<OrderDetail />} />
```

### 9.2 导航激活

```typescript
// 导航按钮
<button
  className={`nav-btn ${location.pathname.startsWith("/production") ? "nav-btn--active" : ""}`}
  onClick={() => navigate("/production")}
>
  生产
</button>
```

---

## 10. 安全审查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| IPC 安全 | ✅ | contextIsolation=true, nodeIntegration=false, invoke/handle 模式 |
| SQL 注入防护 | ✅ | 全部使用 `?` 参数化查询 |
| 提交校验 | ✅ | 报工数量不可超工单总量（Handler 层校验） |
| 红冲安全性 | ✅ | 红冲记录操作人、时间，不可删除原记录 |
| 状态变更安全 | ✅ | 状态转换有严格逻辑控制，不可任意修改 |
| 输入校验 | ✅ | 数量>0、必填字段不可为空 |
| 只读保护 | ✅ | 已关闭工单不可再操作 |

---

## 11. 性能评估

| 操作 | 预期耗时 | 说明 |
|------|---------|------|
| 工单列表查询（50条） | <50ms | 简单筛选 + 分页，无 JOIN |
| 工单详情加载 | <30ms | 单条查询 + JSON 解析 |
| 报工提交 | <20ms | 单条 INSERT + 状态检查 |
| 工单进度查询 | <50ms | GROUP BY 聚合查询 |
| 报工记录列表 | <30ms | 按 order_id 筛选 |

**索引优化**：主要查询字段（status, order_no, order_id）已建索引。

---

## 12. 影响范围

| 影响模块 | 影响类型 | 说明 |
|---------|---------|------|
| `App.tsx` | 修改 | 新增生产路由 + 导航激活 |
| `electron/database.ts` | 修改 | 新增 5 张表（products/work_orders/work_reports/work_report_details/work_order_logs） |
| `electron/handlers.ts` | 修改 | 注册 production-handlers |
| `electron/main.ts` | 修改 | 注册 production-handlers |
| `electron/preload.ts` | 修改 | 暴露 production API |
| `src/lib/types/route.ts` | 修改 | ElectronAPI route 增加 getPublishedList |
| `src/styles/global.css` | 修改 | 新增生产页面样式 |
| 无影响 | — | 不修改任何已有组件逻辑 |
| 无影响 | — | TASK-004/TASK-005 的开发工作不受影响 |

---

## 13. 种子数据（产品）

```typescript
// electron/database.ts — seedIfEmpty 中追加
const SEED_PRODUCTS = [
  { code: "PRD-001", name: "10kV绝缘子", specs: "10kV 针式" },
  { code: "PRD-002", name: "针式绝缘子", specs: "35kV 针式" },
  { code: "PRD-003", name: "支柱绝缘子", specs: "110kV 支柱" },
  { code: "PRD-004", name: "悬式绝缘子", specs: "70kN 悬式" },
];
```

---

## 14. 与 TASK-007 的界线

| 功能 | 归属 | 说明 |
|------|------|------|
| 工单 CRUD | TASK-006 | 本次实现 |
| 工序报工 | TASK-006 | 本次实现 |
| 工单状态流转 | TASK-006 | 本次实现 |
| 工序流转条 | TASK-006 | 本次实现 |
| 报工记录列表 | TASK-006 | 本次实现 |
| 质检节点报工 | TASK-006 | 本次实现，与 TASK-005 联动 |
| **批次追溯（全链路视图）** | TASK-007 | **不在此次范围** |
| **在制品看板（柱状图+瓶颈预警）** | TASK-007 | **不在此次范围** |
| **产量统计报表** | TASK-007 | **不在此次范围** |

注：TASK-006 的 `work_reports` 表同时为 TASK-007 提供数据基础，TASK-007 只需新增纯查询接口。

---

# 第十部分：TASK-007 批次追溯 + 在制品看板 — UX 交互设计

> 日期：2026-07-11
> 角色：UX 设计师
> 基于 PRD：TASK-007 生产管理 — 批次追溯 + 在制品看板

---

## 1. 信息架构

### 1.1 导航入口

在「生产」模块下新增两个子入口：

```
导航栏「生产」 → 生产管理（默认）→ [工单列表]  [批次追溯]  [在制品看板]
                                              ↕ Tab 切换
```

- 「生产管理」为 TASK-006 工单列表页（默认页）
- 「批次追溯」为 TASK-007 页面一
- 「在制品看板」为 TASK-007 页面二
- 用户在生产模块内通过 Tab 在三个视图间切换，不跳出当前模块

### 1.2 页面清单

| 页面 | 路径概念 | 用途 |
|------|---------|------|
| **批次追溯** | `/production/trace` | 按批次号搜索 + 全链路追溯视图 |
| **在制品看板** | `/production/wip` | 各工序在制品实时分布 + 瓶颈预警 |

### 1.3 页面流转图

```
[导航栏"生产"]
    │
    ├─ Tab「工单列表」→ TASK-006 工单列表页（默认）
    │
    ├─ Tab「批次追溯」→ [搜索页]
    │       ├── 输入批次号 → 回车搜索
    │       │     └── 匹配 → [追溯详情页]（全链路工序卡片）
    │       │            ├── 点击工序卡片 → 展开详情（操作人/时间/数量/质检/参数）
    │       │            └── 不合格工序 → 红色/琥珀色标记
    │       └── 无匹配 → 显示"未找到该批次"
    │
    └─ Tab「在制品看板」→ [看板主页]
            ├── 柱状图展示各工序在制品数
            ├── 瓶颈工序自动标红 ⚠️
            ├── 点击瓶颈工序 → 展开在制工单列表
            └── 筛选器（按产品/工单）
```

### 1.4 生产模块 Tab 切换栏设计

```
┌─────────────────────────────────────────────────────────────┐
│  ← 返回总览    生产管理                                     │
├─────────────────────────────────────────────────────────────┤
│  [📋 工单列表]  [🔍 批次追溯]  [📊 在制品看板]             │ ← Tab 切换
├─────────────────────────────────────────────────────────────┤
│                      （各页面内容）                          │
└─────────────────────────────────────────────────────────────┘
```

Tab 设计规则：
- 三个 Tab 等宽排列，当前 Tab 蓝色下划线+高亮
- 每个 Tab 带有对应的图标：📋 工单 / 🔍 追溯 / 📊 看板
- 切换 Tab 时 URL 不变（前端路由但 Tab 切换），保持在同一模块内

---

## 2. 批次追溯 — 搜索页

### 2.1 初始搜索页

```
┌─────────────────────────────────────────────────────────────┐
│  ← 返回        批次追溯                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│         🔍                                                   │
│     ┌──────────────────────┐                                │
│     │  输入批次号/工单号搜索  │                                │
│     └──────────────────────┘                                │
│                                                             │
│     [搜索]                                                   │
│                                                             │
│     支持：批次号 B20260711-001                               │
│           工单号 WO-20260711-001                             │
│                                                             │
│     最近搜索：                                              │
│     ┌─────────────────────────────────────────────────────┐ │
│     │ B20260711-001  10kV绝缘子   2026-07-11              │ │
│     │ B20260710-003  针式绝缘子   2026-07-10              │ │
│     └─────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 搜索结果 — 追溯详情页入口

当搜索命中时，直接进入追溯详情页（见下一节）。

若搜索命中多个批次（如按工单号搜索），显示列表：

```
┌──────────────────────────────────────────────────────┐
│  批次号           产品      状态       操作          │
│──────────────────────────────────────────────────────│
│  B20260711-001  10kV绝缘子  ✅ 已完成  [查看追溯]  │
│  B20260711-002  10kV绝缘子  🟢 生产中  [查看追溯]  │
└──────────────────────────────────────────────────────┘
```

### 2.3 空状态

```
┌──────────────────────────────────────────┐
│                                          │
│          🔍 未找到匹配的批次              │
│    请检查批次号或工单号是否正确           │
│                                          │
│     批次号格式：B20260711-001             │
│     工单号格式：WO-20260711-001           │
│                                          │
└──────────────────────────────────────────┘
```

---

## 3. 批次追溯 — 追溯详情页

### 3.1 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  ← 返回搜索    批次追溯                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌── 批次信息 ───────────────────────────────────────────┐ │
│  │  批次号: B20260711-001  产品: 10kV绝缘子              │ │
│  │  工单号: WO-20260711-001  状态: ✅ 已完成             │ │
│  │  投产: 07-11 08:30  完工: 07-11 16:20  耗时: ~8h     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                             │
│  筛选: [全部工序 ▼]                                         │
│                                                             │
│  ┌── 工序 ① 制泥 ── 🟢 正常 ───────────────────────────┐ │
│  │  [+] 2026-07-11 09:00-10:30  操作人: 张工            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌── 工序 ② 成型 ── 🟢 正常 ───────────────────────────┐ │
│  │  [+] 2026-07-11 10:40-12:00  操作人: 李工            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌── 工序 ③ 修坯 ── ⚠️ 有不合格 ──────────────────────┐ │
│  │  [-] 2026-07-11 13:00-14:30  操作人: 王工            │ │
│  │                                                       │ │
│  │  完成数: 950/980    合格数: 950    不合格: 30         │ │
│  │  工时: 90 min       设备: 修坯机#02                   │ │
│  │  参数: 修坯厚度 8mm                                  │ │
│  │                                                       │ │
│  │  质检结果:                                            │ │
│  │  ┌────────────────────────────────────┐              │ │
│  │  │ ❌ 外观检查: 不合格（表面有裂纹）   │              │ │
│  │  │ ✅ 返工完成: 30件 → 二次检验通过   │              │ │
│  │  └────────────────────────────────────┘              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌── 工序 ④ 上釉 ── 🟢 正常 ───────────────────────────┐ │
│  │  [+] 2026-07-11 14:40-15:30  操作人: 赵工            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                             │
│  ...后续工序...                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 工序卡片设计

每道工序一个独立卡片，排列方式与工艺路线顺序一致。

**卡片折叠状态（默认）**：

```
┌── 工序 ③ 修坯 ── ⚠️ 有不合格 ───────────────────────────┐
│  [+] 2026-07-11 13:00-14:30  操作人: 王工               │
└─────────────────────────────────────────────────────────────┘
```

- 左侧：工序序号 + 名称
- 右侧：状态标记（🟢正常 / ⚠️有不合格 / 🔴未通过 / ⚪跳过）
- 一行摘要：时间 + 操作人
- 点击 `[+]` 展开详情

**卡片展开状态**：

- 操作人、完成数/合格数/不合格数、工时、设备
- 工艺参数列表（key: value 格式）
- 质检结果（检测项目 + 判定 + 实测值）
- 不合格品的处理记录（返工/报废）

### 3.3 工序卡片状态色

| 状态 | 卡片左边框色 | 背景色 | 标记 | 说明 |
|------|------------|--------|------|------|
| 🟢 正常完成 | --color-success-500 | 极浅绿色底 | 绿色标记 | 质检全部合格 |
| ⚠️ 有不合格 | --color-warning-500 | 浅琥珀色底 | 琥珀色标记 | 产生不合格品但已处理 |
| 🔴 未通过 | --color-error-500 | 浅红色底 | 红色标记 | 质检未通过 |
| ⚪ 跳过 | --color-neutral-300 | 灰色底 | 灰色标记 | 该工序被跳过 |
| 🔵 进行中 | --color-primary-500 | 浅蓝色底 | 蓝色标记 | 工单进行中 |

### 3.4 筛选与排序

| 筛选项 | 说明 |
|--------|------|
| 全部工序 | 显示所有工序卡片（默认） |
| 仅异常 | 仅显示有不合格/未通过的工序 |
| 仅正常 | 仅显示正常完成的工序 |

- 所有卡片按工艺路线节点顺序排列，不可拖动
- 每道工序如有多次报工，按报工时间顺序在卡片内排列

### 3.5 数据加载状态

加载数据超过 1 秒时显示 Skeleton 骨架屏：

```
┌────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← 批次信息骨架
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │   │  ← 工序卡片骨架 × N
│  └────────────────────────────────────┘   │
│  ┌────────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │   │
│  └────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

---

## 4. 在制品看板

### 4.1 看板布局

```
┌─────────────────────────────────────────────────────────────┐
│  📊 在制品看板                  [产品: 全部 ▼] [工单: 全部 ▼]│ ← 顶栏+筛选
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌── 工序在制品分布 ─────────────────────────────────────┐ │
│  │                                                        │ │
│  │  制泥      成型      修坯      上釉      烧成      包装│ │
│  │  ┌─┐      ┌─┐      ┌─┐      ┌─┐      ┌─┐      ┌─┐   │ │
│  │  │ │      │ │      │█│      │█│      │ │      │ │   │ │
│  │  │ │      │ │      │█│      │█│      │ │      │ │   │ │
│  │  │0│      │200│    │█│500   │█│800   │300│    │0│   │ │
│  │  │ │      │ │      │█│⚠️    │█│⚠️    │ │      │ │   │ │
│  │  └─┘      └─┘      └─┘      └─┘      └─┘      └─┘   │ │
│  │  已完工    正常     瓶颈🚨   偏多⚠️   正常     已完工  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌── 瓶颈预警 ⚠️ ───────────────────────────────────────┐ │
│  │  修坯: 500 件 → 超过阈值 300 件                      │ │
│  │  上釉: 800 件 → 超过阈值 600 件                      │ │
│  │  [点击工序查看在制工单详情]                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌── 修坯工序在制工单 ── 点击展开 ──────────────────────┐ │
│  │  工单号         在制品  操作人  开始时间  状态        │ │
│  │──────────────────────────────────────────────────────│ │
│  │  WO-20260711-001  200   王工   13:00   ⏳ 进行中     │ │
│  │  WO-20260711-002  300   赵工   14:00   ⏳ 进行中     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 柱状图交互设计

| 交互 | 行为 |
|------|------|
| **Hover 工序柱** | 显示 Tooltip：工序名、在制品数、阈值、状态 |
| **点击工序柱** | 展开该工序的在制工单列表（如下拉表格） |
| **Hover 瓶颈工序** | 红色脉动动画 + Tooltip 显示超出量 |
| **点击已完工工序** | 无操作（无法展开，灰色禁用光标） |

### 4.3 各工序柱状态

| 状态 | 柱状图颜色 | 标记 | 说明 |
|------|-----------|------|------|
| 🔵 **正常** | --color-primary-400 蓝色 | 显示数值 | 在制品 < 阈值 × 80% |
| 🟡 **偏多** | --color-warning-400 琥珀色 | ⚠️ 图标 | 在制品 > 阈值 × 80% |
| 🔴 **瓶颈** | --color-error-400 红色 | 🚨 图标 + 脉动 | 超阈值 |
| ⚪ **已完工** | --color-neutral-300 灰色 | 显示 0 或 — | 首/末道工序无在制品 |
| ⏳ **无数据** | 虚线边框 | 显示 "-" | 尚未有报工数据 |

### 4.4 瓶颈预警区域

当存在瓶颈工序时，在柱状图下方显示预警列表：

```
┌── 瓶颈预警 ⚠️ ────────────────────────────────────────────┐
│  🚨 修坯: 500件 (阈值 300件)  超出 200件  [查看详情 ▼]   │
│  🟡 上釉: 800件 (阈值 600件)  超出 200件  [查看详情 ▼]   │
└─────────────────────────────────────────────────────────────┘
```

- 每行一条预警信息
- 红色 🚨 表示严重超阈值
- 黄色 🟡 表示接近阈值
- 点击「查看详情」展开该工序的在制工单明细

### 4.5 筛选器

| 筛选维度 | 控件 | 说明 |
|---------|------|------|
| **产品** | 下拉选择 | 全部 / 按产品筛选 |
| **工单** | 下拉选择 | 全部 / 按工单筛选 |
| **工序** | 横轴自带 | 点击柱状图即钻取到该工序 |

- 默认显示全部产品和全部工单的聚合数据
- 选择产品后，柱状图仅显示该产品在各工序的在制品数
- 选择工单后，柱状图仅显示该工单在各工序的在制品数

### 4.6 空状态

```
┌──────────────────────────────────────────┐
│                                          │
│          📊 暂无在制品数据                │
│    请先创建工单并开始生产                 │
│                                          │
│          [ 去创建工单 ]                   │
│                                          │
└──────────────────────────────────────────┘
```

---

## 5. 日产量看板（T-10）

### 5.1 页面嵌入

日产量看板作为在制品看板下的一个 Tab 子页或卡片：

```
在制品看板页面
├── Tab: 在制品分布（默认）
├── Tab: 日产量看板
└── Tab: 瓶颈预警
```

### 5.2 日产量看板布局

```
┌──────────────────────────────────────────────────────────────┐
│  日产量看板                       [日期: 2026-07-11 📅]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌── 今日总览 ──────────────────────────────────────────┐   │
│  │  总完工: 3,500 件    总合格: 3,350 件   合格率: 95.7% │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌── 各工序今日产量 ────────────────────────────────────┐   │
│  │  工序    完工数  合格数  不合格数  合格率    操作人    │   │
│  │───────────────────────────────────────────────────────│   │
│  │  制泥    500     495     5       99.0%    张工       │   │
│  │  成型    480     460     20      95.8%    李工       │   │
│  │  修坯    450     440     10      97.8%    王工       │   │
│  │  上釉    420     400     20      95.2%    赵工       │   │
│  │  烧成    400     380     20      95.0%    刘工       │   │
│  │  试验    380     375     5       98.7%    质检员     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 合格率展示

| 合格率范围 | 颜色 | 说明 |
|-----------|------|------|
| ≥ 98% | 绿色 | 优秀 |
| 95% ~ 98% | 蓝色 | 正常 |
| 90% ~ 95% | 琥珀色 ⚠️ | 需关注 |
| < 90% | 红色 🔴 | 严重异常 |

---

## 6. 键盘快捷键

| 快捷键 | 操作 |
|--------|------|
| `Enter` | 批次追溯搜索 |
| `Esc` | 收起展开的工序卡片 / 关闭弹窗 |
| `Ctrl+F` | 聚焦批次搜索输入框 |
| `F5` | 刷新在制品看板 |

---

## 7. 异常/错误状态

| 场景 | 处理方式 |
|------|---------|
| 追溯数据加载失败 | 显示错误提示 + "重试"按钮，保留搜索框可重新搜索 |
| 在制品计算出现负数 | 看板显示"数据异常🔴请联系管理员"，不展示错误数据 |
| 批次号对应的工单已删除 | 追溯视图正常展示已有记录，顶部显示⚠️ "该工单已被删除" |
| 某工序报工记录被红冲 | 追溯卡片中该条报工显示删除线，实际数量以非红冲记录为准 |
| 在制品看板数据加载中 | 显示 Skeleton 骨架屏（柱状图灰色占位） |

---

## 8. 与 TASK-006 工单详情页的联动

### 8.1 从工单详情进入追溯

工单详情页的顶栏新增「追溯」按钮：

```
工单详情页顶栏：
← 返回列表  WO-20260711-001   🟢生产中  [追溯] [编辑] [关闭]
                                          ↑ 新增
```

点击「追溯」→ 直接跳转到该工单对应批次的追溯详情页。

### 8.2 从看板进入工单

在在制品看板中点击工单号 → 跳转到该工单的详情页（TASK-006）。

---

## 9. 设计总览摘要

| 页面 | 核心组件 | 主要交互 |
|------|---------|---------|
| 批次追溯 — 搜索 | 搜索框 + 最近搜索列表 | 输入批次号/工单号搜索 |
| 批次追溯 — 详情 | 可展开工序卡片 + 状态标记 | 点击展开/收起，查看工序详情 |
| 在制品看板 | 柱状图 + 瓶颈预警列表 | 点击柱钻取，Hover 看详情 |
| 日产量看板 | 汇总卡片 + 工序产量表格 | 按日期查看，合格率颜色标记 |
| 生产模块切换 | Tab 切换栏 | 工单列表 / 批次追溯 / 在制品看板 |





