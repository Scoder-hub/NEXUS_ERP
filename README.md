# 兴诚电瓷 IMS

湖南兴诚电瓷电器有限公司智能管理系统（桌面端）

> 电瓷智造全流程管理 — 制泥 → 成型 → 修坯 → 上釉 → 烧成 → 胶装 → 试验 → 包装

## 技术栈

| 层 | 技术 |
|------|------|
| 框架 | Electron 30 + React 18 |
| 语言 | TypeScript 5.8 |
| 构建 | Vite 6 |
| 样式 | TailwindCSS 3 + Design Token 系统 |
| 状态 | Zustand 5 |
| 数据库 | SQLite (better-sqlite3) |
| 画布 | React Flow (工艺路线设计器) |
| 测试 | Vitest + Testing Library |

## 环境要求

- Node.js >= 18
- npm >= 9

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发模式（带热更新 + Electron 窗口）
npm run dev

# 类型检查
npm run typecheck

# 运行测试
npm run test

# 生产构建
npm run build
```

## 项目结构

```
xingcheng-ims/
├── electron/           # Electron 主进程
│   ├── main.ts         # 主进程入口
│   └── preload.ts      # 预加载脚本（contextBridge）
├── src/                # 渲染进程（React 应用）
│   ├── components/     # 通用 UI 组件
│   ├── pages/          # 页面组件
│   ├── stores/         # Zustand 状态管理
│   ├── hooks/          # 自定义 Hooks
│   ├── lib/            # 工具函数 / 业务逻辑
│   └── styles/         # 样式文件
│       ├── design-tokens.css  # Design Token 系统
│       ├── global.css         # 全局样式
│       └── index.css          # Tailwind 入口
├── public/             # 静态资源
├── scripts/            # 构建/脚本工具
├── docs/               # 项目文档
├── vite.config.ts      # Vite 配置
├── tailwind.config.js  # TailwindCSS 配置
└── tsconfig.json       # TypeScript 配置
```

## 设计系统

本项目使用 CSS Design Token 系统定义全部视觉属性。

### 色板

- **深空蓝** `#2563EB` — 主色（沉稳、专业、可靠）
- **冰川青** `#06B6D4` — 信息色（冷静、精确、通透）
- **翡翠绿** `#10B981` — 成功色
- **朱砂红** `#EF4444` — 错误色
- **琥珀黄** `#F59E0B` — 警告色

所有颜色、圆角、字号、间距、阴影均通过 CSS 变量管理，禁止硬编码。

## 开发规范

- 每文件 ≤ 300 行
- 禁止使用 `any`
- 必须以 kebab-case 命名文件
- 所有列表必须含 empty 状态
- 删除操作必须二次确认

## 许可

专有 — 湖南兴诚电瓷电器有限公司
