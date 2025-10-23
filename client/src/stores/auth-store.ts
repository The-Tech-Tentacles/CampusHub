import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI, api, type User as ApiUser, type LoginRequest, type RegisterRequest } from "@/services/api";

export type UserRole = "STUDENT" | "FACULTY" | "HOD" | "DEAN" | "ADMIN";

// Enhanced User interface matching API response
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Enhanced fields from normalized schema
  departmentId?: string;
  departmentCode?: string;
  department?: string; // Backward compatibility
  academicYearId?: string;
  academicYearCode?: string;
  academicLevel?: string;
  year?: string; // Backward compatibility
  enrollmentNumber?: string;
  employeeId?: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  // Utility
  getRoleDashboardPath: () => string;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false, // Always start as false, let initializeAuth determine this
      isLoading: false,
      isInitializing: true, // Always start as true until initialization completes
      error: null,

      /**
       * User login with backend API
       */
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.login(credentials);

          if (response.success && response.data) {
            const { user, tokens } = response.data;

            // Store tokens in API client
            api.setTokens(tokens);

            // Update auth state
            set({
              user: user as User,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            return true;
          } else {
            set({
              error: response.message || 'Login failed',
              isLoading: false
            });
            return false;
          }
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false
          });
          return false;
        }
      },

      /**
       * User registration with backend API
       */
      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.register(userData);

          if (response.success && response.data) {
            const { user, tokens } = response.data;

            // Store tokens in API client
            api.setTokens(tokens);

            // Update auth state
            set({
              user: user as User,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            return true;
          } else {
            set({
              error: response.message || 'Registration failed',
              isLoading: false
            });
            return false;
          }
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false
          });
          return false;
        }
      },

      /**
       * User logout
       */
      logout: async () => {
        set({ isLoading: true });

        try {
          await authAPI.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error);
        }

        // Clear tokens and state regardless of API response
        api.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      },

      /**
       * Update user profile
       */
      updateUser: async (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.updateProfile(updates);

          if (response.success && response.data) {
            set({
              user: response.data as User,
              isLoading: false,
              error: null
            });
          } else {
            set({
              error: response.message || 'Update failed',
              isLoading: false
            });
          }
        } catch (error: any) {
          set({
            error: error.message || 'Update failed',
            isLoading: false
          });
        }
      },

      /**
       * Clear error state
       */
      clearError: () => set({ error: null }),

      /**
       * Get role-based dashboard path
       */
      getRoleDashboardPath: () => {
        const user = get().user;
        if (!user) return '/login';

        switch (user.role) {
          case 'STUDENT': return '/student/dashboard';
          case 'FACULTY': return '/faculty';
          case 'HOD': return '/faculty'; // HOD uses faculty interface
          case 'DEAN': return '/dean';
          case 'ADMIN': return '/admin';
          default: return '/student/dashboard';
        }
      },

      /**
       * Initialize authentication on app start
       */
      initializeAuth: async () => {
        const accessToken = localStorage.getItem('accessToken');


        if (!accessToken) {

          set({
            user: null,
            isAuthenticated: false,
            isInitializing: false,
            error: null
          });
          return;
        }


        // Set initializing state while validating token
        set({ isInitializing: true });

        try {

          // Add a timeout to prevent hanging
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('API call timeout')), 5000);
          });

          const response = await Promise.race([
            authAPI.getProfile(),
            timeoutPromise
          ]);



          if (response.success && response.data) {
            // Handle nested user object structure from API response
            const userData = (response.data as any).user || response.data;


            set({
              user: userData as User,
              isAuthenticated: true,
              isInitializing: false,
              error: null
            });
          } else {
            // Token is invalid, clear everything
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            api.clearTokens();
            set({
              user: null,
              isAuthenticated: false,
              isInitializing: false,
              error: null
            });
          }
        } catch (error) {
          // API call failed, clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          api.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isInitializing: false,
            error: null
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        // Don't persist isAuthenticated - it should be determined by token validation
      }),
    }
  )
);
