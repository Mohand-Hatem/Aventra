/**
 * Folder: src/constants
 * File: routes.ts
 * Purpose:
 * - Central route path definitions for App Router.
 * - Avoids hardcoded path strings across components/middleware.
 *
 * Example (when implementing later):
 * - APP_ROUTES.login = "/login"
 * - APP_ROUTES.userProfile = "/user/profile"
 */


// src/constants/routes.ts
// export const ROUTES = {
//   HOME: "/",
//   LOGIN: "/login",
//   REGISTER: "/register",
//   USER: {
//     PROFILE: "/user/profile",
//     UPLOAD_CV: "/user/upload-cv",
//     REPORTS: "/user/reports",
//   },
//   COMPANY: {
//     PROFILE: "/company/profile",
//     SEARCH: "/company/search",
//   },
// } as const;

// export const ROLE_REDIRECT: Record<string, string> = {
//   user: ROUTES.USER.PROFILE,
//   company: ROUTES.COMPANY.PROFILE,
//   admin: ROUTES.HOME,
// };


export const APP_ROUTES = {
  home: "/",
  login: "/auth/login",
   googleAuth: "/auth/google",
  register: "/register",
  forgotPassword: "/forgot-password",
  verifyOtp: "/verify-otp",
  resetPassword: "/reset-password",
  userDashboard: "/user",
  companyDashboard: "/company",
  pricing: "/pricing",
} as const;