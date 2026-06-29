import type { ReactNode } from "react";

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">{children}</div>
  );
}
