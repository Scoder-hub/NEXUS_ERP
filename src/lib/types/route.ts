/* ── 工序库条目 ── */
export interface ProcessLibraryItem {
  id: number;
  code: string;
  name: string;
  nameEn?: string;
  category: "standard" | "custom";
  description?: string;
  icon: string;
  responsibleRole?: string;
  defaultParams?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ── 创建自定义工序请求参数 ── */
export interface CreateCustomProcessData {
  name: string;
  code?: string;
  category: "custom";
  responsibleRole?: string;
  description?: string;
  defaultParams: ParamTemplateItem[];
}

/* ── 更新自定义工序请求参数 ── */
export interface UpdateCustomProcessData {
  id: number;
  name?: string;
  code?: string;
  responsibleRole?: string;
  description?: string;
  defaultParams?: ParamTemplateItem[];
  isActive?: boolean;
}

/* ── 参数模板条目 ── */
export interface ParamTemplateItem {
  name: string;
  type: "text" | "number" | "select" | "boolean";
  required: boolean;
  defaultValue?: any;
  unit?: string;
  min?: number;
  max?: number;
  options?: string[];
}

/* ── 删除工序返回（含引用检查） ── */
export interface DeleteProcessResult {
  success: boolean;
  message: string;
  referencedBy?: { id: number; name: string; version: string }[];
}

/* ── 路线列表项 ── */
export interface RouteListItem {
  id: number;
  name: string;
  version: string;
  status: RouteStatus;
  nodeCount: number;
  edgeCount: number;
  updatedAt: string;
}

/* ── 路线详情 ── */
export interface RouteDetail {
  id: number;
  name: string;
  version: string;
  status: RouteStatus;
  snapshot: RouteSnapshot;
  nodeCount: number;
  edgeCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

/* ── 路线状态 ── */
export type RouteStatus = "draft" | "pending" | "published" | "archived";

/* ── 节点类型 ── */
export type RouteNodeType = "process" | "start" | "end" | "inspection";

/* ── 画布快照 ── */
export interface RouteSnapshot {
  nodes: RouteNode[];
  edges: RouteEdge[];
  viewport: { x: number; y: number; zoom: number };
}

/* ── 画布节点 ── */
export interface RouteNode {
  id: string;
  type: RouteNodeType;
  position: { x: number; y: number };
  data: {
    processId?: number; // inspection 类型无此字段
    name: string;
    params: Record<string, any>;
    requiredParams?: string[];
    isValid?: boolean;
    // 质检节点独有
    inspectionItems?: InspectionItem[];
  };
}

/* ── 画布连线 ── */
export interface RouteEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string; // 'inspection' | 'smoothstep'（默认）
  data?: InspectionEdgeData;
}

/* ── 路线列表查询参数 ── */
export interface RouteListParams {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/* ── 路线保存数据 ── */
export interface RouteSaveData {
  name?: string;
  snapshot: string;
  nodeCount: number;
  edgeCount: number;
  changeDescription?: string;
}

/* ── 渲染进程暴露的 API 接口 ── */
export interface ElectronAPI {
  platform: string;
  versions: Record<string, string>;
  getPlatform: () => Promise<string>;
  getVersions: () => Promise<Record<string, string>>;
  processLibrary: {
    getAll: () => Promise<ProcessLibraryItem[]>;
    getByCategory: (
      category: "standard" | "custom",
    ) => Promise<ProcessLibraryItem[]>;
    search: (query: string) => Promise<ProcessLibraryItem[]>;
    /** 新增自定义工序 */
    create: (data: CreateCustomProcessData) => Promise<ProcessLibraryItem>;
    /** 更新自定义工序 */
    update: (data: UpdateCustomProcessData) => Promise<ProcessLibraryItem>;
    /** 切换启用/禁用状态 */
    toggleActive: (id: number, isActive: boolean) => Promise<void>;
    /** 删除自定义工序（含引用检查） */
    delete: (id: number) => Promise<DeleteProcessResult>;
  };
  route: {
    list: (
      params: RouteListParams,
    ) => Promise<{ items: RouteListItem[]; total: number }>;
    getById: (id: number) => Promise<RouteDetail | null>;
    create: (data: { name: string }) => Promise<RouteDetail>;
    save: (id: number, data: RouteSaveData) => Promise<{ newVersion: string }>;
    publish: (id: number) => Promise<void>;
    delete: (id: number) => Promise<void>;
    newVersion: (id: number) => Promise<RouteDetail>;
    getHistory: (routeId: number) => Promise<VersionHistoryItem[]>;
    getHistoryDetail: (
      historyId: number,
    ) => Promise<VersionHistoryDetail | null>;
    rollback: (
      routeId: number,
      historyId: number,
      changeDescription: string,
    ) => Promise<RouteDetail>;
  };
}

/* ── 版本历史条目 ── */
export interface VersionHistoryItem {
  id: number;
  routeId: number;
  version: string;
  changeDescription: string;
  createdAt: string;
}

/* ── 版本历史详情（含完整快照） ── */
export interface VersionHistoryDetail extends VersionHistoryItem {
  snapshot: RouteSnapshot;
}

/* ── 版本对比结果 ── */
export interface VersionDiff {
  versionA: string;
  versionB: string;
  summary: {
    nodesBefore: number;
    nodesAfter: number;
    edgesBefore: number;
    edgesAfter: number;
    paramChanges: ParamChange[];
  };
  addedNodeIds: string[];
  removedNodeIds: string[];
  changedNodeIds: string[];
}

export interface ParamChange {
  nodeName: string;
  paramName: string;
  oldValue: any;
  newValue: any;
}

/* ── 质检节点 ── */

/** 检测项目 */
export interface InspectionItem {
  id: string;
  name: string; // 检测项目名称，如「工频耐压」
  standardValue?: number; // 标准值
  unit?: string; // 单位，如 kV
  deviationType?: "none" | "percent" | "absolute"; // 偏差类型
  deviationValue?: number; // 偏差值
}

/** 质检连线数据 */
export interface InspectionEdgeData {
  label: "pass" | "fail";
  labelText: string; // '✅ 通过' 或 '❌ 不通过'
}

/** 质检节点 Handle ID 常量 */
export const INSPECTION_HANDLES = {
  PASS: "pass",
  FAIL: "fail",
} as const;
