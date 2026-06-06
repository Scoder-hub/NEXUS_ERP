import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

function StartNode({ selected }: NodeProps<Node>) {
  return (
    <div className={`start-node ${selected ? "start-node--selected" : ""}`}>
      <div className="start-node__label">起点</div>
      <Handle
        type="source"
        position={Position.Right}
        className="start-node__handle"
      />
    </div>
  );
}

export default memo(StartNode);
