/// <reference types="vite/client" />

import type { ElectronAPI } from './src/lib/types/route'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
