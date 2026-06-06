import type { RouteSnapshot, VersionDiff, ParamChange } from '../types/route'

/** 计算两个版本快照的差异 */
export function computeVersionDiff(
  snapshotA: RouteSnapshot,
  snapshotB: RouteSnapshot,
  metaA: { version: string },
  metaB: { version: string },
): VersionDiff {
  const nodesA = new Map(snapshotA.nodes.map(n => [n.id, n]))
  const nodesB = new Map(snapshotB.nodes.map(n => [n.id, n]))

  const paramChanges: ParamChange[] = []
  const changedNodeIds: string[] = []
  const addedNodeIds: string[] = []
  const removedNodeIds: string[] = []

  // 找出新增和参数变更的节点
  for (const [id, nodeB] of nodesB) {
    if (!nodesA.has(id)) {
      addedNodeIds.push(id)
    } else {
      const nodeA = nodesA.get(id)!
      // 对比参数
      const paramsA = nodeA.data.params || {}
      const paramsB = nodeB.data.params || {}
      const allKeys = new Set([...Object.keys(paramsA), ...Object.keys(paramsB)])
      let hasParamChange = false
      for (const key of allKeys) {
        if (JSON.stringify(paramsA[key]) !== JSON.stringify(paramsB[key])) {
          paramChanges.push({
            nodeName: nodeB.data.name || id,
            paramName: key,
            oldValue: paramsA[key],
            newValue: paramsB[key],
          })
          hasParamChange = true
        }
      }
      if (hasParamChange) changedNodeIds.push(id)
    }
  }

  // 找出删除的节点
  for (const [id] of nodesA) {
    if (!nodesB.has(id)) {
      removedNodeIds.push(id)
    }
  }

  return {
    versionA: metaA.version,
    versionB: metaB.version,
    summary: {
      nodesBefore: snapshotA.nodes.length,
      nodesAfter: snapshotB.nodes.length,
      edgesBefore: snapshotA.edges.length,
      edgesAfter: snapshotB.edges.length,
      paramChanges,
    },
    addedNodeIds,
    removedNodeIds,
    changedNodeIds,
  }
}
