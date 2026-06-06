import type { VersionDiff, VersionHistoryDetail } from "../../../lib/types/route";

interface VersionCompareViewProps {
  diff: VersionDiff;
  snapshotA: VersionHistoryDetail;
  snapshotB: VersionHistoryDetail;
  onBack: () => void;
}

export default function VersionCompareView({
  diff,
  snapshotA,
  snapshotB,
  onBack,
}: VersionCompareViewProps) {
  const { summary } = diff;

  return (
    <div className="compare-view">
      <div className="compare-view__header">
        <button className="compare-view__back" onClick={onBack}>
          ← 返回编辑器
        </button>
        <h3 className="compare-view__title">版本对比</h3>
      </div>

      {/* 概览统计 */}
      <div className="compare-view__summary">
        <div className="compare-view__summary-card">
          <div className="compare-view__summary-label">版本</div>
          <div className="compare-view__summary-value">
            <span className="compare-view__version-tag">{diff.versionA}</span>
            <span className="compare-view__arrow">→</span>
            <span className="compare-view__version-tag compare-view__version-tag--new">
              {diff.versionB}
            </span>
          </div>
        </div>
        <div className="compare-view__summary-card">
          <div className="compare-view__summary-label">节点</div>
          <div className="compare-view__summary-value">
            {summary.nodesBefore}
            <span className="compare-view__arrow">→</span>
            {summary.nodesAfter}
            {summary.nodesAfter > summary.nodesBefore && (
              <span className="compare-view__badge compare-view__badge--add">
                +{summary.nodesAfter - summary.nodesBefore}
              </span>
            )}
            {summary.nodesAfter < summary.nodesBefore && (
              <span className="compare-view__badge compare-view__badge--remove">
                -{summary.nodesBefore - summary.nodesAfter}
              </span>
            )}
          </div>
        </div>
        <div className="compare-view__summary-card">
          <div className="compare-view__summary-label">连线</div>
          <div className="compare-view__summary-value">
            {summary.edgesBefore}
            <span className="compare-view__arrow">→</span>
            {summary.edgesAfter}
          </div>
        </div>
        <div className="compare-view__summary-card">
          <div className="compare-view__summary-label">参数变更</div>
          <div className="compare-view__summary-value">
            {summary.paramChanges.length} 项
          </div>
        </div>
      </div>

      {/* 节点变更详情 */}
      <div className="compare-view__details">
        {diff.addedNodeIds.length > 0 && (
          <div className="compare-view__section">
            <h4 className="compare-view__section-title compare-view__section-title--add">
              新增节点 ({diff.addedNodeIds.length})
            </h4>
            <ul className="compare-view__list">
              {diff.addedNodeIds.map((id) => {
                const node = snapshotB.snapshot.nodes.find((n) => n.id === id);
                return (
                  <li key={id} className="compare-view__list-item compare-view__list-item--add">
                    <span className="compare-view__node-name">
                      {node?.data.name || id}
                    </span>
                    <span className="compare-view__node-type">新增</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {diff.removedNodeIds.length > 0 && (
          <div className="compare-view__section">
            <h4 className="compare-view__section-title compare-view__section-title--remove">
              删除节点 ({diff.removedNodeIds.length})
            </h4>
            <ul className="compare-view__list">
              {diff.removedNodeIds.map((id) => {
                const node = snapshotA.snapshot.nodes.find((n) => n.id === id);
                return (
                  <li key={id} className="compare-view__list-item compare-view__list-item--remove">
                    <span className="compare-view__node-name">
                      {node?.data.name || id}
                    </span>
                    <span className="compare-view__node-type">删除</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {summary.paramChanges.length > 0 && (
          <div className="compare-view__section">
            <h4 className="compare-view__section-title compare-view__section-title--change">
              参数变更 ({summary.paramChanges.length})
            </h4>
            <ul className="compare-view__list">
              {summary.paramChanges.map((change, i) => (
                <li key={i} className="compare-view__list-item compare-view__list-item--change">
                  <div className="compare-view__param-header">
                    <span className="compare-view__node-name">
                      {change.nodeName}
                    </span>
                    <span className="compare-view__param-name">
                      · {change.paramName}
                    </span>
                  </div>
                  <div className="compare-view__param-values">
                    <span className="compare-view__param-old">
                      {formatParamValue(change.oldValue)}
                    </span>
                    <span className="compare-view__arrow">→</span>
                    <span className="compare-view__param-new">
                      {formatParamValue(change.newValue)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {diff.addedNodeIds.length === 0 &&
          diff.removedNodeIds.length === 0 &&
          summary.paramChanges.length === 0 && (
            <div className="compare-view__empty">
              两个版本之间没有差异
            </div>
          )}
      </div>
    </div>
  );
}

/** 格式化参数值，支持对象/数组 */
function formatParamValue(value: unknown): string {
  if (value === null || value === undefined) return "(空)";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
