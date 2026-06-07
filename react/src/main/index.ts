import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initDatabase } from '../db';
import { registerIpcHandlers } from './ipc';

// 开发环境注入 React DevTools
const installExtension =
  import.meta.env.DEV
    ? import('electron-devtools-installer').then((m) => m.default)
    : null;

let mainWindow: BrowserWindow | null = null;

// 修复部分 macOS 环境下 GPU sandbox 崩溃问题
app.commandLine.appendSwitch('disable-gpu-sandbox');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    show: false,
    title: 'Porcelain ERP',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // better-sqlite3 需要
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // 禁止导航到外部 URL
  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  // 开发环境安装 React DevTools
  if (installExtension) {
    try {
      const install = await installExtension;
      const REACT_DEVELOPER_TOOLS = 'fmkadmapgofadopljbjfkapdkoienihi';
      await install(REACT_DEVELOPER_TOOLS);
      console.log('[DevTools] React Developer Tools 已加载');
    } catch (err) {
      console.warn('[DevTools] React Developer Tools 加载失败:', err);
    }
  }

  // 初始化数据库
  const dbPath = path.join(app.getPath('userData'), 'porcelain-erp.db');
  initDatabase(dbPath);

  // 注册 IPC handlers
  registerIpcHandlers();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
