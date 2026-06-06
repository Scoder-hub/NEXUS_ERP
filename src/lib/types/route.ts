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

/* ── 画布快照 ── */
export interface RouteSnapshot {
  nodes: RouteNode[];
  edges: RouteEdge[];
  viewport: { x: number; y: number; zoom: number };
}

/* ── 画布节点 ── */
export interface RouteNode {
  id: string;
  type: "process" | "start" | "end";
  position: { x: number; y: number };
  data: {
    processId: number;
    name: string;
    params: Record<string, any>;
    requiredParams?: string[];
    isValid?: boolean;
  };
}

/* ── 画布连线 ── */
export interface RouteEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
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
  };
  route: {
    list: (
      params: RouteListParams,
    ) => Promise<{ items: RouteListItem[]; total: number }>;
    getById: (id: number) => Promise<RouteDetail | null>;
    create: (data: { name: string }) => Promise<RouteDetail>;
    save: (id: number, data: RouteSaveData) => Promise<void>;
    publish: (id: number) => Promise<void>;
    delete: (id: number) => Promise<void>;
    newVersion: (id: number) => Promise<RouteDetail>;
  };
}
