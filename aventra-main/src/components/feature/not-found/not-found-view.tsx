"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconArrowLeft, IconHome, IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/routes";

function NotFoundIllustration() {
  return (
    <div
      className="relative mx-auto flex h-40 w-full max-w-sm items-center justify-center sm:h-56 sm:max-w-md"
      role="img"
      aria-label="404 illustration with an AI search radar"
    >
      <span className="font-heading select-none text-8xl font-extrabold text-primary dark:text-sky sm:text-9xl">
        4
      </span>

      <span className="relative mx-2 flex size-20 shrink-0 items-center justify-center sm:size-28">
        <span className="absolute inset-0 rounded-full border-2 border-primary/30 dark:border-sky/30" />

        <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary/40 dark:border-sky/40" />

        <span className="relative flex size-full items-center justify-center rounded-full bg-primary shadow-card dark:bg-sky">
          <IconSearch
            className="size-8 text-primary-foreground dark:text-slate-950 sm:size-10"
            strokeWidth={2.25}
          />
        </span>
      </span>

      <span className="font-heading select-none text-8xl font-extrabold text-primary dark:text-sky sm:text-9xl">
        4
      </span>

      <span className="absolute top-2 left-0 h-1.5 w-8 -rotate-12 rounded-full bg-primary/50 dark:bg-sky/50 sm:left-6" />

      <span className="absolute right-0 bottom-2 h-1.5 w-8 rotate-12 rounded-full bg-primary/40 dark:bg-sky/40 sm:right-6" />

      <span className="absolute top-6 right-10 size-2 rounded-full bg-primary/50 dark:bg-sky/50 sm:right-16" />

      <span className="absolute bottom-8 left-10 size-2 rounded-full bg-primary/60 dark:bg-sky/60 sm:left-16" />
    </div>
  );
}

export function NotFoundView() {
  const router = useRouter();
  const t = useTranslations("notFound");

  return (
    <section
      className="
        relative flex min-h-[calc(100vh-4rem)] flex-1 items-center
        justify-center overflow-hidden
        bg-canvas
        px-4 py-16
        sm:px-6
        lg:px-8
      "
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 blur-3xl dark:bg-sky/20"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-32 size-96 rounded-full bg-primary/10 blur-3xl dark:bg-sky/10"
      />

      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <NotFoundIllustration />

        <div className="flex flex-col gap-4">
          <h1
            id="not-found-heading"
            className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
          >
            {t("title")}
          </h1>

          <p className="mx-auto max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("description")}
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="
              w-full rounded-xl px-6 text-sm
              sm:w-auto
              dark:bg-sky
              dark:text-slate-950
              dark:hover:bg-sky/90
            "
          >
            <Link href={APP_ROUTES.home}>
              <IconHome className="size-4" />
              {t("backHome")}
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="
              w-full rounded-xl px-6 text-sm
              sm:w-auto
              dark:border-sky/40
              dark:hover:bg-sky/10
            "
            onClick={() => router.back()}
          >
            <IconArrowLeft className="size-4 rtl:rotate-180" />
            {t("goBack")}
          </Button>
        </div>

        <span className="pt-2 text-xs uppercase tracking-widest text-muted-foreground/70">
          {t("errorCode")}
        </span>
      </div>
    </section>
  );
}
