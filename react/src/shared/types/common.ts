// IPC 通用响应类型
export interface IpcResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// 分页请求
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 排序参数
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}
