import { useState, useCallback } from "react";
import type { ProcessLibraryItem } from "../../lib/types/route";

interface ProcessPanelProps {
  library: ProcessLibraryItem[];
  loading: boolean;
  onSearch: (query: string) => void;
  onDragStart: (processId: number) => void;
  /** 打开工序管理弹窗（TASK-004 新增） */
  onManageClick?: () => void;
  /** 行内快速编辑（TASK-004 新增） */
  onQuickEdit?: (process: ProcessLibraryItem) => void;
  /** 行内快速切换启用/禁用（TASK-004 新增） */
  onQuickToggleActive?: (id: number, isActive: boolean) => void;
}

export default function ProcessPanel({
  library,
  loading,
  onSearch,
  onDragStart,
  onManageClick,
  onQuickEdit,
  onQuickToggleActive,
}: ProcessPanelProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearch = useCallback(
    (val: string) => {
      setSearchText(val);
      onSearch(val);
    },
    [onSearch],
  );

  const standardProcesses = library.filter((p) => p.category === "standard");
  const customProcesses = library.filter((p) => p.category === "custom");
  const allCustomDisabled =
    customProcesses.length > 0 && customProcesses.every((p) => !p.isActive);

  return (
    <aside className="process-panel">
      <div className="process-panel__header">
        <span className="process-panel__title">工序库</span>
        <div className="process-panel__header-actions">
          <button
            className="process-panel__manage-btn"
            onClick={onManageClick}
            title="管理工序"
          >
            ⚙️
          </button>
          <button
            className="process-panel__search-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            title="搜索工序"
          >
            🔍
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="process-panel__search">
          <input
            type="text"
            className="process-panel__search-input"
            placeholder="搜索工序..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>
      )}

      <div className="process-panel__content">
        <div className="process-panel__group">
          <div className="process-panel__group-title">
            标准工序
            <span className="process-panel__group-count">({standardProcesses.length})</span>
          </div>
          {loading ? (
            <div className="process-panel__loading">加载中...</div>
          ) : (
            <ul className="process-panel__list">
              {standardProcesses.map((proc) => (
                <li
                  key={proc.id}
                  className="process-panel__item"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({ processId: proc.id }),
                    );
                    e.dataTransfer.effectAllowed = "copy";
                    onDragStart(proc.id);
                  }}
                >
                  <span className="process-panel__item-drag">☰</span>
                  <span className="process-panel__item-code">{proc.code}</span>
                  <span className="process-panel__item-name">{proc.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="process-panel__group">
          <div className="process-panel__group-title">
            自定义工序
            <span className="process-panel__group-count">
              ({customProcesses.length})
              {allCustomDisabled && (
                <span className="process-panel__all-disabled">全部禁用</span>
              )}
            </span>
          </div>
          {customProcesses.length === 0 ? (
            <div className="process-panel__empty">暂无自定义工序</div>
          ) : (
            <ul className="process-panel__list">
              {customProcesses.map((proc) => (
                <li
                  key={proc.id}
                  className={`process-panel__item ${!proc.isActive ? "process-panel__item--disabled" : ""}`}
                  draggable={!!proc.isActive}
                  onDragStart={(e) => {
                    if (!proc.isActive) {
                      e.preventDefault();
                      return;
                    }
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({ processId: proc.id }),
                    );
                    e.dataTransfer.effectAllowed = "copy";
                    onDragStart(proc.id);
                  }}
                >
                  <span className="process-panel__item-drag">☰</span>
                  <span className="process-panel__item-code">{proc.code}</span>
                  <span className="process-panel__item-name">{proc.name}</span>
                  {proc.isActive ? (
                    <span className="process-panel__item-actions">
                      <button
                        className="process-panel__item-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickEdit?.(proc);
                        }}
                        title="编辑"
                      >
                        ✎
                      </button>
                      <button
                        className="process-panel__item-action process-panel__item-action--warn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickToggleActive?.(proc.id, false);
                        }}
                        title="禁用"
                      >
                        ⏸
                      </button>
                    </span>
                  ) : (
                    <button
                      className="process-panel__item-action process-panel__item-action--success"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickToggleActive?.(proc.id, true);
                      }}
                      title="启用"
                    >
                      ▶
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
