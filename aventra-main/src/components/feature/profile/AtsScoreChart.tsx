"use client";

import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useIsDark } from "@/hooks/isDark";
import { cn } from "@/lib/utils";

const chartConfig = {
  score: {
    label: "ATS score",
    color: "currentColor",
  },
  remaining: {
    label: "Remaining",
    color: "currentColor",
  },
} satisfies ChartConfig;

export function getAtsScoreColor(score: number, isDark = false): string {
  if (score > 80) return isDark ? "#06b6d4" : "#1d4ed8";
  if (score > 60) return "#10b981";
  return "#f59e0b";
}

type AtsScoreChartProps = {
  score: number;
  className?: string;
  size?: "md" | "lg";
};

export function AtsScoreChart({
  score,
  className,
  size = "md",
}: AtsScoreChartProps) {
  const isDark = useIsDark();
  const safeScore = Math.min(100, Math.max(0, score));
  const scoreColor = getAtsScoreColor(safeScore, isDark);
  const remainingColor = isDark
    ? "rgba(148, 163, 184, 0.22)"
    : "rgba(226, 232, 240, 0.95)";

  const data = [
    { key: "score", value: safeScore, fill: scoreColor },
    { key: "remaining", value: 100 - safeScore, fill: remainingColor },
  ];

  const chartSize = size === "lg" ? "size-44 sm:size-48" : "size-28";
  const scoreText = size === "lg" ? "text-3xl sm:text-4xl" : "text-xl";
  const suffixText = size === "lg" ? "text-xs" : "text-[10px]";

  return (
    <div className={cn(className)}>
      <div className={cn("relative mx-auto", chartSize)}>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="key"
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            dir="ltr"
            className={cn("font-bold leading-none", scoreText)}
            style={{ color: scoreColor }}
          >
            {safeScore}
          </span>
          <span
            dir="ltr"
            className={cn("mt-1 leading-none text-muted-foreground", suffixText)}
          >
            /100
          </span>
        </div>
      </div>
    </div>
  );
}
