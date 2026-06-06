import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

type ProcessNodeData = {
  name: string;
  params?: Record<string, any>;
  isValid: boolean;
};

function ProcessNode({ data, selected }: NodeProps<Node<ProcessNodeData>>) {
  const { name, params, isValid } = data;
  const paramEntries = params ? Object.entries(params).slice(0, 2) : [];

  return (
    <div
      className={`process-node ${selected ? "process-node--selected" : ""} ${!isValid && Object.keys(params || {}).length > 0 ? "process-node--invalid" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="process-node__handle"
      />
      <div className="process-node__body">
        <div className="process-node__icon">⚙️</div>
        <div className="process-node__name">{name}</div>
        {paramEntries.length > 0 && (
          <div className="process-node__params">
            {paramEntries.map(([key, val]) => (
              <div key={key} className="process-node__param">
                {key}: {typeof val === "object" ? val.value : val}
                {typeof val === "object" && val.unit ? val.unit : ""}
              </div>
            ))}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="process-node__handle"
      />
    </div>
  );
}

export default memo(ProcessNode);
