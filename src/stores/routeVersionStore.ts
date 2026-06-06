import { create } from "zustand";
import type {
  VersionHistoryItem,
  VersionHistoryDetail,
  VersionDiff,
  RouteDetail,
} from "../lib/types/route";
import type { Node, Edge } from "@xyflow/react";
import { computeVersionDiff } from "../lib/utils/versionDiff";

interface RouteVersionState {
  /* ── 版本管理 ── */
  versionHistory: VersionHistoryItem[];
  historyLoading: boolean;
  showSaveDialog: boolean;
  saveChangeDescription: string;
  showHistoryDialog: boolean;
  compareDiff: VersionDiff | null;
  compareSnapshotA: VersionHistoryDetail | null;
  compareSnapshotB: VersionHistoryDetail | null;
  showCompareView: boolean;

  /* ── 版本 Actions ── */
  setSaveDialogOpen: (open: boolean) => void;
  setSaveChangeDescription: (desc: string) => void;
  setHistoryDialogOpen: (open: boolean) => void;
  setCompareViewOpen: (open: boolean) => void;
  fetchVersionHistory: (routeId: number) => Promise<void>;
  saveRouteWithHistory: (
    currentRoute: RouteDetail,
    nodes: Node[],
    edges: Edge[],
    description: string,
  ) => Promise<string | undefined>;
  rollbackToVersion: (
    routeId: number,
    historyId: number,
    description: string,
  ) => Promise<RouteDetail | undefined>;
  compareVersions: (
    historyIdA: number,
    historyIdB: number,
  ) => Promise<void>;
  resetVersionState: () => void;
}

export const useRouteVersionStore = create<RouteVersionState>((set, get) => ({
  /* ── 初始状态 ── */
  versionHistory: [],
  historyLoading: false,
  showSaveDialog: false,
  saveChangeDescription: "",
  showHistoryDialog: false,
  compareDiff: null,
  compareSnapshotA: null,
  compareSnapshotB: null,
  showCompareView: false,

  /* ── 对话框控制 ── */
  setSaveDialogOpen: (open) => {
    set({ showSaveDialog: open, saveChangeDescription: "" });
  },
  setSaveChangeDescription: (desc) => {
    set({ saveChangeDescription: desc });
  },
  setHistoryDialogOpen: (open) => {
    set({ showHistoryDialog: open });
  },
  setCompareViewOpen: (open) => {
    set({ showCompareView: open });
  },

  /* ── 带变更说明的保存 ── */
  saveRouteWithHistory: async (currentRoute, nodes, edges, description) => {
    const viewport = { x: 0, y: 0, zoom: 1 };
    const snapshot = JSON.stringify({ nodes, edges, viewport });
    try {
      const result = await window.electronAPI.route.save(currentRoute.id, {
        snapshot,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        changeDescription: description,
      });
      set({ showSaveDialog: false });
      return result.newVersion;
    } catch (err) {
      console.error("保存路线失败:", err);
    }
  },

  /* ── 获取版本历史 ── */
  fetchVersionHistory: async (routeId) => {
    set({ historyLoading: true });
    try {
      const history = await window.electronAPI.route.getHistory(routeId);
      set({ versionHistory: history, historyLoading: false });
    } catch (err) {
      console.error("加载版本历史失败:", err);
      set({ historyLoading: false });
    }
  },

  /* ── 回滚到指定版本 ── */
  rollbackToVersion: async (routeId, historyId, description) => {
    try {
      const updatedRoute = await window.electronAPI.route.rollback(
        routeId,
        historyId,
        description,
      );
      set({ showHistoryDialog: false });
      return updatedRoute;
    } catch (err) {
      console.error("回滚失败:", err);
    }
  },

  /* ── 版本对比 ── */
  compareVersions: async (historyIdA, historyIdB) => {
    try {
      const [detailA, detailB] = await Promise.all([
        window.electronAPI.route.getHistoryDetail(historyIdA),
        window.electronAPI.route.getHistoryDetail(historyIdB),
      ]);
      if (!detailA || !detailB) return;

      const diff = computeVersionDiff(
        detailA.snapshot,
        detailB.snapshot,
        { version: detailA.version },
        { version: detailB.version },
      );
      set({
        compareDiff: diff,
        compareSnapshotA: detailA,
        compareSnapshotB: detailB,
        showCompareView: true,
      });
    } catch (err) {
      console.error("版本对比失败:", err);
    }
  },

  /* ── 重置版本状态 ── */
  resetVersionState: () => {
    set({
      versionHistory: [],
      showSaveDialog: false,
      showHistoryDialog: false,
      showCompareView: false,
      compareDiff: null,
      compareSnapshotA: null,
      compareSnapshotB: null,
    });
  },
}));
