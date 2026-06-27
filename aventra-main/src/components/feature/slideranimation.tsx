"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Marqee from "../shared/marqee";
import {
  IconSparkles,
  IconCheck,
  IconBriefcase,
  IconChartBar,
  IconSearch,
  IconTrendingUp,
  IconUsers,
  IconFileText,
  IconRobot,
  IconStar,
  IconBuildingSkyscraper,
  IconTargetArrow,
} from "@tabler/icons-react";

type BadgeVariant = "b2c" | "b2b" | "stat" | "ats";

const iconMap: Record<number, React.ReactNode> = {
  0: <IconChartBar className="size-3.5" />,
  1: <IconCheck className="size-3.5" />,
  2: <IconFileText className="size-3.5" />,
  3: <IconSparkles className="size-3.5" />,
  4: <IconTargetArrow className="size-3.5" />,
  5: <IconTrendingUp className="size-3.5" />,
  6: <IconBuildingSkyscraper className="size-3.5" />,
  7: <IconSearch className="size-3.5" />,
  8: <IconRobot className="size-3.5" />,
  9: <IconUsers className="size-3.5" />,
  10: <IconStar className="size-3.5" />,
  11: <IconBriefcase className="size-3.5" />,
  12: <IconCheck className="size-3.5" />,
  13: <IconBuildingSkyscraper className="size-3.5" />,
};

const variantStyles: Record<BadgeVariant, string> = {
  ats: "border-primary/30 bg-primary/10 text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky",
  b2c: "border-chart-1/40 bg-chart-1/10 text-chart-3 dark:border-chart-1/50 dark:bg-chart-1/15 dark:text-chart-1",
  b2b: "border-chart-3/40 bg-chart-3/10 text-chart-5 dark:border-chart-2/40 dark:bg-chart-2/10 dark:text-chart-2",
  stat: "border-border bg-muted text-muted-foreground",
};

function Dot({ variant }: { variant: BadgeVariant }) {
  const dotColors: Record<BadgeVariant, string> = {
    ats: "bg-primary dark:bg-sky",
    b2c: "bg-chart-1",
    b2b: "bg-chart-3 dark:bg-chart-2",
    stat: "bg-muted-foreground",
  };
  return <span className={`size-1.5 shrink-0 rounded-full ${dotColors[variant]}`} />;
}

function Separator() {
  return (
    <span className="mx-4 flex items-center opacity-30">
      <span className="h-4 w-px bg-border" />
    </span>
  );
}

function Badge({
  icon,
  label,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  variant: BadgeVariant;
}) {
  return (
    <span
      dir="auto"
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium leading-none ${variantStyles[variant]}`}
    >
      <Dot variant={variant} />
      {icon}
      {label}
    </span>
  );
}

export default function SliderAnimation() {
  const t = useTranslations("marquee");
  const items = t.raw("items") as Array<{ label: string; variant: BadgeVariant }>;

  return (
    <div className="w-full border-y border-border/50 bg-background/80 py-3 backdrop-blur-sm">
      <Marqee>
        <div className="flex items-center gap-0">
          {items.map((item, i) => (
            <React.Fragment key={i}>
              <Badge icon={iconMap[i]} label={item.label} variant={item.variant} />
              <Separator />
            </React.Fragment>
          ))}
        </div>
      </Marqee>
    </div>
  );
}
