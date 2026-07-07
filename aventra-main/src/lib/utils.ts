import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures a URL string has an absolute scheme (https://).
 * If the value is already an absolute URL (starts with http:// or https://)
 * it is returned as-is. Otherwise https:// is prepended.
 * Returns undefined if the input is falsy.
 */
export function ensureAbsoluteUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
