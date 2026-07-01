import type { ReactNode } from "react";

export default function CompanyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
      {children}
    </div>
  );
}