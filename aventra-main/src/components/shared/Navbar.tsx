"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useIsDark } from "@/hooks/isDark";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const authLinks = [
  { href: "/login", label: "Sign in", variant: "ghost" as const },
  { href: "/register", label: "Get started", variant: "primary" as const },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const isDark = useIsDark();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="fixed top-4 z-50 flex w-full justify-center px-3 sm:px-6">
      <nav
        className={cn(
          "flex h-16 w-full items-center justify-between  rounded-2xl px-4 transition-all duration-300 ease-out sm:px-6",
          isScrolled
            ? " border border-border/70 bg-background/65 shadow-lg shadow-foreground/5 backdrop-blur-xl md:w-[80%]"
            : "border border-transparent bg-transparent md:w-full",
        )}
      >
        <Link href="/" className="flex items-center gap-3">
        {isDark ? (
          <Image
            src="/Aventra-logo-white1.png"
            alt="Aventra logo"
            width={150}
            height={150}
            priority
          />
          ) : (
            <Image
              src="/Aventra-logo.png"
              alt="Aventra logo"
              width={150}
              height={150}
              priority
            />
          )}
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <ThemeToggle />

          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}

          <div className="flex items-center gap-2 border-s border-border/60 ps-4">
            {authLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  item.variant === "primary"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
