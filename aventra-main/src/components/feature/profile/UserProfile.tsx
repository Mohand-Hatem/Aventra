"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
  type ComponentType,
  type ReactNode,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  IconAlertTriangle,
  IconBulb,
  IconCamera,
  IconCheck,
  IconExternalLink,
  IconFileText,
  IconMail,
  IconSparkles,
  IconStar,
  IconTrash,
  IconTrendingUp,
  IconUpload,
  IconUser,
  IconPhone,
  IconBrandLinkedin,
  IconBrandGithub,
  IconMapPin,
} from "@tabler/icons-react";
import { useUser } from "@/hooks/useAuth";
import { useAiUsage } from "@/hooks/useAiUsage";
import { useDeleteCv, useUploadCv, useUserCvs } from "@/hooks/useCv";
import { useUpdateUserProfile } from "@/hooks/useProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { z } from "zod";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
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
  getCvParsedSections,
  getCvTitle,
  getCvUrl,
  type CvInsightItem,
  type UserCv,
} from "@/types/cv";
import { AtsScoreChart } from "@/components/feature/profile/AtsScoreChart";
import { CvInsightDialog } from "@/components/feature/profile/CvInsightDialog";
import { ProfilePageSkeleton } from "@/components/feature/profile/ProfilePageSkeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { cn, ensureAbsoluteUrl } from "@/lib/utils";

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

function hasCvAnalysisResults(cv: UserCv | null) {
  if (!cv) return false;

  const analysis = getCvAnalysis(cv);
  return (
    cv.processingStatus === "analyzed" ||
    getCvAtsScore(cv) !== undefined ||
    Boolean(analysis.summary) ||
    analysis.strengths.length > 0 ||
    analysis.weaknesses.length > 0 ||
    analysis.suggestions.length > 0
  );
}

function getCvAnalysisStateMessage(
  cv: UserCv | null,
  t: ReturnType<typeof useTranslations<"profile">>,
) {
  if (!cv) return t("noAnalysisYet");
  if (cv.processingStatus === "processing") return t("processingCv");
  if (cv.processingStatus === "uploaded" || cv.processingStatus === "failed") {
    return t("notAnalyzedYet");
  }
  return null;
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
        <h3 className="text-sm font-bold tracking-tight text-foreground">
          {title}
        </h3>
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
        <h3 className="text-sm font-bold tracking-tight text-foreground">
          {title}
        </h3>
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

function CvSectionPlaceholder({
  text,
  example,
}: {
  text: string;
  example: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/15 px-4 py-3">
      <p className="text-sm text-muted-foreground">{text}</p>
      <p className="mt-2 text-xs text-muted-foreground/80">{example}</p>
    </div>
  );
}

function CvDataSection({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-background/60 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 dark:bg-sky/10">
            <Icon className="size-4 shrink-0 text-primary dark:text-sky" />
          </div>
          <h3 className="text-sm font-bold tracking-tight text-foreground">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
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
  progressTokenPercent,
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
  progressTokenPercent: number;
  cvCount: number;
  atsScore: string;
  locale: string;
  t: ReturnType<typeof useTranslations<"profile">>;
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

export function UserProfile() {
  const t = useTranslations("profile");
  const tRegister = useTranslations("register");
  const tNavbar = useTranslations("navbar");
  const locale = useLocale();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const prevUserNameRef = useRef<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [pendingDeleteCv, setPendingDeleteCv] = useState<UserCv | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: user, isLoading, isFetching, isError } = useUser();
  const { data: aiUsage } = useAiUsage({ enabled: !!user });
  const { data: cvs = [], isLoading: isCvsLoading } = useUserCvs();
  const {
    mutate: updateProfile,
    isPending,
    uploadProgress,
  } = useUpdateUserProfile();
  const { mutate: uploadCv, isPending: isUploading } = useUploadCv();
  const {
    mutateAsync: deleteCv,
    isPending: isDeletingCv,
    variables: deletingCvId,
  } = useDeleteCv();

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
        t("avatarDeletedSuccess") || "Avatar deleted successfully!",
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
          t("passwordUpdateSuccess") ||
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
    if (cvs.length === 0) {
      startTransition(() => {
        setSelectedCvId(null);
      });
      return;
    }

    startTransition(() => {
      setSelectedCvId((current) => {
        if (
          current &&
          cvs.some((cv, index) => getCvId(cv, index) === current)
        ) {
          return current;
        }
        return getCvId(cvs[0], 0);
      });
    });
  }, [cvs]);

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
  const selectedAtsScore =
    selectedAts !== undefined ? String(selectedAts) : "—";
  const selectedCvStateMessage = getCvAnalysisStateMessage(selectedCv, t);
  const selectedCvSections = useMemo(
    () => getCvParsedSections(selectedCv),
    [selectedCv],
  );
  const selectedCvTitle = selectedCv ? getCvTitle(selectedCv) : undefined;
  const cvDataActionClassName =
    "h-auto p-0 text-xs font-semibold text-primary hover:text-primary/80 hover:underline dark:text-sky dark:hover:text-sky/80";
  const pendingDeleteCvId = pendingDeleteCv?._id ?? pendingDeleteCv?.id ?? null;
  const pendingDeleteCvTitle = pendingDeleteCv
    ? getCvTitle(pendingDeleteCv)
    : "";
  const deleteCvDescription = t.has("deleteCvDescription")
    ? t("deleteCvDescription", { title: pendingDeleteCvTitle })
    : locale === "ar"
      ? `سيتم حذف "${pendingDeleteCvTitle}" نهائيًا من حسابك. لا يمكن التراجع عن هذا الإجراء.`
      : `"${pendingDeleteCvTitle}" will be permanently removed from your account. This action cannot be undone.`;

  const confirmDeleteCv = async () => {
    if (!pendingDeleteCvId) return;

    try {
      await deleteCv(pendingDeleteCvId);
      setPendingDeleteCv(null);
    } catch {
      // Keep the dialog open so the user can retry after the error toast.
    }
  };

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

    // No changes detected — tell the user instead of silently doing nothing.
    if (!payload.name && !payload.avatar) {
      toast.error(t("noChangesToSave") || "No changes to save.");
      return;
    }

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
      onError: (err: unknown) => {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
        };
        const msg =
          axiosErr.response?.data?.message ?? "Failed to update profile.";
        toast.error(msg);
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
  const DEFAULT_AVATAR =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const initials = getInitials(displayName);
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
          progressTokenPercent={progressTokenPercent}
          cvCount={cvs.length}
          atsScore={selectedAtsScore}
          locale={locale}
          t={t}
        />
      </aside>

      {/* Main content */}
      <div className="order-last min-w-0 flex-1 space-y-6 lg:order-first ">
        <header>
          <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
            <IconSparkles className="size-3" />
            {t("title")}
          </span>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {t("welcome", {
              role: tNavbar(`roles.${user.role}`),
              name: displayName,
            })}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("description")}
          </p>
        </header>

        {/* Insight cards — strengths, weaknesses, suggestions, ATS */}
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:grid-rows-2 sm:min-h-80 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 xl:grid-rows-1 xl:min-h-80">
          <InsightCard
            title={t("strengths")}
            icon={IconTrendingUp}
            items={selectedAnalysis?.strengths ?? []}
            emptyText={
              selectedCv
                ? (selectedCvStateMessage ?? t("noStrengths"))
                : insightEmpty
            }
            viewAllLabel={t("viewAll")}
            className="bg-linear-to-br from-primary/5 to-background dark:from-sky/10 dark:to-background"
            iconClassName="text-primary dark:text-sky"
            iconWrapClassName="bg-primary/10 dark:bg-sky/10"
            itemAccentClassName="border-l-primary dark:border-l-sky"
          />
          <InsightCard
            title={t("weaknesses")}
            icon={IconAlertTriangle}
            items={selectedAnalysis?.weaknesses ?? []}
            emptyText={
              selectedCv
                ? (selectedCvStateMessage ?? t("noWeaknesses"))
                : insightEmpty
            }
            viewAllLabel={t("viewAll")}
            className="bg-linear-to-br from-amber-500/5 to-background"
            iconClassName="text-amber-600 dark:text-amber-400"
            iconWrapClassName="bg-amber-500/10"
            itemAccentClassName="border-l-amber-500"
          />
          <InsightCard
            title={t("suggestions")}
            icon={IconBulb}
            items={selectedAnalysis?.suggestions ?? []}
            emptyText={
              selectedCv
                ? (selectedCvStateMessage ?? t("noSuggestions"))
                : insightEmpty
            }
            viewAllLabel={t("viewAll")}
            className="bg-linear-to-br from-violet-500/5 to-background"
            iconClassName="text-violet-600 dark:text-violet-400"
            iconWrapClassName="bg-violet-500/10"
            itemAccentClassName="border-l-violet-500"
          />
          <AtsInsightCard
            title={t("atsScoreLabel")}
            score={selectedAts}
            emptyText={
              selectedCv
                ? (selectedCvStateMessage ?? t("noAnalysisYet"))
                : insightEmpty
            }
            className="bg-linear-to-br from-emerald-500/5 to-background"
          />
        </div>

        {/* CV data sections */}
        <Card className="border-border/60 bg-canvas shadow-md dark:border-border/40">
          <CardHeader className="border-b border-border/60 px-6 py-4 dark:border-border/40">
            <CardTitle className="text-base">{t("cvDataTitle")}</CardTitle>
            <CardDescription className="text-xs">
              {t("cvDataHint")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <CvDataSection
                title={t("cvSections.certifications")}
                icon={IconCheck}
                action={
                  selectedCvSections.certifications.length > 0 ? (
                    <CvInsightDialog
                      title={t("cvSections.certifications")}
                      description={selectedCvTitle}
                      triggerLabel={t("viewAll")}
                      triggerClassName={cvDataActionClassName}
                      content={
                        <div className="space-y-3">
                          {selectedCvSections.certifications.map(
                            (item, index) => (
                              <div
                                key={`${item.name ?? item.issuer ?? "cert-full"}-${index}`}
                                className="rounded-xl border border-border/60 bg-muted/20 p-4"
                              >
                                <p className="text-sm font-semibold text-foreground">
                                  {item.name ?? t("cvDataUnknown")}
                                </p>
                                {item.issuer || item.date ? (
                                  <p className="mt-1.5 text-sm text-muted-foreground">
                                    {[item.issuer, item.date]
                                      .filter(Boolean)
                                      .join(" • ")}
                                  </p>
                                ) : null}
                              </div>
                            ),
                          )}
                        </div>
                      }
                    />
                  ) : null
                }
              >
                {selectedCvSections.certifications.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCvSections.certifications
                      .slice(0, 3)
                      .map((item, index) => (
                        <div
                          key={`${item.name ?? item.issuer ?? "cert"}-${index}`}
                          className="rounded-xl border border-border/40 bg-background/80 px-3 py-3"
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {item.name ?? t("cvDataUnknown")}
                          </p>
                          {item.issuer || item.date ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {[item.issuer, item.date]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          ) : null}
                        </div>
                      ))}
                  </div>
                ) : (
                  <CvSectionPlaceholder
                    text={selectedCvStateMessage ?? t("cvEmpty.certifications")}
                    example={t("cvExamples.certifications")}
                  />
                )}
              </CvDataSection>

              <CvDataSection
                title={t("cvSections.experience")}
                icon={IconTrendingUp}
                action={
                  selectedCvSections.experience.length > 0 ? (
                    <CvInsightDialog
                      title={t("cvSections.experience")}
                      description={selectedCvTitle}
                      triggerLabel={t("viewAll")}
                      triggerClassName={cvDataActionClassName}
                      content={
                        <div className="space-y-3">
                          {selectedCvSections.experience.map((item, index) => (
                            <div
                              key={`${item.role ?? item.company ?? "experience-full"}-${index}`}
                              className="rounded-xl border border-border/60 bg-muted/20 p-4"
                            >
                              <p className="text-sm font-semibold text-foreground">
                                {item.role ?? t("cvDataUnknown")}
                              </p>
                              {(item.company || item.duration) && (
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                  {[item.company, item.duration]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </p>
                              )}
                              {item.description ? (
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                  {item.description}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      }
                    />
                  ) : null
                }
              >
                {selectedCvSections.experience.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCvSections.experience
                      .slice(0, 3)
                      .map((item, index) => (
                        <div
                          key={`${item.role ?? item.company ?? "experience"}-${index}`}
                          className="rounded-xl border border-border/40 bg-background/80 px-3 py-3"
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {item.role ?? t("cvDataUnknown")}
                          </p>
                          {(item.company || item.duration) && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {[item.company, item.duration]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          )}
                          {item.description ? (
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                      ))}
                  </div>
                ) : (
                  <CvSectionPlaceholder
                    text={selectedCvStateMessage ?? t("cvEmpty.experience")}
                    example={t("cvExamples.experience")}
                  />
                )}
              </CvDataSection>

              <CvDataSection
                title={t("cvSections.education")}
                icon={IconUser}
                action={
                  selectedCvSections.education.length > 0 ? (
                    <CvInsightDialog
                      title={t("cvSections.education")}
                      description={selectedCvTitle}
                      triggerLabel={t("viewAll")}
                      triggerClassName={cvDataActionClassName}
                      content={
                        <div className="space-y-3">
                          {selectedCvSections.education.map((item, index) => (
                            <div
                              key={`${item.degree ?? item.institution ?? "education-full"}-${index}`}
                              className="rounded-xl border border-border/60 bg-muted/20 p-4"
                            >
                              <p className="text-sm font-semibold text-foreground">
                                {item.degree ?? t("cvDataUnknown")}
                              </p>
                              {item.institution ? (
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                  {item.institution}
                                </p>
                              ) : null}
                              {item.year ? (
                                <p className="mt-3 text-xs font-medium text-muted-foreground">
                                  {item.year}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      }
                    />
                  ) : null
                }
              >
                {selectedCvSections.education.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCvSections.education
                      .slice(0, 3)
                      .map((item, index) => (
                        <div
                          key={`${item.degree ?? item.institution ?? "education"}-${index}`}
                          className="rounded-xl border border-border/40 bg-background/80 px-3 py-3"
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {item.degree ?? t("cvDataUnknown")}
                          </p>
                          {item.institution ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.institution}
                            </p>
                          ) : null}
                          {item.year ? (
                            <p className="mt-2 text-xs font-medium text-muted-foreground">
                              {item.year}
                            </p>
                          ) : null}
                        </div>
                      ))}
                  </div>
                ) : (
                  <CvSectionPlaceholder
                    text={selectedCvStateMessage ?? t("cvEmpty.education")}
                    example={t("cvExamples.education")}
                  />
                )}
              </CvDataSection>

              <CvDataSection
                title={t("cvSections.projects")}
                icon={IconFileText}
                action={
                  selectedCvSections.projects.length > 0 ? (
                    <CvInsightDialog
                      title={t("cvSections.projects")}
                      description={selectedCvTitle}
                      triggerLabel={t("viewAll")}
                      triggerClassName={cvDataActionClassName}
                      content={
                        <div className="space-y-3">
                          {selectedCvSections.projects.map((item, index) => (
                            <div
                              key={`${item.name ?? item.description ?? "project-full"}-${index}`}
                              className="rounded-xl border border-border/60 bg-muted/20 p-4"
                            >
                              <p className="text-sm font-semibold text-foreground">
                                {item.name ?? t("cvDataUnknown")}
                              </p>
                              {item.description ? (
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                  {item.description}
                                </p>
                              ) : null}
                              {item.technologies.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {item.technologies.map((tech) => (
                                    <span
                                      key={tech}
                                      className="rounded-lg border border-border/40 bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      }
                    />
                  ) : null
                }
              >
                {selectedCvSections.projects.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCvSections.projects
                      .slice(0, 2)
                      .map((item, index) => (
                        <div
                          key={`${item.name ?? item.description ?? "project"}-${index}`}
                          className="rounded-xl border border-border/40 bg-background/80 px-3 py-3"
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {item.name ?? t("cvDataUnknown")}
                          </p>
                          {item.description ? (
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                              {item.description}
                            </p>
                          ) : null}
                          {item.technologies.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className="rounded-lg border border-border/40 bg-muted/30 px-2 py-1 text-[11px] font-medium text-muted-foreground"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                  </div>
                ) : (
                  <CvSectionPlaceholder
                    text={selectedCvStateMessage ?? t("cvEmpty.projects")}
                    example={t("cvExamples.projects")}
                  />
                )}
              </CvDataSection>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="border-border/60 bg-canvas shadow-md dark:border-border/40">
            <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
              <CardTitle className="text-base">{t("myCvs")}</CardTitle>
              <CardDescription className="text-xs">
                {t("myCvsHint")}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-4 pb-4">
              {isCvsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <ScaleLoader size="md" />
                </div>
              ) : cvs.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
                  <IconFileText className="size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">{t("noCvsYet")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("noCvsHint")}
                  </p>
                </div>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {cvs.map((cv, index) => (
                    <CvListItem
                      key={getCvId(cv, index)}
                      cv={cv}
                      isSelected={selectedCvId === getCvId(cv, index)}
                      locale={locale}
                      t={t}
                      onSelect={() => setSelectedCvId(getCvId(cv, index))}
                      onDelete={() => setPendingDeleteCv(cv)}
                      isDeleting={
                        isDeletingCv && deletingCvId === (cv._id ?? cv.id)
                      }
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-canvas shadow-md dark:border-border/40">
            <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
              <CardTitle className="text-base">{t("cvSummary")}</CardTitle>
              <CardDescription className="text-xs">
                {t("cvSummaryHint")}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-4 pb-4">
              <CvSummaryPanel
                cv={selectedCv}
                locale={locale}
                t={t}
                isLoading={isCvsLoading}
                userEmail={user?.email}
              />
            </CardContent>
          </Card>
        </div>

        {/* Profile Settings Section */}
        <Card className="border-border/60 bg-canvas shadow-md dark:border-border/40">
          <CardHeader className="border-b border-border/60 px-6 py-4 dark:border-border/40">
            <CardTitle className="text-base">{t("accountSettings")}</CardTitle>
            <CardDescription className="text-xs">
              {t("personalInfoHint")}
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
                    {t("photoHint")}
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
                      {t("choosePhoto")}
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
                          {t("deletePhoto") || "Delete Photo"}
                        </Button>
                      )}
                  </div>

                  {hasAvatarChange && (
                    <Button
                      type="button"
                      size="sm"
                      className="w-full rounded-xl bg-primary text-white hover:bg-primary/95 dark:bg-sky/40 dark:text-zinc-200 dark:hover:bg-sky/60"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(
                          (values) => submitProfileUpdate(values, ["avatar"]),
                          (errs) => {
                            console.error(
                              "Profile avatar form validation errors:",
                              errs,
                            );
                            if (errs.avatar?.message) {
                              toast.error(String(errs.avatar.message));
                            }
                          },
                        )(e);
                      }}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <ScaleLoader
                            size="sm"
                            className="text-white dark:text-sky"
                          />
                          <span className="ml-1.5">{t("saving")}</span>
                        </>
                      ) : (
                        t("savePhoto")
                      )}
                    </Button>
                  )}
                </div>
                {isPending && uploadProgress !== null ? (
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        {uploadProgress < 100
                          ? t("uploadingPhoto")
                          : t("processingPhoto")}
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
                  <p className="text-xs text-destructive">
                    {String(errors.avatar.message ?? "Error")}
                  </p>
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
                    (errs) => {
                      console.error(
                        "Profile name form validation errors:",
                        errs,
                      );
                      const firstError =
                        errs.name?.en?.message || errs.name?.ar?.message;
                      if (firstError) {
                        toast.error(String(firstError));
                      }
                    },
                  )(e);
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name-en">{tRegister("englishName")}</Label>
                    <Input
                      id="name-en"
                      autoComplete="off"
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
                    <Label htmlFor="name-ar">{tRegister("arabicName")}</Label>
                    <Input
                      id="name-ar"
                      autoComplete="off"
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
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
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
                    className="w-full sm:w-auto px-6 h-10 rounded-xl bg-primary text-white hover:bg-primary/95 dark:bg-sky/40 dark:text-zinc-200 dark:hover:bg-sky/60"
                  >
                    {isPending ? (
                      <>
                        <ScaleLoader
                          size="sm"
                          className="text-white dark:text-sky"
                        />
                        <span className="ml-2">{t("saving")}</span>
                      </>
                    ) : (
                      t("saveName")
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Change password section */}
        <Card className="border-border/60 bg-canvas shadow-md dark:border-border/40">
          <CardHeader className="border-b border-border/60 px-4 py-3 dark:border-border/40">
            <CardTitle className="text-base">{t("changePassword")}</CardTitle>
            <CardDescription className="text-xs">
              {t("changePasswordHint")}
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
                    {t("currentPassword")}
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
                  <Label htmlFor="newPassword">{t("newPassword")}</Label>
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
                    {t("confirmPassword")}
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
                  className="w-full sm:w-auto px-6 h-10 rounded-xl bg-primary text-white hover:bg-primary/95 dark:bg-sky/40 dark:text-zinc-200 dark:hover:bg-sky/60"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <ScaleLoader
                        size="sm"
                        className="text-white dark:text-sky"
                      />
                      <span className="ml-2">{t("updatingPassword")}</span>
                    </>
                  ) : (
                    t("updatePassword")
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={Boolean(pendingDeleteCv)}
        onOpenChange={(open) => {
          if (!open && !isDeletingCv) {
            setPendingDeleteCv(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <IconAlertTriangle className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>{t("deleteCvConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCvDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCv}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeletingCv}
              onClick={(event) => {
                event.preventDefault();
                void confirmDeleteCv();
              }}
            >
              {isDeletingCv ? (
                <ScaleLoader size="sm" />
              ) : (
                <IconTrash className="size-4" />
              )}
              {isDeletingCv ? t("deletingCv") : t("deleteCv")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CvListItem({
  cv,
  isSelected,
  locale,
  t,
  onSelect,
  onDelete,
  isDeleting,
}: {
  cv: UserCv;
  isSelected: boolean;
  locale: string;
  t: ReturnType<typeof useTranslations<"profile">>;
  onSelect: () => void;
  onDelete: () => void | Promise<void>;
  isDeleting: boolean;
}) {
  const title = getCvTitle(cv);
  const fileType = getCvFileType(cv);
  const uploadedAt = formatDate(cv.createdAt ?? cv.updatedAt, locale);
  const cvUrl = getCvUrl(cv);

  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-3 transition-colors",
        isSelected
          ? "border-primary/40 bg-primary/5 dark:border-sky/40 dark:bg-sky/5"
          : "border-border/60 bg-card dark:border-border/40",
      )}
    >
      {/* Row 1 — icon + name */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-sky/10 dark:text-sky">
          <IconFileText className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">
            {fileType?.toUpperCase() ?? t("cvs")}
            {uploadedAt ? ` · ${uploadedAt}` : ""}
          </p>
        </div>
      </div>

      {/* Row 2 — buttons */}
      <div className="flex gap-1.5">
        <Button
          type="button"
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="rounded-lg flex-1 text-xs"
          onClick={onSelect}
        >
          {t("details")}
        </Button>
        {cvUrl ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-lg flex-1 text-xs"
          >
            <a href={cvUrl} target="_blank" rel="noreferrer">
              {t("reviewCv")}
            </a>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="rounded-lg px-2.5"
          onClick={() => void onDelete()}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ScaleLoader size="sm" />
          ) : (
            <IconTrash className="size-4" />
          )}
          {isDeleting ? t("deletingCv") : t("deleteCv")}
        </Button>
      </div>
    </li>
  );
}

function CvSummaryPanel({
  cv,
  locale,
  t,
  isLoading,
  userEmail,
}: {
  cv: UserCv | null;
  locale: string;
  t: ReturnType<typeof useTranslations<"profile">>;
  isLoading: boolean;
  userEmail?: string;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <ScaleLoader size="md" />
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
        <IconFileText className="size-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{t("noCvSelected")}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("selectCvHint")}
        </p>
      </div>
    );
  }

  const analysis = getCvAnalysis(cv);
  // const hasAnalysis = hasCvAnalysisResults(cv);
  const statusMessage = getCvAnalysisStateMessage(cv, t);
  const title = getCvTitle(cv);
  const cvUrl = getCvUrl(cv);
  const cvContact = cv.contact as Record<string, unknown> | undefined;
  const cvPhone =
    cv.phone ?? analysis.phone ?? (cvContact?.phone as string | undefined);
  const cvLinkedin =
    cv.linkedin ??
    analysis.linkedin ??
    (cvContact?.linkedin as string | undefined);
  const cvGithub =
    cv.github ?? analysis.github ?? (cvContact?.github as string | undefined);
  const cvLocation =
    cv.location ??
    analysis.location ??
    (cvContact?.location as string | undefined);
  const uploadedAt = formatDate(cv.createdAt ?? cv.updatedAt, locale);
  const summary = analysis.summary;
  const summaryPreview =
    summary && summary.length > 220
      ? `${summary.slice(0, 220).trim()}…`
      : summary;

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
          {summaryPreview ?? statusMessage ?? t("noSummary")}
        </p>
        {summary ? (
          <div className="mt-3">
            <CvInsightDialog
              title={t("fullSummaryTitle")}
              description={title}
              triggerLabel={t("readFullSummary")}
              bodyText={summary}
              triggerClassName="text-primary hover:text-primary/80 hover:underline dark:text-sky dark:hover:text-sky/80"
            />
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-border/50 bg-background/60 p-4 dark:border-border/30">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary dark:text-sky">
          <IconMail className="size-3.5" />
          {t("contactInfo")}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {userEmail ? (
            <div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-muted/10 p-2.5">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                <IconMail size={12} />
                {t("emailLabel")}
              </span>
              <a
                href={`mailto:${userEmail}`}
                className="truncate text-xs font-medium text-foreground hover:text-primary dark:hover:text-sky hover:underline"
              >
                {userEmail}
              </a>
            </div>
          ) : null}

          {cvPhone ? (
            <div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-muted/10 p-2.5">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                <IconPhone size={12} />
                {t("phoneLabel")}
              </span>
              <a
                href={`tel:${cvPhone}`}
                className="truncate text-xs font-medium text-foreground hover:text-primary dark:hover:text-sky hover:underline"
              >
                {cvPhone}
              </a>
            </div>
          ) : null}

          {cvLinkedin ? (
            <div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-muted/10 p-2.5">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                <IconBrandLinkedin size={12} className="text-sky" />
                {t("linkedinLabel")}
              </span>
              <a
                href={ensureAbsoluteUrl(cvLinkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-xs font-medium text-foreground hover:text-primary dark:hover:text-sky hover:underline"
              >
                LinkedIn
              </a>
            </div>
          ) : null}

          {cvGithub ? (
            <div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-muted/10 p-2.5">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                <IconBrandGithub size={12} />
                {t("githubLabel")}
              </span>
              <a
                href={ensureAbsoluteUrl(cvGithub)}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-xs font-medium text-foreground hover:text-primary dark:hover:text-sky hover:underline"
              >
                GitHub
              </a>
            </div>
          ) : null}

          {cvLocation ? (
            <div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-muted/10 p-2.5">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                <IconMapPin size={12} />
                {t("locationLabel")}
              </span>
              <span className="truncate text-xs font-medium text-foreground">
                {cvLocation}
              </span>
            </div>
          ) : null}

          {cvUrl ? (
            <div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-muted/10 p-2.5">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                <IconFileText size={12} />
                {t("cvFileLabel")}
              </span>
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary dark:hover:text-sky hover:underline"
              >
                <span className="truncate">{title || t("viewCv")}</span>
                <IconExternalLink className="size-3 shrink-0" />
              </a>
            </div>
          ) : null}
        </div>
      </div>
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
        <ScaleLoader size="md" />
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
        <IconFileText className="size-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{t("noCvSelected")}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("selectCvHint")}
        </p>
      </div>
    );
  }

  const analysis = getCvAnalysis(cv);
  const hasAnalysis = hasCvAnalysisResults(cv);
  const statusMessage = getCvAnalysisStateMessage(cv, t);

  if (!hasAnalysis || analysis.suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
        <IconBulb className="size-8 text-violet-500/70" />
        <p className="mt-3 text-sm font-medium">
          {statusMessage ?? t("noSuggestions")}
        </p>
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
