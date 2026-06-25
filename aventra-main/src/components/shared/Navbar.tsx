"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { IconMenu2, IconX } from "@tabler/icons-react";

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
  const [isOpen, setIsOpen] = useState(false);

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
    <header className="fixed top-2 md:top-4 z-50 flex w-full justify-center px-2 sm:px-6">
      <nav
        className={cn(
          "flex w-full flex-col justify-center rounded-2xl border transition-all duration-300 ease-out",
          isScrolled
            ? "border-border/70 bg-background/80 shadow-lg shadow-foreground/5 backdrop-blur-xl md:w-[85%]"
            : "border-transparent bg-transparent md:w-full",
          isOpen && "border-border/70 bg-background/95 backdrop-blur-xl"
        )}
      >
        {/* Main Navbar Row */}
        <div className="flex h-14 md:h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Aventra-logo.png"
              alt="Aventra logo"
              width={130}
              height={130}
              priority
              className="block dark:hidden md:w-[150px]"
            />
            <Image
              src="/Aventra-logo-white1.png"
              alt="Aventra logo"
              width={130}
              height={130}
              priority
              className="hidden dark:block md:w-[150px]"
            />
          </Link>

          {/* Desktop Nav */}
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

          {/* Mobile Nav Actions */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle menu"
            >
              {isOpen ? <IconX className="size-5" /> : <IconMenu2 className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="flex flex-col gap-4 border-t border-border/40 px-6 py-5 md:hidden animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col gap-3">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="h-px bg-border/40 w-full" />
            <div className="flex flex-col gap-2">
              {authLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "w-full rounded-xl py-2.5 text-center text-sm font-medium transition-colors",
                    item.variant === "primary"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
