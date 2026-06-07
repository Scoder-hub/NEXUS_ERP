import type { IpcResult } from '../../shared/types/common';

// 类型安全的 IPC 调用封装
export async function ipcInvoke<T = unknown>(channel: string, args?: any): Promise<IpcResult<T>> {
  try {
    const result = await (window as any).ipc.invoke(channel, args);
    return result as IpcResult<T>;
  } catch (error: any) {
    return {
      success: false,
      error: { code: 'IPC_ERROR', message: error.message || 'IPC调用失败' },
    };
  }
}

// IPC 事件监听
export function ipcOn(channel: string, callback: (...args: any[]) => void): () => void {
  return (window as any).ipc.on(channel, callback);
}
