import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { existsSync } from "fs";
import { registerHandlers } from "./handlers";

let mainWindow: BrowserWindow | null = null;

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    title: "兴诚电瓷 IMS",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    const distPath = join(__dirname, "../dist/index.html");
    if (existsSync(distPath)) {
      mainWindow.loadFile(distPath);
    } else {
      console.error("dist/index.html not found. Build the project first.");
    }
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // 注册数据库 IPC handlers
  registerHandlers();

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 保留原有的兼容 IPC
ipcMain.handle("get-platform", () => process.platform);
ipcMain.handle("get-versions", () => ({
  electron: process.versions.electron,
  node: process.versions.node,
  chrome: process.versions.chrome,
}));
