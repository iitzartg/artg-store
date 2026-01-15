import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { user, token, refreshToken } = response.data.data;
        
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });

        // Set default auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },

      register: async (name: string, email: string, password: string) => {
        const response = await api.post('/auth/register', { name, email, password });
        const { user, token, refreshToken } = response.data.data;
        
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        delete api.defaults.headers.common['Authorization'];
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;

        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data.data;
          
          set({
            token,
            refreshToken: newRefreshToken,
          });

          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          get().logout();
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);



