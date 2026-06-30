"use client";

import { ScaleLoader as BaseScaleLoader } from "react-spinners";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { height: 12, width: 2, radius: 2, margin: 1 },
  md: { height: 20, width: 3, radius: 2, margin: 2 },
  lg: { height: 35, width: 4, radius: 2, margin: 2 },
} as const;

type ScaleLoaderProps = {
  size?: keyof typeof SIZES;
  color?: string;
  className?: string;
};

export function ScaleLoader({
  size = "md",
  color = "currentColor",
  className,
}: ScaleLoaderProps) {
  const dims = SIZES[size];

  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      role="status"
      aria-label="Loading"
    >
      <BaseScaleLoader
        color={color}
        height={dims.height}
        width={dims.width}
        radius={dims.radius}
        margin={dims.margin}
      />
    </span>
  );
}
