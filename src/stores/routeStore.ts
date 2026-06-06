import { create } from "zustand";
import {
  type ProcessLibraryItem,
  type RouteListItem,
  type RouteDetail,
} from "../lib/types/route";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";

interface RouteState {
  /* ── 列表页 ── */
  routeList: RouteListItem[];
  listLoading: boolean;
  listFilter: { status?: string; search?: string };

  /* ── 编辑器 ── */
  currentRoute: RouteDetail | null;
  editorLoading: boolean;
  isDirty: boolean;
  selectedNodeId: string | null;

  /* ── 工序库 ── */
  processLibrary: ProcessLibraryItem[];
  libraryLoading: boolean;

  /* ── 画布状态 ── */
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  /* ── Actions ── */
  fetchRouteList: () => Promise<void>;
  fetchRoute: (id: number) => Promise<void>;
  createRoute: (name: string) => Promise<RouteDetail>;
  saveRoute: () => Promise<void>;
  publishRoute: () => Promise<void>;
  deleteRoute: (id: number) => Promise<void>;
  fetchProcessLibrary: () => Promise<void>;
  addNode: (processId: number, position: { x: number; y: number }) => void;
  removeSelected: () => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeParams: (nodeId: string, params: Record<string, any>) => void;
  resetEditor: () => void;
  setListFilter: (filter: { status?: string; search?: string }) => void;
}

export const useRouteStore = create<RouteState>((set, get) => ({
  /* ── 初始状态 ── */
  routeList: [],
  listLoading: false,
  listFilter: {},
  currentRoute: null,
  editorLoading: false,
  isDirty: false,
  selectedNodeId: null,
  processLibrary: [],
  libraryLoading: false,
  nodes: [],
  edges: [],

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node[],
      isDirty: true,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as Edge[],
      isDirty: true,
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, type: "smoothstep" }, get().edges),
      isDirty: true,
    });
  },

  /* ── 加载工序库 ── */
  fetchProcessLibrary: async () => {
    set({ libraryLoading: true });
    try {
      const items = await window.electronAPI.processLibrary.getAll();
      set({ processLibrary: items, libraryLoading: false });
    } catch (err) {
      console.error("加载工序库失败:", err);
      set({ libraryLoading: false });
    }
  },

  /* ── 加载路线列表 ── */
  fetchRouteList: async () => {
    set({ listLoading: true });
    try {
      const { status, search } = get().listFilter;
      const result = await window.electronAPI.route.list({ status, search });
      set({ routeList: result.items, listLoading: false });
    } catch (err) {
      console.error("加载路线列表失败:", err);
      set({ listLoading: false });
    }
  },

  /* ── 加载单条路线 ── */
  fetchRoute: async (id: number) => {
    set({ editorLoading: true });
    try {
      const route = await window.electronAPI.route.getById(id);
      if (route) {
        set({
          currentRoute: route,
          nodes: route.snapshot.nodes as Node[],
          edges: route.snapshot.edges as Edge[],
          isDirty: false,
          selectedNodeId: null,
          editorLoading: false,
        });
      } else {
        set({ editorLoading: false });
      }
    } catch (err) {
      console.error("加载路线失败:", err);
      set({ editorLoading: false });
    }
  },

  /* ── 创建路线 ── */
  createRoute: async (name: string) => {
    const route = await window.electronAPI.route.create({ name });
    set({
      currentRoute: route,
      nodes: [],
      edges: [],
      isDirty: false,
      selectedNodeId: null,
    });
    return route;
  },

  /* ── 保存路线 ── */
  saveRoute: async () => {
    const { currentRoute, nodes, edges } = get();
    if (!currentRoute) return;

    const viewport = { x: 0, y: 0, zoom: 1 };
    const snapshot = JSON.stringify({ nodes, edges, viewport });
    await window.electronAPI.route.save(currentRoute.id, {
      snapshot,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });
    set({
      isDirty: false,
      currentRoute: {
        ...currentRoute,
        snapshot: { nodes: nodes as any, edges: edges as any, viewport },
        nodeCount: nodes.length,
        edgeCount: edges.length,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  /* ── 发布路线 ── */
  publishRoute: async () => {
    const { currentRoute } = get();
    if (!currentRoute) return;
    // 先保存
    await get().saveRoute();
    await window.electronAPI.route.publish(currentRoute.id);
    set({
      currentRoute: { ...get().currentRoute!, status: "published" },
    });
  },

  /* ── 删除路线 ── */
  deleteRoute: async (id: number) => {
    await window.electronAPI.route.delete(id);
    await get().fetchRouteList();
  },

  /* ── 添加节点 ── */
  addNode: (processId: number, position: { x: number; y: number }) => {
    const { processLibrary, nodes } = get();
    const proc = processLibrary.find((p) => p.id === processId);
    if (!proc) return;

    // 生成本地唯一 ID（不使用 nanoid，避免 ESM require 问题）
    const id = `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newNode: Node = {
      id,
      type: "process",
      position,
      data: {
        processId: proc.id,
        name: proc.name,
        params: {},
        isValid: false,
      },
    };
    set({ nodes: [...nodes, newNode], isDirty: true });
  },

  /* ── 删除选中 ── */
  removeSelected: () => {
    const { nodes, edges } = get();
    const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
    if (selectedNodeIds.length === 0) return;
    set({
      nodes: nodes.filter((n) => !selectedNodeIds.includes(n.id)),
      edges: edges.filter(
        (e) =>
          !selectedNodeIds.includes(e.source) &&
          !selectedNodeIds.includes(e.target),
      ),
      isDirty: true,
      selectedNodeId: null,
    });
  },

  /* ── 选中节点 ── */
  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  /* ── 更新节点参数 ── */
  updateNodeParams: (nodeId: string, params: Record<string, any>) => {
    const { nodes } = get();
    set({
      nodes: nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, params, isValid: true } }
          : n,
      ),
      isDirty: true,
    });
  },

  /* ── 重置编辑器 ── */
  resetEditor: () => {
    set({
      currentRoute: null,
      nodes: [],
      edges: [],
      isDirty: false,
      selectedNodeId: null,
      editorLoading: false,
    });
  },

  setListFilter: (filter) => {
    set({ listFilter: filter });
  },
}));
