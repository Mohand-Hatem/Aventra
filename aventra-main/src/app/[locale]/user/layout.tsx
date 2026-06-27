import type { ReactNode } from "react";

type UserLayoutProps = {
  children: ReactNode;
};

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {children}
    </section>
  );
}
