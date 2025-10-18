import { create } from "zustand";

export type UserRole = "STUDENT" | "FACULTY" | "HOD" | "DEAN" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  year?: string; // For students: "1st Year", "2nd Year", etc.
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user: User, token: string) =>
    set({ user, token, isAuthenticated: true }),
  logout: () =>
    set({ user: null, token: null, isAuthenticated: false }),
  updateUser: (updates: Partial<User>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));
