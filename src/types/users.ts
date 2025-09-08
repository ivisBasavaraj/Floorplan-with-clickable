export type UserRole = 'admin' | 'manager' | 'exhibitor' | 'viewer';

export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface PermissionSet {
  floorPlans: Permission;
  booths: Permission;
  users: Permission;
  settings: Permission;
  reports: Permission;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: PermissionSet;
  twoFactorEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}