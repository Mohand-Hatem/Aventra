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