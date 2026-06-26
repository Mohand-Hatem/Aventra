/**
 * Folder: src/types
 * File: auth.ts
 * Purpose:
 * - TypeScript types for authentication domain.
 */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: "user" | "company";
}

export interface AuthUser {
  id: string;
  _id: string;
  name: { en: string; ar: string } | string;
  email: string;
  role: "user" | "company" | "admin";
  avatar: string;
  plan: "Free" | "Pro" | "Enterprise";
  maxToken: number;
  tokenUsage: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
  };
}
