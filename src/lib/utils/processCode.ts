/* ── 编码生成工具 ── */

/**
 * 根据现有自定义工序编码列表，生成下一个编码
 * 格式：C001, C002, ..., C999
 */
export function getNextCustomCode(existingCodes: string[]): string {
  const maxNum = existingCodes
    .filter((c) => c.startsWith("C"))
    .map((c) => parseInt(c.replace("C", "")) || 0)
    .reduce((max, n) => Math.max(max, n), 0);
  return `C${String(maxNum + 1).padStart(3, "0")}`;
}

/**
 * 检查编码格式是否合法
 */
export function isValidCode(code: string): boolean {
  return /^C\d{3}$/.test(code);
}

/**
 * 排序自定义工序编码（C001 → C002 → ...）
 */
export function sortCustomCodes(codes: string[]): string[] {
  return [...codes].sort((a, b) => {
    const numA = parseInt(a.replace("C", "")) || 0;
    const numB = parseInt(b.replace("C", "")) || 0;
    return numA - numB;
  });
}
