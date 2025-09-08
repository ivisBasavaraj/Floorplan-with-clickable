import { create } from 'zustand';
import type { AuthState, User } from '../types/users';
import { authAPI } from '../services/api';

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: { username: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  checkBackendConnection: () => Promise<boolean>;
}

// Default permissions based on role
const getDefaultPermissions = (role: string) => {
  if (role === 'admin') {
    return {
      floorPlans: { create: true, read: true, update: true, delete: true },
      booths: { create: true, read: true, update: true, delete: true },
      users: { create: true, read: true, update: true, delete: true },
      settings: { create: true, read: true, update: true, delete: true },
      reports: { create: true, read: true, update: true, delete: true }
    };
  } else {
    return {
      floorPlans: { create: false, read: true, update: false, delete: false },
      booths: { create: false, read: true, update: false, delete: false },
      users: { create: false, read: true, update: false, delete: false },
      settings: { create: false, read: true, update: false, delete: false },
      reports: { create: false, read: true, update: false, delete: false }
    };
  }
};

// Convert backend user data to frontend User type
const convertBackendUser = (backendUser: any): User => {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.username,
    role: backendUser.role,
    permissions: getDefaultPermissions(backendUser.role),
    twoFactorEnabled: false,
    createdAt: backendUser.created_at || new Date().toISOString(),
    updatedAt: backendUser.last_login || new Date().toISOString()
  };
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await authAPI.login({ username, password });
      
      if (result.success && result.data.user) {
        const user = convertBackendUser(result.data.user);
        
        set({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Store in local storage for persistence
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('auth_token', result.data.access_token);
      } else {
        throw new Error(result.data.message || 'Login failed');
      }
      
    } catch (error) {
      set({
        isLoading: false,
        error: (error as Error).message
      });
      throw error; // Re-throw for component handling
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await authAPI.register(userData);
      
      if (result.success && result.data.user) {
        const user = convertBackendUser(result.data.user);
        
        set({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Store in local storage for persistence
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('auth_token', result.data.access_token);
      } else {
        throw new Error(result.data.message || 'Registration failed');
      }
      
    } catch (error) {
      set({
        isLoading: false,
        error: (error as Error).message
      });
      throw error; // Re-throw for component handling
    }
  },
  
  logout: () => {
    authAPI.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    set({
      user: null,
      isAuthenticated: false
    });
  },
  
  setUser: (user) => {
    set({
      user,
      isAuthenticated: true
    });
  },

  checkBackendConnection: async () => {
    try {
      const result = await fetch('http://localhost:5000/health');
      return result.ok;
    } catch {
      return false;
    }
  }
}));

// Initialize auth state from localStorage on load
export const initAuth = async () => {
  const userJson = localStorage.getItem('user');
  const token = localStorage.getItem('auth_token');
  
  if (userJson && token) {
    try {
      const user = JSON.parse(userJson) as User;
      
      // Verify token is still valid
      const result = await authAPI.verifyToken();
      if (result.success) {
        useAuthStore.getState().setUser(user);
      } else {
        // Token is invalid, clear stored data
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      }
    } catch (e) {
      console.error('Failed to parse stored user data', e);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
    }
  }
};