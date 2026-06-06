import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { InspectionItem } from "../../lib/types/route";
import { INSPECTION_HANDLES } from "../../lib/types/route";

function InspectionNode({ data, selected }: NodeProps) {
  const items = (data.inspectionItems as InspectionItem[]) || [];
  const isValid = items.length > 0;
  const firstItemName = items.length > 0 ? items[0].name : "";

  return (
    <div
      className={`inspection-node ${selected ? "inspection-node--selected" : ""} ${!isValid ? "inspection-node--invalid" : ""}`}
    >
      {/* 菱形容器（内部是方形容器，通过父级 CSS transform 旋转 45deg） */}
      <div className="inspection-node__diamond">
        <div className="inspection-node__content">
          <span className="inspection-node__icon">🔍</span>
          <span className="inspection-node__name">{data.name as string}</span>
          {firstItemName && (
            <span className="inspection-node__preview">{firstItemName}</span>
          )}
        </div>
      </div>

      {/* 输入端口 */}
      <Handle
        type="target"
        position={Position.Left}
        className="inspection-node__handle inspection-node__handle--input"
      />

      {/* 通过端口（右侧上方） */}
      <Handle
        type="source"
        position={Position.Right}
        id={INSPECTION_HANDLES.PASS}
        className="inspection-node__handle inspection-node__handle--pass"
        title="✅ 通过"
      />

      {/* 不通过端口（右侧下方） */}
      <Handle
        type="source"
        position={Position.Right}
        id={INSPECTION_HANDLES.FAIL}
        className="inspection-node__handle inspection-node__handle--fail"
        title="❌ 不通过"
      />
    </div>
  );
}

export default memo(InspectionNode);
