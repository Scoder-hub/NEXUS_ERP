import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import type { InspectionEdgeData } from "../../lib/types/route";

function InspectionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as InspectionEdgeData | undefined;
  const isPass = edgeData?.label === "pass";
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={`inspection-edge ${isPass ? "inspection-edge--pass" : "inspection-edge--fail"} ${selected ? "inspection-edge--selected" : ""}`}
      />
      <EdgeLabelRenderer>
        <div
          className={`inspection-edge__label ${isPass ? "inspection-edge__label--pass" : "inspection-edge__label--fail"}`}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "none",
          }}
        >
          {isPass ? "✅ 通过" : "❌ 不通过"}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(InspectionEdge);
