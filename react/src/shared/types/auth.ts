export type LangCode = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'de-DE' | 'fr-FR';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  dept: string;
  status: 'active' | 'locked' | 'disabled';
  joinDate: string;
  lastLogin: string;
}

export interface Permission {
  id: number;
  resource: string;
  action: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: Permission[];
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  user: User;
  permissions: Permission[];
  token?: string;
}

export interface UnlockRequest {
  pin?: string;
  password?: string;
}
