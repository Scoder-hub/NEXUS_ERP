import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useRouteStore } from "../../stores/routeStore";

export default function RouteList() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const store = useRouteStore(
    useShallow((s) => ({
      routeList: s.routeList,
      listLoading: s.listLoading,
      fetchRouteList: s.fetchRouteList,
      deleteRoute: s.deleteRoute,
      setListFilter: s.setListFilter,
      listFilter: s.listFilter,
    })),
  );

  useEffect(() => {
    store.fetchRouteList();
  }, [store.listFilter]);

  const handleSearch = useCallback(() => {
    store.setListFilter({
      status: statusFilter || undefined,
      search: searchText || undefined,
    });
  }, [searchText, statusFilter]);

  const handleCreate = useCallback(() => {
    navigate("/routes/new");
  }, [navigate]);

  const handleEdit = useCallback(
    (id: number) => {
      navigate(`/routes/${id}`);
    },
    [navigate],
  );

  const handleDelete = useCallback(async (id: number, name: string) => {
    if (window.confirm(`确定删除路线「${name}」？此操作不可撤销。`)) {
      await store.deleteRoute(id);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch],
  );

  return (
    <div className="route-list">
      {/* 标题栏 */}
      <div className="route-list__header">
        <h1 className="route-list__title">工艺路线</h1>
        <div className="route-list__actions">
          <button
            className="route-list__btn route-list__btn--primary"
            onClick={handleCreate}
          >
            + 新建路线
          </button>
        </div>
      </div>

      {/* 过滤栏 */}
      <div className="route-list__filters">
        <select
          className="route-list__select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="pending">待审核</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </select>
        <input
          type="text"
          className="route-list__search"
          placeholder="搜索路线名称..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="route-list__btn route-list__btn--secondary"
          onClick={handleSearch}
        >
          搜索
        </button>
      </div>

      {/* 列表 */}
      {store.listLoading ? (
        <div className="route-list__loading">加载中...</div>
      ) : store.routeList.length === 0 ? (
        <div className="route-list__empty">
          <p>暂无工艺路线</p>
          <p className="route-list__empty-hint">点击"+ 新建路线"开始创建</p>
        </div>
      ) : (
        <div className="route-list__table">
          <div className="route-list__table-header">
            <span className="route-list__col-name">路线名称</span>
            <span className="route-list__col-status">状态</span>
            <span className="route-list__col-nodes">节点</span>
            <span className="route-list__col-version">版本</span>
            <span className="route-list__col-date">更新日期</span>
            <span className="route-list__col-actions">操作</span>
          </div>
          {store.routeList.map((route) => (
            <div key={route.id} className="route-list__table-row">
              <span className="route-list__col-name">{route.name}</span>
              <span className="route-list__col-status">
                <span className={`status-badge status-badge--${route.status}`}>
                  {statusLabel(route.status)}
                </span>
              </span>
              <span className="route-list__col-nodes">{route.nodeCount}</span>
              <span className="route-list__col-version">{route.version}</span>
              <span className="route-list__col-date">
                {formatDate(route.updatedAt)}
              </span>
              <span className="route-list__col-actions">
                {route.status === "published" || route.status === "archived" ? (
                  <button
                    className="route-list__action-link"
                    onClick={() => handleEdit(route.id)}
                  >
                    查看
                  </button>
                ) : (
                  <>
                    <button
                      className="route-list__action-link"
                      onClick={() => handleEdit(route.id)}
                    >
                      编辑
                    </button>
                    <button
                      className="route-list__action-link route-list__action-link--danger"
                      onClick={() => handleDelete(route.id, route.name)}
                    >
                      删除
                    </button>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "草稿",
    pending: "待审核",
    published: "已发布",
    archived: "已归档",
  };
  return map[status] || status;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return dateStr.slice(0, 10);
}
