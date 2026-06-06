import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRouteStore } from "../../stores/routeStore";
import { useRouteVersionStore } from "../../stores/routeVersionStore";
import { parseVersion } from "../../lib/utils/version";
import type { Node } from "@xyflow/react";
import type {
  ProcessLibraryItem,
  CreateCustomProcessData,
  UpdateCustomProcessData,
} from "../../lib/types/route";
import ProcessPanel from "./ProcessPanel";
import CanvasView from "./CanvasView";
import ParamPanel from "./ParamPanel";
import SaveConfirmDialog from "./dialogs/SaveConfirmDialog";
import VersionHistoryDialog from "./dialogs/VersionHistoryDialog";
import VersionCompareView from "./dialogs/VersionCompareView";
import ProcessManageDialog from "./ProcessManageDialog";
import ProcessEditDialog from "./ProcessEditDialog";

/** 编辑器初始化 Hook */
function useInit(id: string | undefined) {
  const init = useRouteStore((s) => ({
    fetchProcessLibrary: s.fetchProcessLibrary,
    createRoute: s.createRoute,
    fetchRoute: s.fetchRoute,
    resetEditor: s.resetEditor,
  }));
  useEffect(() => {
    init.fetchProcessLibrary();
    if (id === "new") init.createRoute("新建工艺路线");
    else if (id && !isNaN(Number(id))) init.fetchRoute(Number(id));
    return () => init.resetEditor();
  }, [id]);
}

export default function RouteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  useInit(id);

  const editor = useRouteStore((s) => ({
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
    publishRoute: s.publishRoute,
    addNode: s.addNode,
    addInspectionNode: s.addInspectionNode,
    validateInspectionNodes: s.validateInspectionNodes,
    selectNode: s.selectNode,
  }));

  const version = useRouteVersionStore((s) => ({
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
    setCompareViewOpen: s.setCompareViewOpen,
    fetchVersionHistory: s.fetchVersionHistory,
    saveRouteWithHistory: s.saveRouteWithHistory,
    rollbackToVersion: s.rollbackToVersion,
    compareVersions: s.compareVersions,
  }));

  const processMgmt = useRouteStore((s) => ({
    manageDialogOpen: s.manageDialogOpen,
    editDialogOpen: s.editDialogOpen,
    editingProcess: s.editingProcess,
    processSaving: s.processSaving,
    setManageDialogOpen: s.setManageDialogOpen,
    setEditDialogOpen: s.setEditDialogOpen,
    createCustomProcess: s.createCustomProcess,
    updateCustomProcess: s.updateCustomProcess,
    toggleProcessActive: s.toggleProcessActive,
    deleteCustomProcess: s.deleteCustomProcess,
  }));

  // ── Callbacks ──
  const handleNodeClick = useCallback(
    (_e: any, n: Node) => editor.selectNode(n.id), [],
  );
  const handleNodeDblClick = useCallback(
    (_e: any, n: Node) => editor.selectNode(n.id), [],
  );
  const handlePaneClick = useCallback(
    () => editor.selectNode(null), [],
  );
  const handleDropNode = useCallback(
    (pid: number, pos: { x: number; y: number }) => editor.addNode(pid, pos), [],
  );
  const handleDropInspectionNode = useCallback(
    (pos: { x: number; y: number }) => editor.addInspectionNode(pos), [],
  );
  const handleBack = useCallback(
    () => navigate("/routes"), [navigate],
  );

  // ── 工序管理 Callbacks ──
  const handleManageClick = useCallback(() => {
    processMgmt.setManageDialogOpen(true);
  }, []);

  const handleQuickEdit = useCallback((proc: ProcessLibraryItem) => {
    processMgmt.setEditDialogOpen(true, proc);
  }, []);

  const handleQuickToggleActive = useCallback((id: number, isActive: boolean) => {
    processMgmt.toggleProcessActive(id, isActive);
  }, []);

  const handleCreateProcess = useCallback(() => {
    processMgmt.setEditDialogOpen(true, null);
    processMgmt.setManageDialogOpen(false);
  }, []);

  const handleEditProcess = useCallback((proc: ProcessLibraryItem) => {
    processMgmt.setEditDialogOpen(true, proc);
  }, []);

  const handleSaveProcess = useCallback(
    (data: CreateCustomProcessData | UpdateCustomProcessData) => {
      if ("id" in data) {
        processMgmt.updateCustomProcess(data);
      } else {
        processMgmt.createCustomProcess(data);
      }
    },
    [],
  );

  const [deleteBlockedInfo, setDeleteBlockedInfo] = useState<{
    name: string;
    refs: { id: number; name: string; version: string }[];
  } | null>(null);

  const handleDeleteProcess = useCallback(async (id: number) => {
    const proc = editor.processLibrary.find((p) => p.id === id);
    const result = await processMgmt.deleteCustomProcess(id);
    if (!result.success && result.referencedBy && proc) {
      setDeleteBlockedInfo({ name: proc.name, refs: result.referencedBy });
    }
  }, []);

  const existingCodes = editor.processLibrary
    .filter((p) => p.category === "custom")
    .map((p) => p.code);

  const [inspectionWarnShown, setInspectionWarnShown] = useState(false);

  const handleSave = useCallback(() => {
    // 质检节点校验：每个质检节点必须有 2 条出线
    if (!editor.validateInspectionNodes()) {
      setInspectionWarnShown(true);
      return;
    }
    version.setSaveChangeDescription?.("");
    version.setSaveDialogOpen?.(true);
  }, []);

  const handleSaveConfirm = useCallback(async () => {
    if (!editor.currentRoute) return;
    const nv = await version.saveRouteWithHistory(
      editor.currentRoute, editor.nodes, editor.edges,
      version.saveChangeDescription,
    );
    if (nv && editor.currentRoute) {
      useRouteStore.setState({
        isDirty: false,
        currentRoute: {
          ...editor.currentRoute,
          version: nv,
          updatedAt: new Date().toISOString(),
        },
      });
    }
  }, [editor.currentRoute, editor.nodes, editor.edges, version.saveChangeDescription]);

  const handlePublish = useCallback(
    async () => await editor.publishRoute(), [],
  );

  const handleHistory = useCallback(() => {
    if (editor.currentRoute) {
      version.fetchVersionHistory?.(editor.currentRoute.id);
      version.setHistoryDialogOpen?.(true);
    }
  }, [editor.currentRoute]);

  const handleRollback = useCallback(async (hid: number) => {
    if (!editor.currentRoute) return;
    const upd = await version.rollbackToVersion(
      editor.currentRoute.id, hid, "回滚到历史版本",
    );
    if (upd) {
      useRouteStore.setState({
        currentRoute: upd,
        nodes: upd.snapshot.nodes as Node[],
        edges: upd.snapshot.edges as Node[],
        isDirty: false,
      });
      useRouteVersionStore.setState({ showHistoryDialog: false });
    }
  }, [editor.currentRoute]);

  const handleCompare = useCallback((a: number, b: number) => {
    version.compareVersions?.(a, b);
    version.setHistoryDialogOpen?.(false);
  }, []);

  const handleBackCompare = useCallback(() => {
    version.setCompareViewOpen?.(false);
    version.setHistoryDialogOpen?.(true);
  }, []);

  // ── Derived ──
  const selected = editor.nodes.find((n) => n.id === editor.selectedNodeId) || null;
  const readonly = editor.currentRoute?.status === "published" || editor.currentRoute?.status === "archived";

  // 版本对比全屏
  if (version.showCompareView && version.compareDiff) {
    return (
      <VersionCompareView
        diff={version.compareDiff}
        snapshotA={version.compareSnapshotA!}
        snapshotB={version.compareSnapshotB!}
        onBack={handleBackCompare}
      />
    );
  }

  const cur = editor.currentRoute;

  return (
    <div className="editor-layout">
      {/* 顶栏 */}
      <header className="editor-header">
        <button className="editor-header__back" onClick={handleBack}>← 返回列表</button>
        <h2 className="editor-header__title">{cur?.name || "工艺路线设计器"}</h2>
        <div className="editor-header__status">
          {cur && (
            <>
              <span className={`status-badge status-badge--${cur.status}`}>
                {S[cur.status] || cur.status}
              </span>
              <span className="editor-header__version">{cur.version}</span>
            </>
          )}
        </div>
        <div className="editor-header__actions">
          {editor.isDirty && <span className="editor-header__dirty">有未保存的变更</span>}
          {!readonly && (
            <>
              <button className="editor-header__btn editor-header__btn--history" onClick={handleHistory}>📋 历史</button>
              <button className="editor-header__btn editor-header__btn--save" onClick={handleSave}>
                {editor.isDirty ? "保存" : "已保存"}
              </button>
              {cur?.status === "draft" && (
                <button className="editor-header__btn editor-header__btn--publish" onClick={handlePublish}>发布</button>
              )}
            </>
          )}
          {readonly && cur?.status === "published" && (
            <button className="editor-header__btn editor-header__btn--history" onClick={handleHistory}>📋 历史</button>
          )}
        </div>
      </header>

      {/* 三栏主体 */}
      <div className="editor-body">
        {!readonly && (
          <ProcessPanel
            library={editor.processLibrary} loading={editor.libraryLoading}
            onSearch={() => {}} onDragStart={() => {}}
            onManageClick={handleManageClick}
            onQuickEdit={handleQuickEdit}
            onQuickToggleActive={handleQuickToggleActive}
          />
        )}
        {editor.editorLoading ? (
          <div className="editor-loading">加载中...</div>
        ) : (
          <CanvasView
            nodes={editor.nodes} edges={editor.edges}
            onNodesChange={editor.onNodesChange}
            onEdgesChange={editor.onEdgesChange}
            onConnect={editor.onConnect}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDblClick}
            onPaneClick={handlePaneClick}
            onDropNode={handleDropNode}
            onDropInspectionNode={handleDropInspectionNode}
            readonly={readonly}
          />
        )}
        <ParamPanel
          node={selected} processLibrary={editor.processLibrary}
          onParamsChange={(nid, p) => useRouteStore.getState().updateNodeParams(nid, p)}
          onClose={() => editor.selectNode(null)} readonly={readonly}
        />
      </div>

      {/* 状态栏 */}
      <footer className="editor-footer">
        <span>状态: {cur ? (S[cur.status] || cur.status) : "-"}</span>
        <span>版本: {cur?.version || "-"}</span>
        <span>节点: {editor.nodes.length}</span>
        <span>连线: {editor.edges.length}</span>
        {editor.isDirty && <span className="editor-footer__dirty">· 未保存变更</span>}
      </footer>

      {/* 保存对话框 */}
      {cur && (
        <SaveConfirmDialog
          open={version.showSaveDialog}
          routeName={cur.name}
          currentVersion={cur.version}
          nextVersion={`v${parseVersion(cur.version).major}.${parseVersion(cur.version).minor + 1}`}
          description={version.saveChangeDescription}
          onDescriptionChange={(d) => useRouteVersionStore.setState({ saveChangeDescription: d })}
          onConfirm={handleSaveConfirm}
          onCancel={() => version.setSaveDialogOpen?.(false)}
        />
      )}

      {/* 版本历史对话框 */}
      {cur && (
        <VersionHistoryDialog
          routeId={cur.id} currentVersion={cur.version}
          open={version.showHistoryDialog}
          onClose={() => version.setHistoryDialogOpen?.(false)}
          onRollback={handleRollback} onCompare={handleCompare}
        />
      )}

      {/* 工序管理弹窗 */}
      <ProcessManageDialog
        open={processMgmt.manageDialogOpen}
        onClose={() => processMgmt.setManageDialogOpen(false)}
        library={editor.processLibrary}
        loading={editor.libraryLoading}
        onCreate={handleCreateProcess}
        onEdit={handleEditProcess}
        onToggleActive={handleQuickToggleActive}
        onDelete={handleDeleteProcess}
      />

      {/* 工序编辑弹窗 */}
      <ProcessEditDialog
        open={processMgmt.editDialogOpen}
        process={processMgmt.editingProcess}
        existingCodes={existingCodes}
        onSave={handleSaveProcess}
        onCancel={() => processMgmt.setEditDialogOpen(false)}
        saving={processMgmt.processSaving}
      />

      {/* 删除被阻止提示弹窗 */}
      {deleteBlockedInfo && (
        <div className="dialog-overlay" onClick={() => setDeleteBlockedInfo(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: 420 }}>
            <h3 className="dialog__title">⛔ 无法删除</h3>
            <div className="dialog__body">
              <p style={{ marginBottom: "var(--space-3)" }}>
                工序「{deleteBlockedInfo.name}」正被以下路线使用：
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {deleteBlockedInfo.refs.map((r) => (
                  <li key={r.id} style={{ padding: "4px 0", color: "var(--color-text-secondary)" }}>
                    • {r.name} ({r.version})
                  </li>
                ))}
              </ul>
            </div>
            <div className="dialog__footer">
              <button
                className="dialog__btn dialog__btn--cancel"
                onClick={() => setDeleteBlockedInfo(null)}
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 质检节点校验警告弹窗 */}
      {inspectionWarnShown && (
        <div className="dialog-overlay" onClick={() => setInspectionWarnShown(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: 400 }}>
            <h3 className="dialog__title">⚠️ 质检节点不完整</h3>
            <div className="dialog__body">
              <p style={{ margin: 0 }}>
                存在质检节点缺少输出连线，请确保每个质检节点都有「通过」和「不通过」两条出线。
              </p>
            </div>
            <div className="dialog__footer">
              <button
                className="dialog__btn dialog__btn--confirm"
                onClick={() => setInspectionWarnShown(false)}
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S: Record<string, string> = { draft: "草稿", pending: "待审核", published: "已发布", archived: "已归档" };
