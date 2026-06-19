"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LimitBadgeProps {
  current: number;
  max: number;
  label?: string;
  className?: string;
}

export function LimitBadge({ current, max, label, className }: LimitBadgeProps) {
  if (current < max * 0.8) return null;

  const isAtLimit = current >= max;
  const percent = Math.min((current / max) * 100, 100);

  return (
    <Link
      href="/upgrade"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
        isAtLimit
          ? "bg-danger/15 text-danger hover:bg-danger/25"
          : "bg-warning/10 text-warning hover:bg-warning/20",
        className
      )}
      title={`${current} из ${max}${label ? ` ${label}` : ""} — нажмите чтобы увидеть Pro`}
    >
      <span className="tabular-nums">
        {current}/{max}
      </span>
      {label && <span className="opacity-80">{label}</span>}
      {isAtLimit && <span>• Лимит</span>}
    </Link>
  );
}
