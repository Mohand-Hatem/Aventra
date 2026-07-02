"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CvInsightItem } from "@/types/cv";
import { cn } from "@/lib/utils";

type CvInsightDialogProps = {
  title: string;
  description?: string;
  triggerLabel: string;
  children?: ReactNode;
  items?: CvInsightItem[];
  bodyText?: string;
  triggerClassName?: string;
  variant?: "link" | "footer";
};

export function CvInsightDialog({
  title,
  description,
  triggerLabel,
  children,
  items,
  bodyText,
  triggerClassName,
  variant = "link",
}: CvInsightDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button
            type="button"
            variant={variant === "footer" ? "outline" : "link"}
            size="sm"
            className={cn(
              variant === "footer"
                ? "mt-3 h-9 w-full rounded-xl text-xs font-semibold"
                : "h-auto p-0 text-xs font-semibold",
              triggerClassName,
            )}
          >
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-sm">{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {bodyText ? (
          <p className="text-sm leading-7 text-foreground/90 whitespace-pre-line">
            {bodyText}
          </p>
        ) : null}
        {items && items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="rounded-xl border border-border/60 bg-muted/20 p-4"
              >
                {item.title ? (
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                ) : null}
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
