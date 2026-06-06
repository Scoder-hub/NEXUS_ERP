import { useCallback, useRef, type DragEvent } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type NodeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ProcessNode from "./nodes/ProcessNode";
import StartNode from "./nodes/StartNode";
import EndNode from "./nodes/EndNode";

const nodeTypes: NodeTypes = {
  process: ProcessNode,
  start: StartNode,
  end: EndNode,
};

interface CanvasViewProps {
  nodes: Node[];
  edges: any[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: (event: any, node: Node) => void;
  onNodeDoubleClick: (event: any, node: Node) => void;
  onPaneClick: () => void;
  onDropNode: (processId: number, position: { x: number; y: number }) => void;
  readonly?: boolean;
}

export default function CanvasView({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onNodeDoubleClick,
  onPaneClick,
  onDropNode,
  readonly = false,
}: CanvasViewProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const data = event.dataTransfer.getData("application/json");
      if (!data || !reactFlowInstance.current || !reactFlowWrapper.current)
        return;

      const { processId } = JSON.parse(data);
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      onDropNode(processId, position);
    },
    [onDropNode],
  );

  return (
    <div className="canvas-wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        nodeTypes={nodeTypes}
        fitView
        selectionMode={SelectionMode.Partial}
        nodesDraggable={!readonly}
        nodesConnectable={!readonly}
        elementsSelectable={!readonly}
        deleteKeyCode={readonly ? null : ["Delete", "Backspace"]}
        multiSelectionKeyCode="Shift"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeStrokeColor="#2563eb"
          nodeColor={(n: any) => {
            if (n.type === "start") return "#10b981";
            if (n.type === "end") return "#ef4444";
            return "#93c5fd";
          }}
          maskColor="rgba(0,0,0,0.1)"
          style={{ borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}
