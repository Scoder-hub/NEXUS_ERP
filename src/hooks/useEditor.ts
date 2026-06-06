import { useEffect, useCallback } from "react";
import type { Node } from "@xyflow/react";
import { useRouteStore } from "../stores/routeStore";
import { useRouteVersionStore } from "../stores/routeVersionStore";
import { parseVersion } from "../lib/utils/version";
import { useShallow } from "zustand/react/shallow";

/** 编辑器状态钩子 — 聚合两个 store 的选中状态 */
export function useEditorState() {
  const routeStore = useRouteStore(
    useShallow((s) => ({
      currentRoute: s.currentRoute,
      nodes: s.nodes,
      edges: s.edges,
      editorLoading: s.editorLoading,
      isDirty: s.isDirty,
      selectedNodeId: s.selectedNodeId,
      processLibrary: s.processLibrary,
      libraryLoading: s.libraryLoading,
      onNodesChange: s.onNodesChange,
      onEdgesChange: s.onEdgesChange,
      onConnect: s.onConnect,
      fetchRoute: s.fetchRoute,
      fetchProcessLibrary: s.fetchProcessLibrary,
      createRoute: s.createRoute,
      saveRoute: s.saveRoute,
      publishRoute: s.publishRoute,
      addNode: s.addNode,
      removeSelected: s.removeSelected,
      selectNode: s.selectNode,
      updateNodeParams: s.updateNodeParams,
      resetEditor: s.resetEditor,
    })),
  );

  const versionStore = useRouteVersionStore(
    useShallow((s) => ({
      showSaveDialog: s.showSaveDialog,
      saveChangeDescription: s.saveChangeDescription,
      showHistoryDialog: s.showHistoryDialog,
      showCompareView: s.showCompareView,
      compareDiff: s.compareDiff,
      compareSnapshotA: s.compareSnapshotA,
      compareSnapshotB: s.compareSnapshotB,
      setSaveDialogOpen: s.setSaveDialogOpen,
      setSaveChangeDescription: s.setSaveChangeDescription,
      setHistoryDialogOpen: s.setHistoryDialogOpen,
      fetchVersionHistory: s.fetchVersionHistory,
      saveRouteWithHistory: s.saveRouteWithHistory,
      rollbackToVersion: s.rollbackToVersion,
      compareVersions: s.compareVersions,
    })),
  );

  return { ...routeStore, ...versionStore };
}

/** 键盘快捷键处理 */
export function useEditorKeyboard(route: { version: string } | null) {
  const setSaveDialogOpen = useRouteVersionStore((s) => s.setSaveDialogOpen);
  const setSaveChangeDescription = useRouteVersionStore(
    (s) => s.setSaveChangeDescription,
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (route) {
          setSaveChangeDescription("");
          setSaveDialogOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [route?.version]);
}

/** 获取选中节点 */
export function useSelectedNode(nodes: Node[], selectedNodeId: string | null) {
  return nodes.find((n) => n.id === selectedNodeId) || null;
}

export { parseVersion };
