"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../feature/theme-toggle";
import LanguageSwitcher from "../feature/LanguageSwitcher";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/useAuth";
import { UserAvatarMenu } from "./UserAvatarMenu";

export default function Navbar() {
  const t = useTranslations("navbar");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const userInfo = useAuthStore((state) => state.userInfo);
  console.log(userInfo);
  const isLoggedIn = !!userInfo;
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const navLinks = [
    { href: "/", label: t("home") },
    ...(userInfo?.role === "user"
       ?[{ href : "/user/cv-analysis", label : "CV Analysis"}]
    :[]),
     ...(userInfo?.role === "company" 
      ?[{ href : "/company/search", label : "Companyp-Search"}]
    :[]),
    
    { href: "/pricing", label: t("pricing") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ] as const;

  const authLinks = [
    { href: "/login", label: t("signIn"), variant: "ghost" as const },
    { href: "/register", label: t("getStarted"), variant: "primary" as const },
  ] as const;

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
    <header dir="ltr" className="fixed top-2 z-50 flex w-full justify-center px-2 sm:px-6 md:top-4">
      <nav
        className={cn(
          "flex w-full flex-col justify-center rounded-2xl border transition-all duration-300 ease-out",
          isScrolled
            ? "border-border/70 bg-background/80 shadow-lg shadow-foreground/5 backdrop-blur-xl md:w-[85%]"
            : "border-transparent bg-transparent md:w-full",
          isOpen && "border-border/70 bg-background/95 backdrop-blur-xl",
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 md:h-16">
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

          <div className="hidden items-center gap-4 md:flex">
            <LanguageSwitcher />
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
              {isLoggedIn && userInfo ? (
                <UserAvatarMenu
                  user={userInfo}
                  onLogout={() => logout()}
                  isLoggingOut={isLoggingOut}
                />
              ) : (
                authLinks.map((item) => (
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
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t("toggleMenu")}
            >
              {isOpen ? (
                <IconX className="size-5" />
              ) : (
                <IconMenu2 className="size-5" />
              )}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="flex animate-in flex-col gap-4 border-t border-border/40 px-6 py-5 duration-200 fade-in slide-in-from-top-5 md:hidden">
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
            <div className="h-px w-full bg-border/40" />
            <div className="flex flex-col gap-2">
              {isLoggedIn && userInfo ? (
                <UserAvatarMenu
                  user={userInfo}
                  onLogout={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  isLoggingOut={isLoggingOut}
                  size="lg"
                />
              ) : (
                authLinks.map((item) => (
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
                ))
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
