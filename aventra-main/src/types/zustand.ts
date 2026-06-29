import { AuthUser } from "./auth"

export interface AuthState {
    userInfo: AuthUser | null
    setUserInfo: (userInfo: AuthUser) => void
    clearAuth: () => void
  }