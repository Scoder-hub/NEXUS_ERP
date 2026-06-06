import { useState, useCallback } from "react";
import type { ProcessLibraryItem } from "../../lib/types/route";

interface ProcessPanelProps {
  library: ProcessLibraryItem[];
  loading: boolean;
  onSearch: (query: string) => void;
  onDragStart: (processId: number) => void;
}

export default function ProcessPanel({
  library,
  loading,
  onSearch,
  onDragStart,
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

  return (
    <aside className="process-panel">
      <div className="process-panel__header">
        <span className="process-panel__title">工序库</span>
        <button
          className="process-panel__search-btn"
          onClick={() => setSearchOpen(!searchOpen)}
          title="搜索工序"
        >
          🔍
        </button>
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
          <div className="process-panel__group-title">标准工序</div>
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
          <div className="process-panel__group-title">自定义工序</div>
          {customProcesses.length === 0 ? (
            <div className="process-panel__empty">暂无自定义工序</div>
          ) : (
            <ul className="process-panel__list">
              {customProcesses.map((proc) => (
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
      </div>
    </aside>
  );
}
