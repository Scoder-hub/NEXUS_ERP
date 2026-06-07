import { useState, useCallback } from 'react';
import { ipcInvoke } from '../lib/ipc';
import type { IpcResult } from '../../shared/types/common';

export function useIpc<T = unknown>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invoke = useCallback(async (channel: string, args?: any): Promise<IpcResult<T>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await ipcInvoke<T>(channel, args);
      if (!result.success && result.error) {
        setError(result.error.message);
      }
      return result;
    } catch (err: any) {
      const message = err.message || '请求失败';
      setError(message);
      return { success: false, error: { code: 'UNKNOWN', message } };
    } finally {
      setLoading(false);
    }
  }, []);

  return { invoke, loading, error, clearError: () => setError(null) };
}
