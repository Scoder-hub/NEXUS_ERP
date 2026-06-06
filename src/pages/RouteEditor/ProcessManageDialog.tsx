import { useState, useMemo } from "react";
import type { ProcessLibraryItem } from "../../lib/types/route";

interface ProcessManageDialogProps {
  open: boolean;
  onClose: () => void;
  library: ProcessLibraryItem[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (process: ProcessLibraryItem) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
  onDelete: (id: number) => void;
}

type FilterCategory = "all" | "standard" | "custom";

export default function ProcessManageDialog({
  open,
  onClose,
  library,
  loading,
  onCreate,
  onEdit,
  onToggleActive,
  onDelete,
}: ProcessManageDialogProps) {
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  const [searchText, setSearchText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = library;
    if (filterCategory !== "all") {
      list = list.filter((p) => p.category === filterCategory);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q),
      );
    }
    return list;
  }, [library, filterCategory, searchText]);

  const handleDeleteClick = (proc: ProcessLibraryItem) => {
    setConfirmDeleteId(proc.id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId !== null) {
      onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const handleClose = () => {
    setConfirmDeleteId(null);
    onClose();
  };

  if (!open) return null;

  const deletingProcess = confirmDeleteId
    ? library.find((p) => p.id === confirmDeleteId)
    : null;

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div
        className="dialog process-manage-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="process-manage-dialog__header">
          <h3 className="dialog__title process-manage-dialog__title">工序管理</h3>
          <button
            className="dialog__btn dialog__btn--confirm"
            onClick={onCreate}
          >
            + 新增工序
          </button>
        </div>

        {/* 筛选栏 */}
        <div className="process-manage-dialog__filters">
          <div className="process-manage-dialog__filter-tabs">
            {(["all", "standard", "custom"] as const).map((cat) => (
              <button
                key={cat}
                className={`process-manage-dialog__filter-tab ${filterCategory === cat ? "process-manage-dialog__filter-tab--active" : ""}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat === "all"
                  ? "全部"
                  : cat === "standard"
                    ? "标准工序"
                    : "自定义工序"}
              </button>
            ))}
          </div>
          <input
            className="process-manage-dialog__search"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索工序名称或编码..."
          />
        </div>

        {/* 列表 */}
        <div className="dialog__body process-manage-dialog__body">
          {loading ? (
            <div className="process-manage-dialog__loading">加载中...</div>
          ) : filtered.length === 0 ? (
            <div className="process-manage-dialog__empty">
              {searchText
                ? `未找到匹配"${searchText}"的工序`
                : filterCategory === "custom"
                  ? "暂无自定义工序，点击「+ 新增工序」创建"
                  : "暂无数据"}
            </div>
          ) : (
            <table className="process-manage-dialog__table">
              <thead>
                <tr>
                  <th className="process-manage-dialog__th">编码</th>
                  <th className="process-manage-dialog__th">名称</th>
                  <th className="process-manage-dialog__th">分类</th>
                  <th className="process-manage-dialog__th">状态</th>
                  <th className="process-manage-dialog__th process-manage-dialog__th--action">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((proc) => (
                  <tr key={proc.id} className="process-manage-dialog__tr">
                    <td className="process-manage-dialog__td process-manage-dialog__td--code">
                      {proc.code}
                    </td>
                    <td className="process-manage-dialog__td process-manage-dialog__td--name">
                      {proc.name}
                    </td>
                    <td className="process-manage-dialog__td">
                      <span
                        className={`process-manage-dialog__category-badge ${proc.category === "standard" ? "process-manage-dialog__category-badge--standard" : "process-manage-dialog__category-badge--custom"}`}
                      >
                        {proc.category === "standard" ? "标准" : "自定义"}
                      </span>
                    </td>
                    <td className="process-manage-dialog__td">
                      <span
                        className={`process-manage-dialog__status-dot ${proc.isActive ? "process-manage-dialog__status-dot--active" : ""}`}
                      />
                      {proc.isActive ? "启用" : "禁用"}
                    </td>
                    <td className="process-manage-dialog__td process-manage-dialog__td--action">
                      {proc.category === "custom" ? (
                        <div className="process-manage-dialog__actions">
                          <button
                            className="process-manage-dialog__action-btn"
                            onClick={() => onEdit(proc)}
                            title="编辑"
                          >
                            ✎
                          </button>
                          <button
                            className={`process-manage-dialog__action-btn ${proc.isActive ? "process-manage-dialog__action-btn--warn" : "process-manage-dialog__action-btn--success"}`}
                            onClick={() =>
                              onToggleActive(proc.id, !proc.isActive)
                            }
                            title={proc.isActive ? "禁用" : "启用"}
                          >
                            {proc.isActive ? "⏸" : "▶"}
                          </button>
                          <button
                            className="process-manage-dialog__action-btn process-manage-dialog__action-btn--danger"
                            onClick={() => handleDeleteClick(proc)}
                            title="删除"
                          >
                            🗑️
                          </button>
                        </div>
                      ) : (
                        <span className="process-manage-dialog__no-action">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dialog__footer">
          <span className="process-manage-dialog__count">
            共 {filtered.length} 条
          </span>
          <button
            className="dialog__btn dialog__btn--cancel"
            onClick={handleClose}
          >
            关闭
          </button>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {deletingProcess && (
        <div className="dialog-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 400 }}
          >
            <h3 className="dialog__title">🗑️ 删除工序</h3>
            <div className="dialog__body">
              <p className="process-manage-dialog__delete-text">
                确定删除自定义工序「{deletingProcess.name}」？
              </p>
              <p className="process-manage-dialog__delete-hint">
                此操作不可撤销。
              </p>
            </div>
            <div className="dialog__footer">
              <button
                className="dialog__btn dialog__btn--cancel"
                onClick={() => setConfirmDeleteId(null)}
              >
                取消
              </button>
              <button
                className="dialog__btn dialog__btn--warning"
                onClick={handleConfirmDelete}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
