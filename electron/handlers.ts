import { ipcMain } from "electron";
import { getDb } from "./database";

const CHANNELS = {
  PROCESS_LIBRARY_GET_ALL: "process-library:get-all",
  PROCESS_LIBRARY_GET_BY_CATEGORY: "process-library:get-by-category",
  PROCESS_LIBRARY_SEARCH: "process-library:search",
  ROUTE_LIST: "route:list",
  ROUTE_GET_BY_ID: "route:get-by-id",
  ROUTE_CREATE: "route:create",
  ROUTE_SAVE: "route:save",
  ROUTE_PUBLISH: "route:publish",
  ROUTE_DELETE: "route:delete",
  ROUTE_NEW_VERSION: "route:new-version",
};

/** 注册所有 IPC handlers */
export function registerHandlers() {
  const db = getDb();

  /* ── 工序库 ── */
  ipcMain.handle(CHANNELS.PROCESS_LIBRARY_GET_ALL, () => {
    const rows = db
      .prepare(
        "SELECT * FROM process_library WHERE is_active = 1 ORDER BY sort_order ASC",
      )
      .all();
    return rows;
  });

  ipcMain.handle(
    CHANNELS.PROCESS_LIBRARY_GET_BY_CATEGORY,
    (_e, category: string) => {
      const rows = db
        .prepare(
          "SELECT * FROM process_library WHERE category = ? AND is_active = 1 ORDER BY sort_order ASC",
        )
        .all(category);
      return rows;
    },
  );

  ipcMain.handle(CHANNELS.PROCESS_LIBRARY_SEARCH, (_e, query: string) => {
    const rows = db
      .prepare(
        "SELECT * FROM process_library WHERE is_active = 1 AND name LIKE ? ORDER BY sort_order ASC",
      )
      .all(`%${query}%`);
    return rows;
  });

  /* ── 路线列表 ── */
  ipcMain.handle(
    CHANNELS.ROUTE_LIST,
    (
      _e,
      params: {
        status?: string;
        search?: string;
        page?: number;
        pageSize?: number;
      },
    ) => {
      const { status, search, page = 1, pageSize = 20 } = params || {};
      const conditions: string[] = [];
      const values: any[] = [];
      if (status) {
        conditions.push("status = ?");
        values.push(status);
      }
      if (search) {
        conditions.push("name LIKE ?");
        values.push(`%${search}%`);
      }
      const where =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const offset = (page - 1) * pageSize;

      const total = (
        db
          .prepare(`SELECT COUNT(*) as total FROM routes ${where}`)
          .get(...values) as { total: number }
      ).total;
      const items = db
        .prepare(
          `SELECT id, name, version, status, node_count as nodeCount, edge_count as edgeCount, updated_at as updatedAt FROM routes ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
        )
        .all(...values, pageSize, offset);

      return { items, total };
    },
  );

  /* ── 获取单条路线 ── */
  ipcMain.handle(CHANNELS.ROUTE_GET_BY_ID, (_e, id: number) => {
    const row = db.prepare("SELECT * FROM routes WHERE id = ?").get(id) as any;
    if (!row) return null;
    try {
      return {
        id: row.id,
        name: row.name,
        version: row.version,
        status: row.status,
        snapshot: JSON.parse(row.snapshot),
        nodeCount: row.node_count,
        edgeCount: row.edge_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        publishedAt: row.published_at,
      };
    } catch {
      console.error("路线快照数据损坏:", row.id);
      return null;
    }
  });

  /* ── 创建新路线 ── */
  ipcMain.handle(CHANNELS.ROUTE_CREATE, (_e, data: { name: string }) => {
    const now = new Date().toISOString();
    const emptySnapshot = JSON.stringify({
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    });
    const result = db
      .prepare(
        `
      INSERT INTO routes (name, version, status, snapshot, node_count, edge_count, created_at, updated_at)
      VALUES (?, 'v0.1', 'draft', ?, 0, 0, ?, ?)
    `,
      )
      .run(data.name, emptySnapshot, now, now);
    return {
      id: result.lastInsertRowid,
      name: data.name,
      version: "v0.1",
      status: "draft",
      snapshot: JSON.parse(emptySnapshot),
      nodeCount: 0,
      edgeCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  });

  /* ── 保存路线 ── */
  ipcMain.handle(
    CHANNELS.ROUTE_SAVE,
    (
      _e,
      id: number,
      data: {
        name?: string;
        snapshot: string;
        nodeCount: number;
        edgeCount: number;
      },
    ) => {
      const now = new Date().toISOString();
      const sets: string[] = [
        "snapshot = ?",
        "node_count = ?",
        "edge_count = ?",
        "updated_at = ?",
      ];
      const vals: any[] = [data.snapshot, data.nodeCount, data.edgeCount, now];
      if (data.name) {
        sets.push("name = ?");
        vals.push(data.name);
      }
      vals.push(id);
      db.prepare(`UPDATE routes SET ${sets.join(", ")} WHERE id = ?`).run(
        ...vals,
      );
    },
  );

  /* ── 发布路线 ── */
  ipcMain.handle(CHANNELS.ROUTE_PUBLISH, (_e, id: number) => {
    const now = new Date().toISOString();
    db.prepare(
      "UPDATE routes SET status = 'published', published_at = ?, updated_at = ? WHERE id = ?",
    ).run(now, now, id);
  });

  /* ── 删除路线 ── */
  ipcMain.handle(CHANNELS.ROUTE_DELETE, (_e, id: number) => {
    db.prepare("DELETE FROM routes WHERE id = ? AND status = 'draft'").run(id);
  });

  /* ── 新建版本 ── */
  ipcMain.handle(CHANNELS.ROUTE_NEW_VERSION, (_e, id: number) => {
    const original = db
      .prepare("SELECT * FROM routes WHERE id = ?")
      .get(id) as any;
    if (!original) throw new Error("路线不存在");

    // 旧版本存档
    const now = new Date().toISOString();
    db.prepare(
      "INSERT INTO route_history (route_id, version, snapshot, change_description, created_at) VALUES (?, ?, ?, ?, ?)",
    ).run(
      original.id,
      original.version,
      original.snapshot,
      `升级到新版本`,
      now,
    );

    // 计算新版本号
    const major =
      parseInt(original.version.replace("v", "").split(".")[0]) || 0;
    const minor =
      parseInt(original.version.replace("v", "").split(".")[1]) || 0;
    const newVersion = `v${major}.${minor + 1}`;

    // 创建新路线记录（草稿）
    const newSnapshot = JSON.stringify(JSON.parse(original.snapshot)); // deep copy
    const result = db
      .prepare(
        `
      INSERT INTO routes (name, version, status, snapshot, node_count, edge_count, created_by, created_at, updated_at)
      VALUES (?, ?, 'draft', ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        `${original.name} (${newVersion})`,
        newVersion,
        newSnapshot,
        original.node_count,
        original.edge_count,
        original.created_by,
        now,
        now,
      );

    return {
      id: result.lastInsertRowid,
      name: `${original.name} (${newVersion})`,
      version: newVersion,
      status: "draft",
      snapshot: JSON.parse(newSnapshot),
      nodeCount: original.node_count,
      edgeCount: original.edge_count,
      createdAt: now,
      updatedAt: now,
    };
  });
}

export { CHANNELS };
