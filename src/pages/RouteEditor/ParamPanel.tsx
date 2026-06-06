import { useState, useEffect, useCallback } from "react";
import type { Node } from "@xyflow/react";
import type { ProcessLibraryItem } from "../../lib/types/route";

interface ParamPanelProps {
  node: Node | null;
  processLibrary: ProcessLibraryItem[];
  onParamsChange: (nodeId: string, params: Record<string, any>) => void;
  onClose: () => void;
  readonly?: boolean;
}

export default function ParamPanel({
  node,
  processLibrary,
  onParamsChange,
  onClose,
  readonly = false,
}: ParamPanelProps) {
  const [params, setParams] = useState<Record<string, any>>({});
  const proc = node
    ? processLibrary.find((p) => p.id === node.data.processId)
    : null;

  useEffect(() => {
    if (node?.data?.params && Object.keys(node.data.params).length > 0) {
      setParams(node.data.params);
    } else if (proc?.defaultParams) {
      try {
        const defaultParams = JSON.parse(proc.defaultParams);
        const initParams: Record<string, any> = {};
        for (const [key, cfg] of Object.entries(defaultParams)) {
          initParams[key] = (cfg as any).value;
        }
        setParams(initParams);
      } catch {
        setParams({});
      }
    } else {
      setParams({});
    }
  }, [node?.id, proc?.id]);

  const handleParamChange = useCallback((key: string, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (node) {
      onParamsChange(node.id, params);
    }
  }, [node, params, onParamsChange]);

  if (!node) {
    return (
      <aside className="param-panel">
        <div className="param-panel__empty">
          <p>点击或双击节点编辑参数</p>
        </div>
      </aside>
    );
  }

  if (node.type === "start" || node.type === "end") {
    return (
      <aside className="param-panel">
        <div className="param-panel__header">
          <span className="param-panel__title">节点信息</span>
          <button className="param-panel__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="param-panel__body">
          <p className="param-panel__hint">
            {node.type === "start" ? "起点" : "终点"}无需配置参数
          </p>
        </div>
      </aside>
    );
  }

  const defaultParams = proc?.defaultParams
    ? JSON.parse(proc.defaultParams)
    : {};

  return (
    <aside className="param-panel">
      <div className="param-panel__header">
        <span className="param-panel__title">参数配置</span>
        <button className="param-panel__close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="param-panel__body">
        <div className="param-panel__field">
          <label className="param-panel__label">工序名称</label>
          <input
            className="param-panel__input"
            value={(node.data.name as string) || ""}
            disabled
          />
        </div>

        {Object.entries(defaultParams).map(([key, cfg]: [string, any]) => {
          const isRequired = cfg.required;
          const hasOptions = Array.isArray(cfg.options);

          return (
            <div key={key} className="param-panel__field">
              <label className="param-panel__label">
                {key}
                {isRequired && <span className="param-panel__required">*</span>}
              </label>

              {hasOptions ? (
                <select
                  className="param-panel__select"
                  value={params[key]?.toString() || cfg.value?.toString() || ""}
                  onChange={(e: React.ChangeEvent<any>) =>
                    handleParamChange(key, e.target.value)
                  }
                  disabled={readonly}
                >
                  {cfg.options.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="param-panel__input"
                  type={typeof cfg.value === "number" ? "number" : "text"}
                  value={params[key]?.toString() || ""}
                  onChange={(e: React.ChangeEvent<any>) =>
                    handleParamChange(key, e.target.value)
                  }
                  disabled={readonly}
                  min={cfg.min}
                  max={cfg.max}
                />
              )}

              {cfg.unit && (
                <span className="param-panel__unit">{cfg.unit}</span>
              )}
              {cfg.min != null && cfg.max != null && (
                <span className="param-panel__range">
                  安全范围: {cfg.min}~{cfg.max}
                  {cfg.unit || ""}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!readonly && (
        <div className="param-panel__footer">
          <button
            className="param-panel__btn param-panel__btn--confirm"
            onClick={handleConfirm}
          >
            确认
          </button>
          <button
            className="param-panel__btn param-panel__btn--cancel"
            onClick={onClose}
          >
            取消
          </button>
        </div>
      )}
    </aside>
  );
}
