
export type LocalizedName = {
  en: string;
  ar: string;
};

export function getUserDisplayName(
  name: string | LocalizedName,
  locale: string,
): string {
  if (typeof name === "string") return name;
  return name[locale as keyof LocalizedName] ?? name.en ?? name.ar ?? "";
}

export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface AuthUser {
    id: string;
    name: string | LocalizedName;
    email: string;
    role: "user" | "company" | "admin" ;
  
    avatar?: string | null;
    plan?: string;
    maxToken?: number;
    tokenUsage?: number;
    googleId?: string | null;
  
    cvs?: unknown[];
  
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
      user: AuthUser;
    };
  }
  
  
  export interface ForgotPasswordRequest {
    email: string;
  }
  
  export interface ForgotPasswordResponse {
    message: string;
  }
  
  export interface VerifyOtpRequest {
    email: string;
    otp: string;
  }
  
  export interface VerifyOtpResponse {
    success: boolean;
    message: string;
  }
  
  export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
  }
  
  export interface ResetPasswordResponse {
    message: string;
  }
  
  export interface MeResponse {
    success: boolean;
    data: {
      user: AuthUser;
    };
  }



export type RegisterRole = "user" | "company";
export type RegisterPayload = {
  name: {
    en: string;
    ar: string;
  };
  email: string;
  password: string;
  role: RegisterRole;
};

export type RegisterResponse = {
  message?: string;
  user?: {
    id?: string;
    email?: string;
    role?: RegisterRole;
  };
  token?: string;
};

export type GoogleAuthIntent = "login" | "register";