import { useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useRouteStore } from "../../stores/routeStore";
import ProcessPanel from "./ProcessPanel";
import CanvasView from "./CanvasView";
import ParamPanel from "./ParamPanel";
import type { Node } from "@xyflow/react";

export default function RouteEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useRouteStore(
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

  // 初始化：加载工序库和路线数据
  useEffect(() => {
    store.fetchProcessLibrary();

    if (id === "new") {
      store.createRoute("新建工艺路线");
    } else if (id && !isNaN(Number(id))) {
      store.fetchRoute(Number(id));
    }

    return () => {
      store.resetEditor();
    };
  }, [id]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        store.saveRoute();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        // React Flow 已处理删除
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNodeClick = useCallback((_event: any, node: Node) => {
    store.selectNode(node.id);
  }, []);

  const handleNodeDoubleClick = useCallback((_event: any, node: Node) => {
    store.selectNode(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    store.selectNode(null);
  }, []);

  const handleDropNode = useCallback(
    (processId: number, position: { x: number; y: number }) => {
      store.addNode(processId, position);
    },
    [],
  );

  const handleBack = useCallback(() => {
    navigate("/routes");
  }, [navigate]);

  const handleSave = useCallback(async () => {
    await store.saveRoute();
  }, []);

  const handlePublish = useCallback(async () => {
    await store.publishRoute();
  }, []);

  const selectedNode =
    store.nodes.find((n) => n.id === store.selectedNodeId) || null;

  const isReadonly =
    store.currentRoute?.status === "published" ||
    store.currentRoute?.status === "archived";

  return (
    <div className="editor-layout">
      {/* 顶栏 */}
      <header className="editor-header">
        <button className="editor-header__back" onClick={handleBack}>
          ← 返回列表
        </button>
        <h2 className="editor-header__title">
          {store.currentRoute?.name || "工艺路线设计器"}
        </h2>
        <div className="editor-header__status">
          {store.currentRoute && (
            <span
              className={`status-badge status-badge--${store.currentRoute.status}`}
            >
              {statusLabel(store.currentRoute.status)}
            </span>
          )}
        </div>
        <div className="editor-header__actions">
          {store.isDirty && (
            <span className="editor-header__dirty">有未保存的变更</span>
          )}
          {!isReadonly && (
            <>
              <button
                className="editor-header__btn editor-header__btn--save"
                onClick={handleSave}
              >
                {store.isDirty ? "保存" : "已保存"}
              </button>
              {store.currentRoute?.status === "draft" && (
                <button
                  className="editor-header__btn editor-header__btn--publish"
                  onClick={handlePublish}
                >
                  发布
                </button>
              )}
            </>
          )}
        </div>
      </header>

      {/* 三栏主体 */}
      <div className="editor-body">
        {!isReadonly && (
          <ProcessPanel
            library={store.processLibrary}
            loading={store.libraryLoading}
            onSearch={() => {}}
            onDragStart={() => {}}
          />
        )}

        {store.editorLoading ? (
          <div className="editor-loading">加载中...</div>
        ) : (
          <CanvasView
            nodes={store.nodes}
            edges={store.edges}
            onNodesChange={store.onNodesChange}
            onEdgesChange={store.onEdgesChange}
            onConnect={store.onConnect}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onPaneClick={handlePaneClick}
            onDropNode={handleDropNode}
            readonly={isReadonly}
          />
        )}

        <ParamPanel
          node={selectedNode}
          processLibrary={store.processLibrary}
          onParamsChange={store.updateNodeParams}
          onClose={() => store.selectNode(null)}
          readonly={isReadonly}
        />
      </div>

      {/* 状态栏 */}
      <footer className="editor-footer">
        <span>
          状态:{" "}
          {store.currentRoute ? statusLabel(store.currentRoute.status) : "-"}
        </span>
        <span>节点: {store.nodes.length}</span>
        <span>连线: {store.edges.length}</span>
        {store.isDirty && (
          <span className="editor-footer__dirty">· 未保存变更</span>
        )}
      </footer>
    </div>
  );
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "草稿",
    pending: "待审核",
    published: "已发布",
    archived: "已归档",
  };
  return map[status] || status;
}
