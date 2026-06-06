import type { Node, Edge } from "@xyflow/react";
import type { InspectionItem } from "../types/route";

/**
 * 质检节点保存前校验
 * 检查每个质检节点是否有 2 条出线（通过 + 不通过）
 * @returns 返回不合格的质检节点 ID 列表
 */
export function validateInspectionNodes(nodes: Node[], edges: Edge[]): string[] {
  const invalid: string[] = [];
  for (const node of nodes) {
    if (node.type !== "inspection") continue;

    const outEdges = edges.filter((e) => e.source === node.id);
    if (outEdges.length < 2) {
      invalid.push(node.id);
    }
  }
  return invalid;
}

/**
 * 检查质检节点的检测项目完整性
 * @returns 返回缺少检测项目的节点 ID 列表
 */
export function validateInspectionItems(nodes: Node[]): string[] {
  const invalid: string[] = [];
  for (const node of nodes) {
    if (node.type !== "inspection") continue;
    const items = (node.data as any)?.inspectionItems as InspectionItem[] | undefined;
    if (!items || items.length === 0) {
      invalid.push(node.id);
    }
  }
  return invalid;
}

/**
 * 获取质检节点计数（用于自动命名）
 */
export function getInspectionNodeCount(nodes: Node[]): number {
  return nodes.filter((n) => n.type === "inspection").length;
}

/**
 * 生成唯一的质检节点名称
 */
export function getNextInspectionNodeName(nodes: Node[]): string {
  const count = getInspectionNodeCount(nodes) + 1;
  return `质检 ${count}`;
}
