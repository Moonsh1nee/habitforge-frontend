"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type InsightVariant = "success" | "warning" | "primary" | "accent";

export interface Insight {
  id: string;
  variant: InsightVariant;
  emoji: string;
  title: string;
  description?: string;
}

const BORDER_COLORS: Record<InsightVariant, string> = {
  success: "border-l-success",
  warning: "border-l-warning",
  primary: "border-l-primary",
  accent:  "border-l-accent",
};

const TEXT_COLORS: Record<InsightVariant, string> = {
  success: "text-success",
  warning: "text-warning",
  primary: "text-primary",
  accent:  "text-accent",
};

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className={cn(
        "glass p-4 flex items-start gap-3 border-l-2",
        BORDER_COLORS[insight.variant]
      )}
    >
      <span className="text-xl leading-none mt-0.5 shrink-0">{insight.emoji}</span>
      <div className="min-w-0">
        <p className={cn("text-sm font-semibold", TEXT_COLORS[insight.variant])}>
          {insight.title}
        </p>
        {insight.description && (
          <p className="text-xs text-muted mt-0.5">{insight.description}</p>
        )}
      </div>
    </motion.div>
  );
}
