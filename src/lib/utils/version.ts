/** 版本号工具函数 */

/** 解析版本号为 major/minor */
export function parseVersion(v: string): { major: number; minor: number } {
  const cleaned = v.replace('v', '')
  const parts = cleaned.split('.')
  return {
    major: parseInt(parts[0]) || 0,
    minor: parseInt(parts[1]) || 0,
  }
}

/** 计算新版本号（minor+1） */
export function nextMinorVersion(v: string): string {
  const { major, minor } = parseVersion(v)
  return `v${major}.${minor + 1}`
}

/** 计算新主版本号（major+1, minor=0） */
export function nextMajorVersion(v: string): string {
  const { major } = parseVersion(v)
  return `v${major + 1}.0`
}
