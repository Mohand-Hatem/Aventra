
export interface LoginRequest {
  email: string;
  password: string;
}
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "company" | "admin";

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