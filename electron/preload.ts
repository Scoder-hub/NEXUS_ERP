import { contextBridge, ipcRenderer } from "electron";

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
  PROCESS_LIBRARY_CREATE: "process-library:create",
  PROCESS_LIBRARY_UPDATE: "process-library:update",
  PROCESS_LIBRARY_TOGGLE_ACTIVE: "process-library:toggle-active",
  PROCESS_LIBRARY_DELETE: "process-library:delete",
};

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  },
  getPlatform: () => ipcRenderer.invoke("get-platform"),
  getVersions: () => ipcRenderer.invoke("get-versions"),

  // 工序库 API
  processLibrary: {
    getAll: () => ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_GET_ALL),
    getByCategory: (category: string) =>
      ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_GET_BY_CATEGORY, category),
    search: (query: string) =>
      ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_SEARCH, query),
    create: (data: any) =>
      ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_CREATE, data),
    update: (data: any) =>
      ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_UPDATE, data),
    toggleActive: (id: number, isActive: boolean) =>
      ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_TOGGLE_ACTIVE, id, isActive),
    delete: (id: number) =>
      ipcRenderer.invoke(CHANNELS.PROCESS_LIBRARY_DELETE, id),
  },

  // 路线 API
  route: {
    list: (params: any) => ipcRenderer.invoke(CHANNELS.ROUTE_LIST, params),
    getById: (id: number) => ipcRenderer.invoke(CHANNELS.ROUTE_GET_BY_ID, id),
    create: (data: { name: string }) =>
      ipcRenderer.invoke(CHANNELS.ROUTE_CREATE, data),
    save: (id: number, data: any) =>
      ipcRenderer.invoke(CHANNELS.ROUTE_SAVE, id, data),
    publish: (id: number) => ipcRenderer.invoke(CHANNELS.ROUTE_PUBLISH, id),
    delete: (id: number) => ipcRenderer.invoke(CHANNELS.ROUTE_DELETE, id),
    newVersion: (id: number) =>
      ipcRenderer.invoke(CHANNELS.ROUTE_NEW_VERSION, id),
    getHistory: (routeId: number) =>
      ipcRenderer.invoke(CHANNELS.ROUTE_GET_HISTORY, routeId),
    getHistoryDetail: (historyId: number) =>
      ipcRenderer.invoke(CHANNELS.ROUTE_GET_HISTORY_DETAIL, historyId),
    rollback: (routeId: number, historyId: number, changeDescription: string) =>
      ipcRenderer.invoke(
        CHANNELS.ROUTE_ROLLBACK,
        routeId,
        historyId,
        changeDescription,
      ),
  },
});
