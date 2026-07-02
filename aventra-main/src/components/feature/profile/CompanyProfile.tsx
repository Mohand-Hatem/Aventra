"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  IconCamera,
  IconMail,
  IconSearch,
  IconStar,
  IconUsers,
} from "@tabler/icons-react";
import { useUser } from "@/hooks/useAuth";
import { useCompanySearchHistory } from "@/hooks/useCompanySearchHistory";
import { useUpdateUserProfile } from "@/hooks/useProfile";
import { PLANS } from "@/constants/plans";
import { getUserDisplayName, normalizeLocalizedName } from "@/types/auth";
import {
  createUpdateProfileSchema,
  type UpdateProfileFormValues,
  type UpdateProfilePayload,
} from "@/schemas/profile";
import type { CandidateResult, SearchHistoryEntry } from "@/types/company";
import ResultsTable from "@/components/feature/company-search/ResultsTable";
import CandidateDetail from "@/components/feature/company-search/CandidateDetail";
import { ProfilePageSkeleton } from "@/components/feature/profile/ProfilePageSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScaleLoader } from "@/components/shared/scale-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }

  return trimmed.charAt(0).toUpperCase();
}

function formatDate(value: string | undefined, locale: string) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(date);
}

function inputClassName(hasError?: boolean) {
  return cn(
    "h-10 w-full rounded-xl border bg-background px-4 text-sm outline-none transition-all",
    "placeholder:text-muted-foreground/50",
    "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
    "dark:focus-visible:border-sky dark:focus-visible:ring-sky/20",
    hasError ? "border-destructive" : "border-border",
  );
}

function StatBox({
  label,
  value,
  labelClassName,
}: {
  label: string;
  value: string;
  labelClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/60 p-3 text-center dark:border-border/30">
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wide",
          labelClassName ?? "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tracking-tight">{value}</p>
    </div>
  );
}

function CompanySummaryPanel({
  displayName,
  email,
  avatarSrc,
  initials,
  roleLabel,
  planLabel,
  tokenUsage,
  maxToken,
  tokenPercent,
  searchCount,
  candidatesFound,
  locale,
  t,
}: {
  displayName: string;
  email: string;
  avatarSrc?: string;
  initials: string;
  roleLabel: string;
  planLabel: string;
  tokenUsage: number;
  maxToken: number;
  tokenPercent: number;
  searchCount: number;
  candidatesFound: number;
  locale: string;
  t: ReturnType<typeof useTranslations<"companyProfile">>;
}) {
  return (
    <Card className="overflow-hidden border-border/60 shadow-card dark:border-border/40">
      <CardContent className="p-5">
        <div className="flex flex-col items-center text-center">
          <Avatar className="size-50 ring-4 ring-primary/10 dark:ring-sky/10">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : null}
            <AvatarFallback className="bg-primary text-2xl font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h2 className="mt-4 font-heading text-xl font-bold tracking-tight">{displayName}</h2>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <IconMail className="size-3.5 shrink-0" />
            <span className="truncate">{email}</span>
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge className="gap-1 bg-primary/15 text-primary hover:bg-primary/20 dark:bg-sky/15 dark:text-sky">
              <IconStar className="size-3.5" />
              {planLabel}
            </Badge>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <StatBox
            label={t("tokens")}
            value={tokenUsage.toLocaleString(locale)}
            labelClassName="text-primary dark:text-sky"
          />
          <StatBox
            label={t("maxTokens")}
            value={maxToken > 0 ? maxToken.toLocaleString(locale) : "—"}
            labelClassName="text-violet-600 dark:text-violet-400"
          />
          <StatBox
            label={t("searchCount")}
            value={String(searchCount)}
            labelClassName="text-amber-600 dark:text-amber-400"
          />
          <StatBox
            label={t("candidatesFound")}
            value={String(candidatesFound)}
            labelClassName="text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {maxToken > 0 ? (
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{t("tokenProgress")}</span>
                <span className="text-muted-foreground">{tokenPercent}%</span>
              </div>
              <div className="relative">
                <Progress value={tokenPercent} className="h-3 bg-muted/60" />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-primary-foreground mix-blend-difference">
                  {tokenPercent}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{t("plan")}</span>
                <span className="text-muted-foreground">{planLabel}</span>
              </div>
              <Progress
                value={maxToken > 0 ? tokenPercent : 0}
                className="h-3 bg-muted/60 [&>div]:bg-violet-500 dark:[&>div]:bg-violet-400"
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SearchHistoryItem({
  entry,
  isSelected,
  locale,
  t,
  onSelect,
}: {
  entry: SearchHistoryEntry;
  isSelected: boolean;
  locale: string;
  t: ReturnType<typeof useTranslations<"companyProfile">>;
  onSelect: () => void;
}) {
  const formattedDate = formatDate(entry.createdAt, locale);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border px-4 py-3 text-left transition-colors",
        isSelected
          ? "border-primary/40 bg-primary/5 dark:border-sky/40 dark:bg-sky/5"
          : "border-border/60 bg-background/60 hover:bg-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium text-foreground">{entry.query}</p>
          {formattedDate ? (
            <p className="mt-1 text-xs text-muted-foreground">{formattedDate}</p>
          ) : null}
        </div>
        <Badge variant="secondary" className="shrink-0">
          {entry.total || entry.candidates.length} {t("results")}
        </Badge>
      </div>
    </button>
  );
}

export function CompanyProfile() {
  const t = useTranslations("companyProfile");
  const tProfile = useTranslations("profile");
  const tRegister = useTranslations("register");
  const tNavbar = useTranslations("navbar");
  const locale = useLocale();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);

  const { data: user, isLoading, isFetching, isError } = useUser();
  const { data: searchHistoryData, isLoading: isHistoryLoading } =
    useCompanySearchHistory();
  const { mutate: updateProfile, isPending, uploadProgress } =
    useUpdateUserProfile();

  const searches = searchHistoryData?.searches ?? [];
  const searchCount = user?.searchCount ?? searchHistoryData?.totalSearches ?? 0;

  const profileSchema = useMemo(
    () =>
      createUpdateProfileSchema({
        nameMin: tProfile("validation.nameMin"),
        avatarType: tProfile("validation.avatarType"),
        avatarSize: tProfile("validation.avatarSize"),
      }),
    [tProfile],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: { en: "", ar: "" },
    },
  });

  const selectedAvatar = watch("avatar");
  const watchedName = watch("name");
  const displayName = user ? getUserDisplayName(user.name, locale) : "";
  const currentName = user ? normalizeLocalizedName(user.name) : { en: "", ar: "" };

  useEffect(() => {
    if (!user) return;
    reset({ name: normalizeLocalizedName(user.name), avatar: undefined });
    setAvatarPreview(null);
  }, [user, reset]);

  useEffect(() => {
    if (!selectedAvatar) {
      setAvatarPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedAvatar);
    setAvatarPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedAvatar]);

  useEffect(() => {
    if (searches.length === 0) {
      setSelectedHistoryId(null);
      setSelectedCandidate(null);
      return;
    }

    setSelectedHistoryId((current) => {
      if (current && searches.some((entry) => entry.id === current)) {
        return current;
      }
      return searches[0].id;
    });
  }, [searches]);

  const selectedHistory = useMemo(
    () => searches.find((entry) => entry.id === selectedHistoryId) ?? null,
    [searches, selectedHistoryId],
  );

  const historyCandidates = selectedHistory?.candidates ?? [];

  useEffect(() => {
    if (historyCandidates.length === 0) {
      setSelectedCandidate(null);
      return;
    }

    setSelectedCandidate((current) => {
      if (current && historyCandidates.some((candidate) => candidate.cvId === current.cvId)) {
        return current;
      }
      return historyCandidates[0];
    });
  }, [historyCandidates]);

  const candidatesFound = useMemo(
    () => searches.reduce((sum, entry) => sum + (entry.total || entry.candidates.length), 0),
    [searches],
  );

  const tokenUsage = user?.tokenUsage ?? 0;
  const maxToken = user?.maxToken ?? 0;
  const tokenPercent =
    maxToken > 0 ? Math.min(100, Math.round((tokenUsage / maxToken) * 100)) : 0;

  const planKey = user?.plan?.toLowerCase();
  const planLabel =
    planKey && Object.keys(PLANS).includes(planKey as keyof typeof PLANS)
      ? tNavbar(`plans.${planKey as keyof typeof PLANS}`)
      : user?.plan
        ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
        : tProfile("noPlan");

  const submitProfileUpdate = (
    values: UpdateProfileFormValues,
    fields: Array<"name" | "avatar">,
  ) => {
    if (!user) return;

    const payload: UpdateProfilePayload = {};

    if (fields.includes("name")) {
      const nextName = {
        en: values.name.en.trim(),
        ar: values.name.ar.trim(),
      };

      if (
        nextName.en !== currentName.en.trim() ||
        nextName.ar !== currentName.ar.trim()
      ) {
        payload.name = nextName;
      }
    }

    if (fields.includes("avatar") && values.avatar) {
      payload.avatar = values.avatar;
    }

    if (!payload.name && !payload.avatar) return;

    updateProfile(payload, {
      onSuccess: () => {
        reset({
          name: payload.name ?? values.name,
          avatar: undefined,
        });
        setAvatarPreview(null);
        if (avatarInputRef.current) {
          avatarInputRef.current.value = "";
        }
      },
    });
  };

  if (isLoading && !user) {
    return <ProfilePageSkeleton />;
  }

  if ((isError && !user) || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Card className="w-full max-w-md shadow-card dark:shadow-none">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{tProfile("loadError")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const avatarSrc = avatarPreview ?? user.avatar ?? undefined;
  const initials = getInitials(displayName);
  const nameChanged =
    watchedName.en.trim() !== currentName.en.trim() ||
    watchedName.ar.trim() !== currentName.ar.trim();
  const hasAvatarChange = !!selectedAvatar;
  const isRefreshing = isFetching && !!user;

  return (
    <div
      className={cn(
        "relative mx-auto mt-10 flex w-full max-w-[1550px] flex-col gap-6 lg:flex-row lg:items-start",
        isRefreshing && "opacity-90",
      )}
    >
      {isRefreshing ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full animate-pulse bg-primary dark:bg-sky" />
        </div>
      ) : null}

      <aside className="order-first w-full shrink-0 lg:sticky lg:top-25 lg:order-last lg:w-80">
        <CompanySummaryPanel
          displayName={displayName}
          email={user.email}
          avatarSrc={avatarSrc}
          initials={initials}
          roleLabel={tNavbar(`roles.${user.role}`)}
          planLabel={planLabel}
          tokenUsage={tokenUsage}
          maxToken={maxToken}
          tokenPercent={tokenPercent}
          searchCount={searchCount}
          candidatesFound={candidatesFound}
          locale={locale}
          t={t}
        />
      </aside>

      <div className="order-last min-w-0 flex-1 space-y-6 lg:order-first">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
          <Card className="border-border/60 shadow-card dark:border-border/40">
            <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
              <CardTitle className="text-base">{t("searchHistory")}</CardTitle>
              <CardDescription className="text-xs">{t("searchHistoryHint")}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-4 pb-4">
              {isHistoryLoading ? (
                <div className="flex items-center justify-center py-10">
                  <ScaleLoader size="md" className="text-muted-foreground" />
                </div>
              ) : searches.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
                  <IconSearch className="size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">{t("noSearchesYet")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("noSearchesHint")}</p>
                  <Button asChild className="mt-4 rounded-xl">
                    <Link href="/company/search">{t("goToSearch")}</Link>
                  </Button>
                </div>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {searches.map((entry) => (
                    <li key={entry.id}>
                      <SearchHistoryItem
                        entry={entry}
                        isSelected={selectedHistoryId === entry.id}
                        locale={locale}
                        t={t}
                        onSelect={() => setSelectedHistoryId(entry.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="flex min-h-[420px] flex-col gap-4">
            <div className="min-h-[280px] flex-1 overflow-hidden">
              <ResultsTable
                candidates={historyCandidates}
                selectedCandidate={selectedCandidate}
                onSelectCandidate={setSelectedCandidate}
                isPending={false}
              />
            </div>

            {selectedCandidate ? (
              <div className="h-[min(360px,40dvh)] shrink-0 overflow-hidden lg:h-[340px]">
                <CandidateDetail candidate={selectedCandidate} />
              </div>
            ) : searches.length > 0 ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/60 px-6 text-center">
                <div>
                  <IconUsers className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">{t("selectSearchHint")}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {tProfile("accountSettings")}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-border/60 shadow-card dark:border-border/40">
              <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
                <CardTitle className="text-base">{tProfile("changePhoto")}</CardTitle>
                <CardDescription className="text-xs">{tProfile("photoHint")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-40 ring-2 ring-background">
                    {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : null}
                    <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{tProfile("photoHint")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <IconCamera />
                    {tProfile("choosePhoto")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isPending || !hasAvatarChange}
                    className="rounded-xl"
                    onClick={handleSubmit((values) =>
                      submitProfileUpdate(values, ["avatar"]),
                    )}
                  >
                    {isPending ? (
                      <>
                        <ScaleLoader size="sm" />
                        {tProfile("saving")}
                      </>
                    ) : (
                      tProfile("savePhoto")
                    )}
                  </Button>
                </div>
                {isPending && uploadProgress !== null ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {uploadProgress < 100
                          ? tProfile("uploadingPhoto")
                          : tProfile("processingPhoto")}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress
                      value={uploadProgress}
                      className="h-2 bg-muted/60 [&>div]:bg-primary dark:[&>div]:bg-sky"
                    />
                  </div>
                ) : null}
                {errors.avatar ? (
                  <p className="text-xs text-destructive">{errors.avatar.message}</p>
                ) : null}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setValue("avatar", file, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-card dark:border-border/40">
              <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
                <CardTitle className="text-base">{tProfile("updateName")}</CardTitle>
                <CardDescription className="text-xs">{tProfile("updateNameHint")}</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pt-4 pb-4">
                <form
                  onSubmit={handleSubmit((values) => submitProfileUpdate(values, ["name"]))}
                  className="space-y-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company-name-en">{tRegister("englishName")}</Label>
                      <Input
                        id="company-name-en"
                        autoComplete="organization"
                        aria-invalid={!!errors.name?.en}
                        className={inputClassName(!!errors.name?.en)}
                        {...register("name.en")}
                      />
                      {errors.name?.en ? (
                        <p className="text-sm text-destructive">{errors.name.en.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-name-ar">{tRegister("arabicName")}</Label>
                      <Input
                        id="company-name-ar"
                        autoComplete="organization"
                        aria-invalid={!!errors.name?.ar}
                        className={inputClassName(!!errors.name?.ar)}
                        dir="rtl"
                        {...register("name.ar")}
                      />
                      {errors.name?.ar ? (
                        <p className="text-sm text-destructive">{errors.name.ar.message}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email">{tProfile("email")}</Label>
                    <Input
                      id="company-email"
                      value={user.email}
                      readOnly
                      disabled
                      className={cn(
                        inputClassName(),
                        "cursor-not-allowed bg-muted/40 opacity-80",
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isPending || !nameChanged}
                    className="h-10 w-full rounded-xl"
                  >
                    {isPending ? (
                      <>
                        <ScaleLoader size="sm" />
                        {tProfile("saving")}
                      </>
                    ) : (
                      tProfile("saveName")
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
