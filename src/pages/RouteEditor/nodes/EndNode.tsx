import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

function EndNode({ selected }: NodeProps<Node>) {
  return (
    <div className={`end-node ${selected ? "end-node--selected" : ""}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="end-node__handle"
      />
      <div className="end-node__label">终点</div>
    </div>
  );
}

export default memo(EndNode);
