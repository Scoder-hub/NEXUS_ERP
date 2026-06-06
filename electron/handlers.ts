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
  ROUTE_GET_HISTORY: "route:get-history",
  ROUTE_GET_HISTORY_DETAIL: "route:get-history-detail",
  ROUTE_ROLLBACK: "route:rollback",
  // 工序管理（TASK-004 新增）
  PROCESS_LIBRARY_CREATE: "process-library:create",
  PROCESS_LIBRARY_UPDATE: "process-library:update",
  PROCESS_LIBRARY_TOGGLE_ACTIVE: "process-library:toggle-active",
  PROCESS_LIBRARY_DELETE: "process-library:delete",
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

  /* ── 保存路线（自动存档历史版本） ── */
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
        changeDescription?: string;
      },
    ) => {
      const now = new Date().toISOString();

      // 1. 读取当前路线
      const current = db
        .prepare("SELECT * FROM routes WHERE id = ?")
        .get(id) as any;
      if (!current) throw new Error("路线不存在");

      // 2. 将旧快照写入 route_history（存档历史版本）
      db.prepare(
        "INSERT INTO route_history (route_id, version, snapshot, change_description, created_at) VALUES (?, ?, ?, ?, ?)",
      ).run(
        id,
        current.version,
        current.snapshot,
        data.changeDescription || `保存时自动存档`,
        now,
      );

      // 3. 计算新版本号（minor + 1）
      const ver = current.version.replace("v", "").split(".");
      const major = parseInt(ver[0]) || 0;
      const minor = parseInt(ver[1]) || 0;
      const newVersion = `v${major}.${minor + 1}`;

      // 4. 更新 routes 表
      const sets: string[] = [
        "snapshot = ?",
        "node_count = ?",
        "edge_count = ?",
        "version = ?",
        "updated_at = ?",
      ];
      const vals: any[] = [
        data.snapshot,
        data.nodeCount,
        data.edgeCount,
        newVersion,
        now,
      ];
      if (data.name) {
        sets.push("name = ?");
        vals.push(data.name);
      }
      vals.push(id);
      db.prepare(`UPDATE routes SET ${sets.join(", ")} WHERE id = ?`).run(
        ...vals,
      );

      return { newVersion };
    },
  );

  /* ── 发布路线（自动存档+主版本号提升） ── */
  ipcMain.handle(CHANNELS.ROUTE_PUBLISH, (_e, id: number) => {
    const current = db
      .prepare("SELECT * FROM routes WHERE id = ?")
      .get(id) as any;
    if (!current) throw new Error("路线不存在");
    const now = new Date().toISOString();

    // 1. 存档当前版本
    db.prepare(
      "INSERT INTO route_history (route_id, version, snapshot, change_description, created_at) VALUES (?, ?, ?, ?, ?)",
    ).run(id, current.version, current.snapshot, `发布版本`, now);

    // 2. 计算新主版本号
    const ver = current.version.replace("v", "").split(".");
    const major = (parseInt(ver[0]) || 0) + 1;
    const newVersion = `v${major}.0`;

    // 3. 更新状态和版本号
    db.prepare(
      "UPDATE routes SET status = 'published', version = ?, published_at = ?, updated_at = ? WHERE id = ?",
    ).run(newVersion, now, now, id);
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

  /* ── 创建自定义工序 ── */
  ipcMain.handle(CHANNELS.PROCESS_LIBRARY_CREATE, (_e, data: any) => {
    const now = new Date().toISOString();
    const name = data.name?.trim();
    if (!name) throw new Error("工序名称不能为空");

    // 查重：同名且启用的工序
    const exists = db
      .prepare(
        "SELECT id FROM process_library WHERE name = ? AND is_active = 1",
      )
      .get(name);
    if (exists) throw new Error("工序名称已存在");

    // 自动生成编码 C001 ~ C999
    const maxCode = db
      .prepare(
        "SELECT code FROM process_library WHERE category = 'custom' ORDER BY code DESC LIMIT 1",
      )
      .get() as { code: string } | undefined;
    const nextNum = maxCode
      ? (parseInt(maxCode.code.replace("C", "")) || 0) + 1
      : 1;
    if (nextNum > 999) throw new Error("自定义工序数量已达上限（999 个）");
    const code = `C${String(nextNum).padStart(3, "0")}`;

    const defaultParams = JSON.stringify(data.defaultParams || []);

    const result = db
      .prepare(
        `
        INSERT INTO process_library (code, name, category, description, icon, responsible_role, default_params, sort_order, is_active, created_at, updated_at)
        VALUES (?, ?, 'custom', ?, 'custom', ?, ?, 99, 1, ?, ?)
      `,
      )
      .run(
        code,
        name,
        data.description || "",
        data.responsibleRole || "",
        defaultParams,
        now,
        now,
      );

    return {
      id: result.lastInsertRowid,
      code,
      name,
      nameEn: null,
      category: "custom",
      description: data.description || "",
      icon: "custom",
      responsibleRole: data.responsibleRole || "",
      defaultParams,
      sortOrder: 99,
      isActive: 1,
      createdAt: now,
      updatedAt: now,
    };
  });

  /* ── 更新自定义工序 ── */
  ipcMain.handle(CHANNELS.PROCESS_LIBRARY_UPDATE, (_e, data: any) => {
    const now = new Date().toISOString();
    const { id } = data;

    // 校验：只能更新自定义工序
    const existing = db
      .prepare(
        "SELECT * FROM process_library WHERE id = ? AND category = 'custom'",
      )
      .get(id) as any;
    if (!existing) throw new Error("工序不存在或不是自定义工序");

    // 查重（改名时）
    if (data.name) {
      const nameTrimmed = data.name.trim();
      const dup = db
        .prepare(
          "SELECT id FROM process_library WHERE name = ? AND id != ? AND is_active = 1",
        )
        .get(nameTrimmed, id);
      if (dup) throw new Error("工序名称已存在");
    }

    const sets: string[] = [];
    const vals: any[] = [];

    if (data.name !== undefined) {
      sets.push("name = ?");
      vals.push(data.name.trim());
    }
    if (data.responsibleRole !== undefined) {
      sets.push("responsible_role = ?");
      vals.push(data.responsibleRole);
    }
    if (data.description !== undefined) {
      sets.push("description = ?");
      vals.push(data.description);
    }
    if (data.defaultParams !== undefined) {
      sets.push("default_params = ?");
      vals.push(JSON.stringify(data.defaultParams));
    }

    if (sets.length === 0) throw new Error("没有需要更新的字段");

    sets.push("updated_at = ?");
    vals.push(now);
    vals.push(id);

    db.prepare(
      `UPDATE process_library SET ${sets.join(", ")} WHERE id = ?`,
    ).run(...vals);

    // 返回更新后的完整记录
    const updated = db
      .prepare("SELECT * FROM process_library WHERE id = ?")
      .get(id) as any;
    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      category: updated.category,
      description: updated.description,
      icon: updated.icon,
      responsibleRole: updated.responsible_role,
      defaultParams: updated.default_params,
      sortOrder: updated.sort_order,
      isActive: updated.is_active,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };
  });

  /* ── 切换启用/禁用状态 ── */
  ipcMain.handle(
    CHANNELS.PROCESS_LIBRARY_TOGGLE_ACTIVE,
    (_e, id: number, isActive: boolean) => {
      const existing = db
        .prepare(
          "SELECT * FROM process_library WHERE id = ? AND category = 'custom'",
        )
        .get(id) as any;
      if (!existing) throw new Error("工序不存在或不是自定义工序");

      const now = new Date().toISOString();
      db.prepare(
        "UPDATE process_library SET is_active = ?, updated_at = ? WHERE id = ?",
      ).run(isActive ? 1 : 0, now, id);
    },
  );

  /* ── 删除自定义工序（含引用检查） ── */
  ipcMain.handle(CHANNELS.PROCESS_LIBRARY_DELETE, (_e, id: number) => {
    const existing = db
      .prepare(
        "SELECT * FROM process_library WHERE id = ? AND category = 'custom'",
      )
      .get(id) as any;
    if (!existing) throw new Error("工序不存在或不是自定义工序");

    // 引用检查：在 route 快照中模糊查询工序 ID
    const refs = db
      .prepare(
        `SELECT DISTINCT id, name, version FROM routes WHERE snapshot LIKE ?`,
      )
      .all(`%"processId":${id}%`) as {
      id: number;
      name: string;
      version: string;
    }[];

    if (refs.length > 0) {
      return {
        success: false,
        message: `该工序正被 ${refs.length} 条路线使用`,
        referencedBy: refs.map((r: any) => ({
          id: r.id,
          name: r.name,
          version: r.version,
        })),
      };
    }

    db.prepare(
      "DELETE FROM process_library WHERE id = ? AND category = 'custom'",
    ).run(id);

    return { success: true, message: "删除成功" };
  });
}

export { CHANNELS };
