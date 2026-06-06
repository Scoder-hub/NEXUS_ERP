import { create } from "zustand";
import {
  type ProcessLibraryItem,
  type RouteListItem,
  type RouteDetail,
  type CreateCustomProcessData,
  type UpdateCustomProcessData,
  type DeleteProcessResult,
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
import { INSPECTION_HANDLES } from "../lib/types/route";

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
  addInspectionNode: (position: { x: number; y: number }) => void;
  removeSelected: () => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeParams: (nodeId: string, params: Record<string, any>) => void;
  validateInspectionNodes: () => boolean;
  resetEditor: () => void;
  setListFilter: (filter: { status?: string; search?: string }) => void;

  /* ── 工序管理（TASK-004） ── */
  manageDialogOpen: boolean;
  editDialogOpen: boolean;
  editingProcess: ProcessLibraryItem | null;
  processSaving: boolean;
  setManageDialogOpen: (open: boolean) => void;
  setEditDialogOpen: (open: boolean, process?: ProcessLibraryItem | null) => void;
  createCustomProcess: (data: CreateCustomProcessData) => Promise<void>;
  updateCustomProcess: (data: UpdateCustomProcessData) => Promise<void>;
  toggleProcessActive: (id: number, isActive: boolean) => Promise<void>;
  deleteCustomProcess: (id: number) => Promise<DeleteProcessResult>;
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
  /* ── 工序管理 ── */
  manageDialogOpen: false,
  editDialogOpen: false,
  editingProcess: null,
  processSaving: false,

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
    const { sourceHandle } = connection;
    if (sourceHandle === INSPECTION_HANDLES.PASS || sourceHandle === INSPECTION_HANDLES.FAIL) {
      const isPass = sourceHandle === INSPECTION_HANDLES.PASS;
      set({
        edges: addEdge({
          ...connection,
          type: "inspection",
          data: {
            label: isPass ? "pass" : "fail",
            labelText: isPass ? "✅ 通过" : "❌ 不通过",
          },
        }, get().edges),
        isDirty: true,
      });
    } else {
      set({
        edges: addEdge({ ...connection, type: "smoothstep" }, get().edges),
        isDirty: true,
      });
    }
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
    const result = await window.electronAPI.route.save(currentRoute.id, {
      snapshot,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });
    set({
      isDirty: false,
      currentRoute: {
        ...currentRoute,
        snapshot: { nodes: nodes as any, edges: edges as any, viewport },
        version: result.newVersion,
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

  /* ── 添加质检节点 ── */
  addInspectionNode: (position: { x: number; y: number }) => {
    const { nodes } = get();
    const inspectionCount = nodes.filter((n) => n.type === "inspection").length;
    const id = `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newNode: Node = {
      id,
      type: "inspection",
      position,
      data: {
        name: `质检 ${inspectionCount + 1}`,
        params: {},
        inspectionItems: [],
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
    const inspectionItems = params.inspectionItems as any[] | undefined;
    set({
      nodes: nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                params,
                isValid: true,
                ...(inspectionItems ? { inspectionItems } : {}),
              },
            }
          : n,
      ),
      isDirty: true,
    });
  },

  /* ── 质检节点保存前校验 ── */
  validateInspectionNodes: () => {
    const { nodes, edges } = get();
    const invalid = nodes.filter((n) => {
      if (n.type !== "inspection") return false;
      const outEdges = edges.filter((e) => e.source === n.id);
      return outEdges.length < 2;
    });
    if (invalid.length > 0) {
      // 高亮第一个无效节点
      console.warn("质检节点出线不足:", invalid.map((n) => n.data.name));
      return false;
    }
    return true;
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

  /* ── 工序管理 ── */
  setManageDialogOpen: (open) => {
    set({ manageDialogOpen: open });
  },

  setEditDialogOpen: (open, process) => {
    set({ editDialogOpen: open, editingProcess: process ?? null });
  },

  createCustomProcess: async (data) => {
    set({ processSaving: true });
    try {
      const newProcess = await window.electronAPI.processLibrary.create(data);
      set((s) => ({
        processLibrary: [...s.processLibrary, newProcess],
        processSaving: false,
        editDialogOpen: false,
      }));
    } catch (err) {
      console.error("创建自定义工序失败:", err);
      set({ processSaving: false });
      throw err;
    }
  },

  updateCustomProcess: async (data) => {
    set({ processSaving: true });
    try {
      await window.electronAPI.processLibrary.update(data);
      await get().fetchProcessLibrary();
      set({ processSaving: false, editDialogOpen: false });
    } catch (err) {
      console.error("更新自定义工序失败:", err);
      set({ processSaving: false });
      throw err;
    }
  },

  toggleProcessActive: async (id, isActive) => {
    try {
      await window.electronAPI.processLibrary.toggleActive(id, isActive);
      await get().fetchProcessLibrary();
    } catch (err) {
      console.error("切换工序状态失败:", err);
    }
  },

  deleteCustomProcess: async (id) => {
    try {
      const result = await window.electronAPI.processLibrary.delete(id);
      if (result.success) {
        await get().fetchProcessLibrary();
      }
      return result;
    } catch (err) {
      console.error("删除自定义工序失败:", err);
      throw err;
    }
  },
}));
