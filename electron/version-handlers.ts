import { ipcMain } from "electron";
import { getDb } from "./database";
import { CHANNELS } from "./handlers";

/** 注册版本管理相关 IPC handlers */
export function registerVersionHandlers() {
  const db = getDb();

  /* ── 获取版本历史列表 ── */
  ipcMain.handle(CHANNELS.ROUTE_GET_HISTORY, (_e, routeId: number) => {
    const rows = db
      .prepare(`
        SELECT h.id, h.route_id as routeId, h.version,
               h.change_description as changeDescription,
               h.created_at as createdAt
        FROM route_history h
        WHERE h.route_id = ?
        ORDER BY h.created_at DESC
      `)
      .all(routeId);
    return rows;
  });

  /* ── 获取单个版本历史详情 ── */
  ipcMain.handle(CHANNELS.ROUTE_GET_HISTORY_DETAIL, (_e, historyId: number) => {
    const row = db
      .prepare("SELECT * FROM route_history WHERE id = ?")
      .get(historyId) as any;
    if (!row) return null;
    try {
      return {
        id: row.id,
        routeId: row.route_id,
        version: row.version,
        changeDescription: row.change_description,
        createdAt: row.created_at,
        snapshot: JSON.parse(row.snapshot),
      };
    } catch {
      return null;
    }
  });

  /* ── 回滚到指定版本 ── */
  ipcMain.handle(
    CHANNELS.ROUTE_ROLLBACK,
    (_e, routeId: number, historyId: number, changeDescription: string) => {
      const historyRow = db
        .prepare("SELECT * FROM route_history WHERE id = ?")
        .get(historyId) as any;
      if (!historyRow) throw new Error("历史版本不存在");

      const current = db
        .prepare("SELECT * FROM routes WHERE id = ?")
        .get(routeId) as any;
      if (!current) throw new Error("路线不存在");
      const now = new Date().toISOString();

      // 存档当前状态
      db.prepare(
        "INSERT INTO route_history (route_id, version, snapshot, change_description, created_at) VALUES (?, ?, ?, ?, ?)",
      ).run(routeId, current.version, current.snapshot, "回滚前自动存档", now);

      // 计算新版本号
      const ver = current.version.replace("v", "").split(".");
      const major = parseInt(ver[0], 10) || 0;
      const minor = parseInt(ver[1], 10) || 0;
      const newVersion = `v${major}.${minor + 1}`;

      // 将历史版本的 snapshot 写入当前路线
      const historySnapshot = JSON.parse(historyRow.snapshot);
      const snapshotStr = JSON.stringify(historySnapshot);
      const nodeCount = historySnapshot.nodes?.length || 0;
      const edgeCount = historySnapshot.edges?.length || 0;
      db.prepare(
        "UPDATE routes SET snapshot = ?, version = ?, node_count = ?, edge_count = ?, updated_at = ? WHERE id = ?",
      ).run(snapshotStr, newVersion, nodeCount, edgeCount, now, routeId);

      // 写入回滚说明
      db.prepare(
        "INSERT INTO route_history (route_id, version, snapshot, change_description, created_at) VALUES (?, ?, ?, ?, ?)",
      ).run(
        routeId,
        newVersion,
        snapshotStr,
        changeDescription || `回滚到 ${historyRow.version}`,
        now,
      );

      return {
        id: routeId,
        name: current.name,
        version: newVersion,
        status: current.status,
        snapshot: historySnapshot,
        nodeCount,
        edgeCount,
        createdAt: current.created_at,
        updatedAt: now,
        publishedAt: current.published_at,
      };
    },
  );
}
