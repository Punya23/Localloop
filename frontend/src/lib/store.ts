import { create } from 'zustand';
import { api } from './api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  gender?: string;
  city?: string;
  preferredArea?: string;
  moveMonth?: string;
  budgetMin?: number;
  budgetMax?: number;
  isWomenMode?: boolean;
  isOnboarded?: boolean;
  isMentor?: boolean;
  reputation?: {
    points: number;
    level: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const response = await api.login({ email, password });
    api.setToken(response.token);
    set({ user: response.user, isAuthenticated: true });
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.register({ name, email, password });
    api.setToken(response.token);
    set({ user: response.user, isAuthenticated: true });
  },

  logout: () => {
    api.clearToken();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('localloop_token') : null;
      if (!token) {
        set({ isLoading: false });
        return;
      }
      api.setToken(token);
      const user = await api.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      api.clearToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (userData: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },
}));
