const AUTH_DEBUG = process.env.NODE_ENV === "development";

export function logAuth(scope: string, message: string, data?: unknown) {
  if (!AUTH_DEBUG) return;
  if (data !== undefined) {
    console.log(`[auth:${scope}]`, message, data);
  } else {
    console.log(`[auth:${scope}]`, message);
  }
}

export function logAuthError(scope: string, message: string, data?: unknown) {
  if (!AUTH_DEBUG) return;
  if (data !== undefined) {
    console.error(`[auth:${scope}]`, message, data);
  } else {
    console.error(`[auth:${scope}]`, message);
  }
}

export function logAuthWarn(scope: string, message: string, data?: unknown) {
  if (!AUTH_DEBUG) return;
  if (data !== undefined) {
    console.warn(`[auth:${scope}]`, message, data);
  } else {
    console.warn(`[auth:${scope}]`, message);
  }
}
