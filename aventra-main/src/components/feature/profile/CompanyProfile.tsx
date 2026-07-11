"use client";

import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  IconCamera,
  IconMail,
  IconSearch,
  IconSparkles,
  IconStar,
  IconUsers,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { z } from "zod";
import { useAiUsage } from "@/hooks/useAiUsage";
import { useUser } from "@/hooks/useAuth";
import { useCompanySearchHistory } from "@/hooks/useCompanySearchHistory";
import { useFilterCandidates } from "@/hooks/useFilterCandidates";
import { useUpdateUserProfile } from "@/hooks/useProfile";
import { PLANS } from "@/constants/plans";
import { getUserDisplayName, normalizeLocalizedName } from "@/types/auth";
import {
  createUpdateProfileSchema,
  type UpdateProfileFormValues,
  type UpdateProfilePayload,
} from "@/schemas/profile";
import {
  matchesFilterCriteria,
  type CandidateFilterCriteria,
  type CandidateResult,
  type SearchHistoryEntry,
} from "@/types/company";
import ResultsTable from "@/components/feature/company-search/ResultsTable";
import CandidateDetail from "@/components/feature/company-search/CandidateDetail";
import { CandidateFilterPanel } from "@/components/feature/profile/CandidateFilterPanel";
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

const EMPTY_SEARCH_HISTORY: SearchHistoryEntry[] = [];
const EMPTY_CANDIDATES: CandidateResult[] = [];

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
  progressTokenPercent,
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
  progressTokenPercent: number;
  searchCount: number;
  candidatesFound: number;
  locale: string;
  t: ReturnType<typeof useTranslations<"companyProfile">>;
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-canvas shadow-md dark:border-border/40">
      <CardContent className="p-5">
        <div className="flex flex-col items-center text-center">
          <Avatar className="size-50 ring-4 ring-primary/10 dark:ring-sky/10">
            {avatarSrc ? (
              <AvatarImage src={avatarSrc} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-primary text-2xl font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h2 className="mt-4 font-heading text-xl font-bold tracking-tight">
            {displayName}
          </h2>
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
                <Progress
                  value={progressTokenPercent}
                  className="h-3 bg-muted/60"
                />
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
                value={maxToken > 0 ? progressTokenPercent : 0}
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
          <p className="line-clamp-2 text-sm font-medium text-foreground">
            {entry.query}
          </p>
          {formattedDate ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {formattedDate}
            </p>
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
  const prevUserNameRef = useRef<string | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null,
  );
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateResult | null>(null);
  const [resultsMode, setResultsMode] = useState<"history" | "filter">(
    "history",
  );
  const [appliedFilterCriteria, setAppliedFilterCriteria] =
    useState<CandidateFilterCriteria | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: user, isLoading, isFetching, isError } = useUser();
  const { data: aiUsage } = useAiUsage({ enabled: !!user });
  const { data: searchHistoryData, isLoading: isHistoryLoading } =
    useCompanySearchHistory();
  const {
    mutate: updateProfile,
    isPending,
    uploadProgress,
  } = useUpdateUserProfile();

  const searches = searchHistoryData?.searches ?? EMPTY_SEARCH_HISTORY;
  const searchCount =
    searchHistoryData?.totalSearches ?? user?.searchCount ?? 0;

  const {
    data: filterData,
    isFetching: isFilterFetching,
    isPending: isFilterPending,
  } = useFilterCandidates(
    { minAts: appliedFilterCriteria?.minAts || undefined },
    { enabled: appliedFilterCriteria !== null },
  );
  const filteredCandidates = useMemo(() => {
    const candidates = filterData?.candidates ?? EMPTY_CANDIDATES;
    if (!appliedFilterCriteria) return candidates;
    return candidates.filter((candidate) =>
      matchesFilterCriteria(candidate, appliedFilterCriteria),
    );
  }, [filterData, appliedFilterCriteria]);

  const profileSchema = useMemo(
    () =>
      createUpdateProfileSchema({
        nameMin: tProfile("validation.nameMin"),
        avatarType: tProfile("validation.avatarType"),
        avatarSize: tProfile("validation.avatarSize"),
      }),
    [tProfile],
  );

  const changePasswordSchema = z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters")
        .max(128, "New password must be at most 128 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
          "Password must contain uppercase, lowercase and number",
        ),
      confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: { en: "", ar: "" },
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const queryClient = useQueryClient();

  const deleteAvatarMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.delete("/users/avatar");
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        tProfile("avatarDeletedSuccess") || "Avatar deleted successfully!",
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      startTransition(() => {
        setAvatarPreview(null);
      });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg =
        axiosErr.response?.data?.message ?? "Failed to delete avatar.";
      toast.error(msg);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: ChangePasswordFormValues) => {
      const response = await axiosInstance.put("/users/update-password", {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
        confirmPassword: payload.confirmPassword,
      });
      return response.data as { success: boolean; message: string };
    },
    onSuccess: (data) => {
      toast.success(
        data.message ||
          tProfile("passwordUpdateSuccess") ||
          "Password updated successfully!",
      );
      resetPassword();
    },
    onError: (err: unknown) => {
      const axiosErr = err as {
        response?: {
          data?: {
            message?: string;
            errors?: Array<{ message?: string; path?: string[] }>;
          };
        };
      };
      console.error("Password update error response:", axiosErr.response?.data);

      const errors = axiosErr.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        errors.forEach((e) => {
          if (e.message) toast.error(e.message);
        });
      } else {
        const msg =
          axiosErr.response?.data?.message ?? "Failed to update password.";
        toast.error(msg);
      }
    },
  });

  const selectedAvatar = useWatch({ control, name: "avatar" });
  const displayName = user ? getUserDisplayName(user.name, locale) : "";
  const currentName = user
    ? normalizeLocalizedName(user.name)
    : { en: "", ar: "" };

  useEffect(() => {
    if (!user) return;
    const nameKey = JSON.stringify(normalizeLocalizedName(user.name));
    if (nameKey === prevUserNameRef.current) return;
    prevUserNameRef.current = nameKey;
    reset({ name: normalizeLocalizedName(user.name), avatar: undefined });
    startTransition(() => {
      setAvatarPreview(null);
    });
  }, [user, reset]);

  useEffect(() => {
    if (!selectedAvatar) {
      startTransition(() => {
        setAvatarPreview(null);
      });
      return;
    }

    const objectUrl = URL.createObjectURL(selectedAvatar);
    startTransition(() => {
      setAvatarPreview(objectUrl);
    });

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedAvatar]);

  useEffect(() => {
    if (searches.length === 0) {
      startTransition(() => {
        setSelectedHistoryId(null);
        setSelectedCandidate(null);
      });
      return;
    }

    startTransition(() => {
      setSelectedHistoryId((current) => {
        if (current && searches.some((entry) => entry.id === current)) {
          return current;
        }
        return searches[0].id;
      });
    });
  }, [searches]);

  const selectedHistory = useMemo(
    () => searches.find((entry) => entry.id === selectedHistoryId) ?? null,
    [searches, selectedHistoryId],
  );

  const historyCandidates = selectedHistory?.candidates ?? EMPTY_CANDIDATES;
  const displayedCandidates =
    resultsMode === "filter" ? filteredCandidates : historyCandidates;

  useEffect(() => {
    if (displayedCandidates.length === 0) {
      startTransition(() => {
        setSelectedCandidate(null);
      });
      return;
    }

    startTransition(() => {
      setSelectedCandidate((current) => {
        if (
          current &&
          displayedCandidates.some(
            (candidate) => candidate.cvId === current.cvId,
          )
        ) {
          return current;
        }
        return displayedCandidates[0];
      });
    });
  }, [displayedCandidates]);

  const candidatesFound = useMemo(
    () =>
      searches.reduce(
        (sum, entry) => sum + (entry.total || entry.candidates.length),
        0,
      ),
    [searches],
  );

  const tokenUsage = aiUsage?.tokenUsage ?? user?.tokenUsage ?? 0;
  const maxToken = aiUsage?.maxToken ?? user?.maxToken ?? 0;
  const tokenPercent = Math.max(
    0,
    Math.round(
      aiUsage?.tokenUsagePercent ??
        (maxToken > 0 ? (tokenUsage / maxToken) * 100 : 0),
    ),
  );
  const progressTokenPercent = Math.min(100, tokenPercent);

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
        <Card className="w-full max-w-md bg-canvas shadow-md dark:shadow-none">
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
  const hasAvatarChange = !!selectedAvatar;
  const isRefreshing = isFetching && !!user;

  return (
    <div
      className={cn(
        "relative mx-auto mt-10 grid w-full max-w-[1550px] grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start",
        isRefreshing && "opacity-90",
      )}
    >
      {isRefreshing ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full animate-pulse bg-primary dark:bg-sky" />
        </div>
      ) : null}

      <aside className="order-first col-span-1 xl:sticky xl:top-25 xl:order-last">
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
          progressTokenPercent={progressTokenPercent}
          searchCount={searchCount}
          candidatesFound={candidatesFound}
          locale={locale}
          t={t}
        />
      </aside>

      <div className="order-last min-w-0 col-span-1 space-y-6 xl:order-first">
        <header>
          <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
            <IconSparkles className="size-3" />
            {t("welcome", {
              role: tNavbar(`roles.${user.role}`),
              name: displayName,
            })}
          </span>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("description")}
          </p>
        </header>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr] xl:items-start">
          <div className="flex flex-col gap-4">
            <Card className="border-border/60 bg-canvas shadow-md dark:border-border/40">
              <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
                <CardTitle className="text-base">
                  {t("searchHistory")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("searchHistoryHint")}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pt-4 pb-4">
                {isHistoryLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <ScaleLoader size="md" />
                  </div>
                ) : searches.length === 0 ? (
                  <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
                    <IconSearch className="size-8 text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium">
                      {t("noSearchesYet")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("noSearchesHint")}
                    </p>
                    <Button asChild className="mt-4 rounded-xl">
                      <Link href="/company/search">{t("goToSearch")}</Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="max-h-80 overflow-y-scroll space-y-2 pr-1">
                    {searches.map((entry) => (
                      <li key={entry.id}>
                        <SearchHistoryItem
                          entry={entry}
                          isSelected={
                            resultsMode === "history" &&
                            selectedHistoryId === entry.id
                          }
                          locale={locale}
                          t={t}
                          onSelect={() => {
                            setSelectedHistoryId(entry.id);
                            setResultsMode("history");
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-canvas shadow-md dark:border-border/40">
              <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
                <CardTitle className="text-base">
                  {t("filterCandidates")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("filterCandidatesHint")}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pt-4 pb-4">
                <CandidateFilterPanel
                  candidates={
                    resultsMode === "filter"
                      ? (filterData?.candidates ?? EMPTY_CANDIDATES)
                      : historyCandidates
                  }
                  isPending={isFilterFetching}
                  t={t}
                  onApply={(criteria) => {
                    setAppliedFilterCriteria(criteria);
                    setResultsMode("filter");
                  }}
                  onClear={() => {
                    setAppliedFilterCriteria(null);
                    setResultsMode("history");
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <div className="shrink-0 overflow-hidden">
              <ResultsTable
                candidates={displayedCandidates}
                selectedCandidate={selectedCandidate}
                onSelectCandidate={setSelectedCandidate}
                isPending={resultsMode === "filter" && isFilterPending}
                hideExport={resultsMode === "filter"}
              />
            </div>

            {selectedCandidate ? (
              <div className="shrink-0 overflow-hidden">
                <CandidateDetail candidate={selectedCandidate} />
              </div>
            ) : displayedCandidates.length === 0 &&
              (resultsMode === "history" ? searches.length > 0 : true) ? (
              <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-canvas/60 px-6 text-center shadow-md">
                <div>
                  <IconUsers className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {resultsMode === "filter"
                      ? t("noFilterResults")
                      : t("selectSearchHint")}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Hiring Insights Dashboard */}
        <Card className="border-border/60 bg-canvas shadow-md dark:border-border/40">
          <CardHeader className="border-b border-border/60 px-6 py-4 dark:border-border/40">
            <CardTitle className="text-base">Hiring Insights</CardTitle>
            <CardDescription className="text-xs">
              AI-powered insights to optimize your recruitment process
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 dark:bg-sky/10">
                    <IconSearch className="size-4 shrink-0 text-primary dark:text-sky" />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    Top Skills Searched
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React.js",
                    "Python",
                    "Node.js",
                    "TypeScript",
                    "AWS",
                    "Docker",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10">
                    <IconUsers className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    Candidate Quality
                  </h3>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      label: "Above Average",
                      percent: "42%",
                      color: "bg-emerald-500",
                    },
                    { label: "Average", percent: "38%", color: "bg-sky-500" },
                    {
                      label: "Below Average",
                      percent: "20%",
                      color: "bg-amber-500",
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">
                          {item.percent}
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted/30">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: item.percent }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10">
                    <IconStar className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    Recruitment Metrics
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Avg Score",
                      value: "78",
                      color: "text-primary dark:text-sky",
                    },
                    {
                      label: "Match Rate",
                      value: "92%",
                      color: "text-emerald-600 dark:text-emerald-400",
                    },
                    {
                      label: "Time Saved",
                      value: "65%",
                      color: "text-violet-600 dark:text-violet-400",
                    },
                    {
                      label: "Quality Hire",
                      value: "88%",
                      color: "text-amber-600 dark:text-amber-400",
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-xl border border-border/50 bg-background/60 p-3 text-center dark:border-border/30"
                    >
                      <p className={`text-lg font-bold ${metric.color}`}>
                        {metric.value}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings Section */}
        <Card className="border-border/60 bg-canvas shadow-md dark:border-border/40">
          <CardHeader className="border-b border-border/60 px-6 py-4 dark:border-border/40">
            <CardTitle className="text-base">
              {tProfile("accountSettings")}
            </CardTitle>
            <CardDescription className="text-xs">
              {tProfile("personalInfoHint")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
              {/* Left Side: Avatar / Photo Upload */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Avatar className="size-36 ring-4 ring-primary/10 dark:ring-sky/10 transition-transform group-hover:scale-[1.02]">
                    {avatarSrc ? (
                      <AvatarImage src={avatarSrc} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-xl font-semibold text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconCamera className="size-8 text-white" />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <p className="text-xs text-muted-foreground">
                    {tProfile("photoHint")}
                  </p>
                  <div className="flex gap-2 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <IconCamera className="size-4 mr-1.5" />
                      {tProfile("choosePhoto")}
                    </Button>

                    {user?.avatar &&
                      user.avatar !==
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png" && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="flex-1 rounded-xl"
                          onClick={() => deleteAvatarMutation.mutate()}
                          disabled={deleteAvatarMutation.isPending}
                        >
                          <IconTrash className="size-4 mr-1.5" />
                          {tProfile("deletePhoto") || "Delete Photo"}
                        </Button>
                      )}
                  </div>

                  {hasAvatarChange && (
                    <Button
                      type="button"
                      size="sm"
                      className="w-full rounded-xl bg-primary text-white hover:bg-primary/95 dark:bg-sky dark:text-zinc-200 dark:hover:bg-sky/95"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(
                          (values) => submitProfileUpdate(values, ["avatar"]),
                          (errs) =>
                            console.error(
                              "Company avatar form validation errors:",
                              errs,
                            ),
                        )(e);
                      }}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <ScaleLoader
                            size="sm"
                            className="text-white dark:text-zinc-950"
                          />
                          <span className="ml-1.5">{tProfile("saving")}</span>
                        </>
                      ) : (
                        tProfile("savePhoto")
                      )}
                    </Button>
                  )}
                </div>

                {isPending && uploadProgress !== null ? (
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        {uploadProgress < 100
                          ? tProfile("uploadingPhoto")
                          : tProfile("processingPhoto")}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress
                      value={uploadProgress}
                      className="h-1.5 bg-muted/60 [&>div]:bg-primary dark:[&>div]:bg-sky"
                    />
                  </div>
                ) : null}

                {errors.avatar ? (
                  <p className="text-xs text-destructive">error</p>
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
              </div>

              {/* Right Side: Profile Details form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(
                    (values) => submitProfileUpdate(values, ["name"]),
                    (errs) =>
                      console.error(
                        "Company name form validation errors:",
                        errs,
                      ),
                  )(e);
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name-en">
                      {tRegister("englishName")}
                    </Label>
                    <Input
                      id="company-name-en"
                      autoComplete="organization"
                      aria-invalid={!!errors.name?.en}
                      className={inputClassName(!!errors.name?.en)}
                      {...register("name.en")}
                    />
                    {errors.name?.en ? (
                      <p className="text-xs text-destructive">
                        {errors.name.en.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-name-ar">
                      {tRegister("arabicName")}
                    </Label>
                    <Input
                      id="company-name-ar"
                      autoComplete="organization"
                      aria-invalid={!!errors.name?.ar}
                      className={inputClassName(!!errors.name?.ar)}
                      dir="rtl"
                      {...register("name.ar")}
                    />
                    {errors.name?.ar ? (
                      <p className="text-xs text-destructive">
                        {errors.name.ar.message}
                      </p>
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
                      "cursor-not-allowed bg-muted/40 opacity-85",
                    )}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto px-6 h-10 rounded-xl bg-primary text-white hover:bg-primary/95 dark:bg-sky dark:text-zinc-200 dark:hover:bg-sky/95"
                  >
                    {isPending ? (
                      <>
                        <ScaleLoader
                          size="sm"
                          className="text-white dark:text-zinc-950"
                        />
                        <span className="ml-2">{tProfile("saving")}</span>
                      </>
                    ) : (
                      tProfile("saveName")
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card className="border-border/60 bg-canvas shadow-md dark:border-border/40">
          <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
            <CardTitle className="text-base">
              {tProfile("changePassword")}
            </CardTitle>
            <CardDescription className="text-xs">
              {tProfile("changePasswordHint")}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pt-4 pb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordSubmit((values) =>
                  changePasswordMutation.mutate(values),
                )(e);
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    {tProfile("currentPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={cn(
                        inputClassName(!!passwordErrors.currentPassword),
                        "pr-10",
                      )}
                      {...registerPassword("currentPassword")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <HiEyeOff className="size-5" />
                      ) : (
                        <HiEye className="size-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-destructive">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{tProfile("newPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={cn(
                        inputClassName(!!passwordErrors.newPassword),
                        "pr-10",
                      )}
                      {...registerPassword("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showNewPassword ? (
                        <HiEyeOff className="size-5" />
                      ) : (
                        <HiEye className="size-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-destructive">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {tProfile("confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={cn(
                        inputClassName(!!passwordErrors.confirmPassword),
                        "pr-10",
                      )}
                      {...registerPassword("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <HiEyeOff className="size-5" />
                      ) : (
                        <HiEye className="size-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full sm:w-auto px-6 h-10 rounded-xl bg-primary text-white hover:bg-primary/95 dark:bg-sky dark:text-zinc-200 dark:hover:bg-sky/95"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <ScaleLoader
                        size="sm"
                        className="text-white dark:text-zinc-950"
                      />
                      <span className="ml-2">
                        {tProfile("updatingPassword")}
                      </span>
                    </>
                  ) : (
                    tProfile("updatePassword")
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
