import toast from "react-hot-toast";
import { CheckCircle2, XCircle } from "lucide-react";

export const appToast = {
  success(message: string) {
    toast.custom((t) => (
      <div
        className={`${
          t.visible
            ? "animate-in slide-in-from-right-5 fade-in"
            : "animate-out slide-out-to-right-5 fade-out"
        }
        flex w-[380px] items-center gap-3 rounded-2xl
        border border-[#DCE7FF]
        bg-white/90
        p-4
        shadow-2xl
        shadow-[#4F7CFF]/15
        backdrop-blur-xl
        dark:border-[#4F7CFF]/20
        dark:bg-[#0B1220]/90`}
      >
        <CheckCircle2 className="h-6 w-6 shrink-0 text-[#4F7CFF]" />

        <p className="flex-1 text-sm font-semibold text-slate-900 dark:text-white">
          {message}
        </p>
      </div>
    ));
  },

  error(message: string) {
    toast.custom((t) => (
      <div
        className={`${
          t.visible
            ? "animate-in slide-in-from-right-5 fade-in"
            : "animate-out slide-out-to-right-5 fade-out"
        }
        flex w-[380px] items-center gap-3 rounded-2xl
        border border-red-200
        bg-white/90
        p-4
        shadow-2xl
        shadow-red-500/10
        backdrop-blur-xl
        dark:border-red-500/20
        dark:bg-[#0B1220]/90`}
      >
        <XCircle className="h-6 w-6 shrink-0 text-red-500" />

        <p className="flex-1 text-sm font-semibold text-slate-900 dark:text-white">
          {message}
        </p>
      </div>
    ));
  },
};