import type { ReactNode } from "react";

export default function CompanyLayout({ children }: { children: ReactNode }) {
  return (
    <section className="flex w-full flex-col bg-canvas px-4 pb-8 pt-20 sm:px-6 md:pt-24">
      {children}
    </section>
  );
}
