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
