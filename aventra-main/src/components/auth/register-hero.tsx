"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function RegisterHero() {
  const t = useTranslations("register.hero");

  return (
    <div className="relative hidden lg:flex lg:w-[46%] flex-col overflow-hidden bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-primary-foreground/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl"
      />

      <div className="relative z-10 flex h-full w-full flex-col justify-between pt-10">
        <div className="mt-3 flex h-[15%] flex-col justify-end px-10">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-primary dark:text-sky">
            {t("badge")}
          </p>
          <span className="lg:text-2xl sm:text-lg text-base font-bold leading-snug">
            {t("candidateLine")}
          </span>
          <span className="lg:text-2xl sm:text-lg text-base mt-2 font-bold leading-snug">
            {t("companyLine")}
          </span>
        </div>

        <div className="flex h-[80%] w-full flex-col">
          <div className="relative h-full shadow-card">
            <div className="relative h-full overflow-hidden dark:mask-[linear-gradient(to_bottom,transparent_0%,black_24%)] dark:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_24%)]">
              <Image
                src="/register-light.png"
                alt={t("alt")}
                fill
                priority
                quality={100}
                sizes="100vw"
                className=" object-cover dark:hidden"
              />
              <Image
                src="/register-dark.png"
                alt={t("alt")}
                fill
                priority
                quality={100}
                sizes="100vw"
                className="hidden object-cover dark:block"
              />

              <div
                className="absolute bottom-0 left-0 right-0 px-10 pt-16 pb-6"
                style={{
                  background:
                    "linear-gradient(to top,var(--canvas) 55%, transparent 100%)",
                }}
              >
                <p className="mb-2 text-base font-bold text-sky">{t("cardTitle")}</p>
                <p className="max-w-70 text-[0.78rem] leading-relaxed">
                  {t("cardDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
