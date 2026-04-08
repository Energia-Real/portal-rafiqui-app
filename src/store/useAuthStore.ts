import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole, User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  token: string | null;
  setUserRole: (role: UserRole) => void;
  login: (user: User) => void;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userRole: 'GUEST',
      isAuthenticated: false,
      token: null,

      setUserRole: (role: UserRole) => {
        set({ userRole: role, user: null, isAuthenticated: false, token: null });
      },

      login: (user: User) => {
        set({ user, userRole: user.role, isAuthenticated: true });
      },

      loginAdmin: async (email: string, password: string) => {
        const result = await authApi.login(email, password);

        if (result.error || !result.data) {
          return { success: false, error: result.error ?? 'Error al iniciar sesión' };
        }

        const { access_token, user } = result.data;

        set({
          token: access_token,
          userRole: user.role,
          isAuthenticated: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });

        return { success: true };
      },

      logout: () => {
        set({ user: null, userRole: 'GUEST', isAuthenticated: false, token: null });
      },
    }),
    { name: 'rafiqui-auth' }
  )
);
