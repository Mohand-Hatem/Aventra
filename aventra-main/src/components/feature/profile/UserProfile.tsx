"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  IconAlertTriangle,
  IconBulb,
  IconCamera,
  IconCheck,
  IconFileText,
  IconMail,
  IconSparkles,
  IconStar,
  IconTrendingUp,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import { useUser } from "@/hooks/useAuth";
import { useUploadCv, useUserCvs } from "@/hooks/useCv";
import { useUpdateUserProfile } from "@/hooks/useProfile";
import { PLANS } from "@/constants/plans";
import { getUserDisplayName, normalizeLocalizedName } from "@/types/auth";
import {
  createUpdateProfileSchema,
  type UpdateProfileFormValues,
  type UpdateProfilePayload,
} from "@/schemas/profile";
import {
  getCvAnalysis,
  getCvAtsScore,
  getCvFileType,
  getCvId,
  getCvTitle,
  getCvUrl,
  type CvInsightItem,
  type UserCv,
} from "@/types/cv";
import { AtsScoreChart } from "@/components/feature/profile/AtsScoreChart";
import { CvInsightDialog } from "@/components/feature/profile/CvInsightDialog";
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

function InsightCard({
  title,
  icon: Icon,
  items,
  emptyText,
  viewAllLabel,
  className,
  iconClassName,
  iconWrapClassName,
  itemAccentClassName,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: CvInsightItem[];
  emptyText: string;
  viewAllLabel: string;
  className?: string;
  iconClassName?: string;
  iconWrapClassName?: string;
  itemAccentClassName?: string;
}) {
  const previewItems = items.slice(0, 2);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col rounded-2xl border border-border/50 p-4 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex shrink-0 items-center gap-2.5">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-xl",
            iconWrapClassName,
          )}
        >
          <Icon className={cn("size-4 shrink-0", iconClassName)} />
        </div>
        <h3 className="text-sm font-bold tracking-tight text-foreground">{title}</h3>
      </div>

      {previewItems.length > 0 ? (
        <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto">
          {previewItems.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className={cn(
                "rounded-xl border border-border/40 border-l-[3px] bg-background/80 p-3",
                itemAccentClassName,
              )}
            >
              {item.title ? (
                <p className="text-sm font-semibold leading-snug text-foreground">
                  {item.title}
                </p>
              ) : null}
              <p
                className={cn(
                  "text-sm leading-relaxed text-muted-foreground",
                  item.title ? "mt-1.5" : "",
                )}
              >
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex flex-1 items-start text-sm leading-relaxed text-muted-foreground">
          {emptyText}
        </p>
      )}

      {items.length > 0 ? (
        <CvInsightDialog
          title={title}
          triggerLabel={viewAllLabel}
          items={items}
          variant="footer"
        />
      ) : null}
    </div>
  );
}

function AtsInsightCard({
  title,
  score,
  emptyText,
  className,
}: {
  title: string;
  score?: number;
  emptyText: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col rounded-2xl border border-border/50 p-4 shadow-sm",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10">
          <IconSparkles className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-sm font-bold tracking-tight text-foreground">{title}</h3>
      </div>
      {score !== undefined ? (
        <div className="flex flex-1 flex-col items-center justify-center py-2">
          <AtsScoreChart score={score} size="lg" />
        </div>
      ) : (
        <p className="flex flex-1 items-start text-sm leading-relaxed text-muted-foreground">
          {emptyText}
        </p>
      )}
    </div>
  );
}

function ProfileSummaryPanel({
  displayName,
  email,
  avatarSrc,
  initials,
  roleLabel,
  planLabel,
  tokenUsage,
  maxToken,
  tokenPercent,
  cvCount,
  atsScore,
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
  cvCount: number;
  atsScore: string;
  locale: string;
  t: ReturnType<typeof useTranslations<"profile">>;
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
            label={t("cvCount")}
            value={String(cvCount)}
            labelClassName="text-amber-600 dark:text-amber-400"
          />
          <StatBox
            label={t("atsScoreLabel")}
            value={atsScore}
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

export function UserProfile() {
  const t = useTranslations("profile");
  const tRegister = useTranslations("register");
  const tNavbar = useTranslations("navbar");
  const locale = useLocale();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);

  const { data: user, isLoading, isFetching, isError } = useUser();
  const { data: cvs = [], isLoading: isCvsLoading } = useUserCvs();
  const { mutate: updateProfile, isPending, uploadProgress } =
    useUpdateUserProfile();
  const { mutate: uploadCv, isPending: isUploading } = useUploadCv();

  const displayName = user ? getUserDisplayName(user.name, locale) : "";

  const profileSchema = useMemo(
    () =>
      createUpdateProfileSchema({
        nameMin: t("validation.nameMin"),
        avatarType: t("validation.avatarType"),
        avatarSize: t("validation.avatarSize"),
      }),
    [t],
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
    if (cvs.length === 0) {
      setSelectedCvId(null);
      return;
    }

    setSelectedCvId((current) => {
      if (current && cvs.some((cv, index) => getCvId(cv, index) === current)) {
        return current;
      }
      return getCvId(cvs[0], 0);
    });
  }, [cvs]);

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
        : t("noPlan");

  const selectedCv = useMemo(() => {
    if (!selectedCvId) return null;
    return cvs.find((cv, index) => getCvId(cv, index) === selectedCvId) ?? null;
  }, [cvs, selectedCvId]);

  const selectedAnalysis = useMemo(
    () => (selectedCv ? getCvAnalysis(selectedCv) : null),
    [selectedCv],
  );

  const selectedAts = selectedCv ? getCvAtsScore(selectedCv) : undefined;
  const selectedAtsScore = selectedAts !== undefined ? String(selectedAts) : "—";

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

  const handleCvUpload = (file: File | undefined) => {
    if (!file) return;
    uploadCv(file, {
      onSuccess: () => {
        if (cvInputRef.current) {
          cvInputRef.current.value = "";
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
            <CardDescription>{t("loadError")}</CardDescription>
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
  const insightEmpty = t("noAnalysisYet");

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
        <ProfileSummaryPanel
          displayName={displayName}
          email={user.email}
          avatarSrc={avatarSrc}
          initials={initials}
          roleLabel={tNavbar(`roles.${user.role}`)}
          planLabel={planLabel}
          tokenUsage={tokenUsage}
          maxToken={maxToken}
          tokenPercent={tokenPercent}
          cvCount={cvs.length}
          atsScore={selectedAtsScore}
          locale={locale}
          t={t}
        />
      </aside>

      {/* Main content */}
      <div className="order-last min-w-0 flex-1 space-y-6 lg:order-first ">
        {/* <header>
          <p className="text-xs font-bold uppercase tracking-widest text-primary dark:text-sky">
            {t("title")}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("description")}</p>
        </header> */}

        {/* Insight cards — strengths, weaknesses, suggestions, ATS */}
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:grid-rows-2 sm:min-h-80 xl:grid-cols-4 xl:grid-rows-1 xl:min-h-80">
          <InsightCard
            title={t("strengths")}
            icon={IconTrendingUp}
            items={selectedAnalysis?.strengths ?? []}
            emptyText={selectedCv ? t("noStrengths") : insightEmpty}
            viewAllLabel={t("viewAll")}
            className="bg-gradient-to-br from-primary/5 to-background dark:from-sky/10 dark:to-background"
            iconClassName="text-primary dark:text-sky"
            iconWrapClassName="bg-primary/10 dark:bg-sky/10"
            itemAccentClassName="border-l-primary dark:border-l-sky"
          />
          <InsightCard
            title={t("weaknesses")}
            icon={IconAlertTriangle}
            items={selectedAnalysis?.weaknesses ?? []}
            emptyText={selectedCv ? t("noWeaknesses") : insightEmpty}
            viewAllLabel={t("viewAll")}
            className="bg-gradient-to-br from-amber-500/5 to-background"
            iconClassName="text-amber-600 dark:text-amber-400"
            iconWrapClassName="bg-amber-500/10"
            itemAccentClassName="border-l-amber-500"
          />
          <InsightCard
            title={t("suggestions")}
            icon={IconBulb}
            items={selectedAnalysis?.suggestions ?? []}
            emptyText={selectedCv ? t("noSuggestions") : insightEmpty}
            viewAllLabel={t("viewAll")}
            className="bg-gradient-to-br from-violet-500/5 to-background"
            iconClassName="text-violet-600 dark:text-violet-400"
            iconWrapClassName="bg-violet-500/10"
            itemAccentClassName="border-l-violet-500"
          />
          <AtsInsightCard
            title={t("atsScoreLabel")}
            score={selectedAts}
            emptyText={selectedCv ? t("processingCv") : insightEmpty}
            className="bg-gradient-to-br from-emerald-500/5 to-background"
          />
        </div>

        {/* CV list + summary */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="border-border/60 shadow-card dark:border-border/40">
            <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
              <CardTitle className="text-base">{t("myCvs")}</CardTitle>
              <CardDescription className="text-xs">{t("myCvsHint")}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-4 pb-4">
              {isCvsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <ScaleLoader size="md" className="text-muted-foreground" />
                </div>
              ) : cvs.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
                  <IconFileText className="size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">{t("noCvsYet")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("noCvsHint")}</p>
                </div>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {cvs.map((cv, index) => (
                    <CvListItem
                      key={getCvId(cv, index)}
                      cv={cv}
                      index={index}
                      isSelected={selectedCvId === getCvId(cv, index)}
                      locale={locale}
                      t={t}
                      onSelect={() => setSelectedCvId(getCvId(cv, index))}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-card dark:border-border/40">
            <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
              <CardTitle className="text-base">{t("cvSummary")}</CardTitle>
              <CardDescription className="text-xs">{t("cvSummaryHint")}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-4 pb-4">
              <CvSummaryPanel cv={selectedCv} locale={locale} t={t} isLoading={isCvsLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Account settings — update photo & name */}
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {t("accountSettings")}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-border/60 shadow-card dark:border-border/40">
              <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
                <CardTitle className="text-base">{t("changePhoto")}</CardTitle>
                <CardDescription className="text-xs">{t("photoHint")}</CardDescription>
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
                    <p className="text-xs text-muted-foreground">{t("photoHint")}</p>
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
                    {t("choosePhoto")}
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
                        {t("saving")}
                      </>
                    ) : (
                      t("savePhoto")
                    )}
                  </Button>
                </div>
                {isPending && uploadProgress !== null ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {uploadProgress < 100
                          ? t("uploadingPhoto")
                          : t("processingPhoto")}
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
                <CardTitle className="text-base">{t("updateName")}</CardTitle>
                <CardDescription className="text-xs">{t("updateNameHint")}</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pt-4 pb-4">
                <form
                  onSubmit={handleSubmit((values) => submitProfileUpdate(values, ["name"]))}
                  className="space-y-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name-en">{tRegister("englishName")}</Label>
                      <Input
                        id="name-en"
                        autoComplete="name"
                        aria-invalid={!!errors.name?.en}
                        className={inputClassName(!!errors.name?.en)}
                        {...register("name.en")}
                      />
                      {errors.name?.en ? (
                        <p className="text-sm text-destructive">{errors.name.en.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name-ar">{tRegister("arabicName")}</Label>
                      <Input
                        id="name-ar"
                        autoComplete="name"
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
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
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
                        {t("saving")}
                      </>
                    ) : (
                      t("saveName")
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upload & review CV */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="border-border/60 shadow-card dark:border-border/40">
            <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
              <CardTitle className="text-base">{t("uploadCv")}</CardTitle>
              <CardDescription className="text-xs">{t("uploadCvHint")}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-4 pb-4">
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-8 text-center dark:border-sky/30 dark:bg-sky/5">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-sky/10 dark:text-sky">
                  <IconUpload className="size-6" />
                </div>
                <p className="mt-3 text-sm font-medium">{t("uploadCv")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("uploadCvHint")}</p>
                <Button
                  type="button"
                  className="mt-4 rounded-xl"
                  disabled={isUploading}
                  onClick={() => cvInputRef.current?.click()}
                >
                  {isUploading ? (
                    <>
                      <ScaleLoader size="sm" />
                      {t("uploading")}
                    </>
                  ) : (
                    <>
                      <IconUpload />
                      {t("chooseCv")}
                    </>
                  )}
                </Button>
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(event) => handleCvUpload(event.target.files?.[0])}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-card dark:border-border/40">
            <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
              <CardTitle className="text-base">{t("suggestions")}</CardTitle>
              <CardDescription className="text-xs">{t("cvInfoHint")}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-4 pb-4">
              <CvReviewPanel cv={selectedCv} t={t} isLoading={isCvsLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CvListItem({
  cv,
  index,
  isSelected,
  locale,
  t,
  onSelect,
}: {
  cv: UserCv;
  index: number;
  isSelected: boolean;
  locale: string;
  t: ReturnType<typeof useTranslations<"profile">>;
  onSelect: () => void;
}) {
  const title = getCvTitle(cv);
  const fileType = getCvFileType(cv);
  const uploadedAt = formatDate(cv.createdAt ?? cv.updatedAt, locale);
  const cvUrl = getCvUrl(cv);

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 transition-colors",
        isSelected
          ? "border-primary/40 bg-primary/5 dark:border-sky/40 dark:bg-sky/5"
          : "border-border/60 bg-card dark:border-border/40",
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-sky/10 dark:text-sky">
        <IconFileText className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">
          {fileType?.toUpperCase() ?? t("cvs")}
          {uploadedAt ? ` · ${uploadedAt}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button
          type="button"
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="rounded-lg"
          onClick={onSelect}
        >
          {t("details")}
        </Button>
        {cvUrl ? (
          <Button asChild variant="outline" size="sm" className="rounded-lg">
            <a href={cvUrl} target="_blank" rel="noreferrer">
              {t("reviewCv")}
            </a>
          </Button>
        ) : null}
      </div>
    </li>
  );
}

function CvSummaryPanel({
  cv,
  locale,
  t,
  isLoading,
}: {
  cv: UserCv | null;
  locale: string;
  t: ReturnType<typeof useTranslations<"profile">>;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <ScaleLoader size="md" className="text-muted-foreground" />
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
        <IconFileText className="size-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{t("noCvSelected")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("selectCvHint")}</p>
      </div>
    );
  }

  const analysis = getCvAnalysis(cv);
  const title = getCvTitle(cv);
  const uploadedAt = formatDate(cv.createdAt ?? cv.updatedAt, locale);
  const summary = analysis.summary;
  const summaryPreview =
    summary && summary.length > 220 ? `${summary.slice(0, 220).trim()}…` : summary;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet/10 dark:text-violet-300">
          <IconUser className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{title}</h3>
          {uploadedAt ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("uploadedOn", { date: uploadedAt })}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 dark:border-border/40">
        <p className="text-sm leading-relaxed text-foreground/85">
          {summaryPreview ??
            (cv.processingStatus === "processing"
              ? t("processingCv")
              : t("noSummary"))}
        </p>
        {summary ? (
          <div className="mt-3">
            <CvInsightDialog
              title={t("fullSummaryTitle")}
              description={title}
              triggerLabel={t("readFullSummary")}
              bodyText={summary}
            />
          </div>
        ) : null}
      </div>

      {analysis.strengths.length > 0 || analysis.weaknesses.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {analysis.strengths.length > 0 ? (
            <div className="rounded-xl bg-sky-50/80 p-3 dark:bg-sky/5">
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-primary dark:text-sky">
                <IconCheck className="size-3.5" />
                {t("strengths")}
              </p>
              <ul className="space-y-2">
                {analysis.strengths.slice(0, 3).map((item, index) => (
                  <li key={`${item.title}-${index}`} className="text-xs text-muted-foreground">
                    {item.title ? (
                      <span className="font-medium text-foreground">{item.title}: </span>
                    ) : null}
                    {item.detail}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {analysis.weaknesses.length > 0 ? (
            <div className="rounded-xl bg-amber-50/10 p-3 dark:bg-amber/5">
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">
                <IconAlertTriangle className="size-3.5" />
                {t("weaknesses")}
              </p>
              <ul className="space-y-2">
                {analysis.weaknesses.slice(0, 3).map((item, index) => (
                  <li key={`${item.title}-${index}`} className="text-xs text-muted-foreground">
                    {item.title ? (
                      <span className="font-medium text-foreground">{item.title}: </span>
                    ) : null}
                    {item.detail}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CvReviewPanel({
  cv,
  t,
  isLoading,
}: {
  cv: UserCv | null;
  t: ReturnType<typeof useTranslations<"profile">>;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <ScaleLoader size="md" className="text-muted-foreground" />
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
        <IconFileText className="size-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{t("noCvSelected")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("selectCvHint")}</p>
      </div>
    );
  }

  const analysis = getCvAnalysis(cv);

  if (analysis.suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
        <IconBulb className="size-8 text-violet-500/70" />
        <p className="mt-3 text-sm font-medium">{t("noSuggestions")}</p>
      </div>
    );
  }

  const previewSuggestions = analysis.suggestions.slice(0, 3);

  return (
    <div className="flex flex-col">
      <ul className="space-y-2.5">
        {previewSuggestions.map((item, index) => (
          <li
            key={`${item.title}-${index}`}
            className="rounded-xl border border-border/40 border-l-[3px] border-l-violet-500 bg-background/80 p-3"
          >
            {item.title ? (
              <p className="text-sm font-semibold leading-snug text-foreground">
                {item.title}
              </p>
            ) : null}
            <p
              className={cn(
                "text-sm leading-relaxed text-muted-foreground",
                item.title ? "mt-1.5" : "",
              )}
            >
              {item.detail}
            </p>
          </li>
        ))}
      </ul>

      <CvInsightDialog
        title={t("suggestions")}
        triggerLabel={t("viewAll")}
        items={analysis.suggestions}
        variant="footer"
      />
    </div>
  );
}
