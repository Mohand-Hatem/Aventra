// store/auth.store.ts
import { AuthUser } from '@/types/auth'
import { AuthState } from '@/types/zustand'
import { create } from 'zustand'



export const useAuthStore = create<AuthState>((set) => ({
  userInfo: null,
  setUserInfo: (userInfo: AuthUser) => set({ userInfo }),
  clearAuth: () => set({ userInfo: null }),
}))