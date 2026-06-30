import type { ReactNode } from "react";

type UserLayoutProps = {
  children: ReactNode;
};

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <section className="flex min-h-screen w-full flex-col bg-canvas px-4 py-8 sm:px-6 lg:pt-20">
      {children}
    </section>
  );
}
