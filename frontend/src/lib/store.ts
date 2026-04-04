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
  isVerified?: boolean;
  verificationStatus?: string;
  idProofType?: string;
  idProofUrl?: string;
  verificationNotes?: string;
  verifiedAt?: string;
  reputation?: {
    points: number;
    level: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  welcomeMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearWelcomeMessage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  welcomeMessage: null,

  login: async (email: string, password: string) => {
    const response = await api.login({ email, password });
    api.setToken(response.token);
    set({ user: response.user, isAuthenticated: true });
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.register({ name, email, password });
    api.setToken(response.token);
    set({
      user: response.user,
      isAuthenticated: true,
      welcomeMessage: response.welcomeMessage || null,
    });
  },

  logout: () => {
    api.clearToken();
    set({ user: null, isAuthenticated: false, welcomeMessage: null });
    // Redirect to landing page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  checkAuth: async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('localloop_token') : null;
      if (!token) {
        set({ isLoading: false, user: null, isAuthenticated: false });
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

  clearWelcomeMessage: () => {
    set({ welcomeMessage: null });
  },
}));
