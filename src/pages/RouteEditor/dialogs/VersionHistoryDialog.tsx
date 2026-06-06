import { useEffect, useState, useCallback } from "react";
import type { VersionHistoryItem } from "../../../lib/types/route";

interface VersionHistoryDialogProps {
  routeId: number;
  currentVersion: string;
  open: boolean;
  onClose: () => void;
  onRollback: (historyId: number, version: string) => void;
  onCompare: (historyIdA: number, historyIdB: number) => void;
}

export default function VersionHistoryDialog({
  routeId,
  currentVersion,
  open,
  onClose,
  onRollback,
  onCompare,
}: VersionHistoryDialogProps) {
  const [history, setHistory] = useState<VersionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (open && routeId) {
      setLoading(true);
      setSelectedIds([]);
      window.electronAPI.route
        .getHistory(routeId)
        .then((items) => {
          setHistory(items);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open, routeId]);

  // Esc 键关闭
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const toggleSelect = useCallback(
    (id: number) => {
      setSelectedIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((i) => i !== id);
        }
        // 最多选 2 个
        if (prev.length >= 2) return [prev[1], id];
        return [...prev, id];
      });
    },
    [],
  );

  const handleCompare = useCallback(() => {
    if (selectedIds.length === 2) {
      // 确保 idA < idB（创建时间正序，A 为旧版本）
      const [idA, idB] = selectedIds;
      onCompare(idA, idB);
    }
  }, [selectedIds, onCompare]);

  const handleRollback = useCallback(() => {
    if (selectedIds.length === 1) {
      const item = history.find((h) => h.id === selectedIds[0]);
      if (item) onRollback(selectedIds[0], item.version);
    }
  }, [selectedIds, history, onRollback]);

  // 判断选中的是否为当前最新版本
  const isSelectedCurrentVersion =
    selectedIds.length === 1 &&
    history.length > 0 &&
    selectedIds[0] === history[0].id;

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog history-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog__title">版本历史</h3>
        <div className="dialog__subtitle">
          当前版本: <strong>{currentVersion}</strong>
          <span className="history-dialog__hint">
            （点击选择版本，单选可回滚，双选可对比）
          </span>
        </div>

        <div className="history-dialog__body">
          {loading ? (
            <div className="history-dialog__loading">加载中...</div>
          ) : history.length === 0 ? (
            <div className="history-dialog__empty">暂无版本历史</div>
          ) : (
            <ul className="history-dialog__list">
              {history.map((item, idx) => (
                <li
                  key={item.id}
                  className={`history-dialog__item ${
                    selectedIds.includes(item.id)
                      ? "history-dialog__item--selected"
                      : ""
                  } ${idx === 0 ? "history-dialog__item--latest" : ""}`}
                  onClick={() => toggleSelect(item.id)}
                >
                  <div className="history-dialog__item-header">
                    <span className="history-dialog__item-version">
                      {item.version}
                      {idx === 0 && (
                        <span className="history-dialog__item-latest-badge">
                          当前
                        </span>
                      )}
                    </span>
                    <span className="history-dialog__item-date">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <div className="history-dialog__item-desc">
                    {item.changeDescription || "无变更说明"}
                  </div>
                  {selectedIds.includes(item.id) && (
                    <div className="history-dialog__item-order">
                      {selectedIds.indexOf(item.id) === 0 ? "版本 A" : "版本 B"}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dialog__footer">
          <button
            className="dialog__btn dialog__btn--cancel"
            onClick={onClose}
          >
            关闭
          </button>
          <button
            className="dialog__btn dialog__btn--secondary"
            onClick={handleCompare}
            disabled={selectedIds.length !== 2}
          >
            对比选中版本
          </button>
          <button
            className="dialog__btn dialog__btn--warning"
            onClick={handleRollback}
            disabled={selectedIds.length !== 1 || isSelectedCurrentVersion}
            title={
              isSelectedCurrentVersion
                ? "当前版本无需回滚"
                : selectedIds.length !== 1
                  ? "请选择一个版本"
                  : "回滚到此版本"
            }
          >
            回滚到此版本
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return dateStr;
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
