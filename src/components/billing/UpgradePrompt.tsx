"use client";

import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UpgradePromptProps {
  title: string;
  description: string;
  className?: string;
  variant?: "warning" | "primary";
}

export function UpgradePrompt({
  title,
  description,
  className,
  variant = "warning",
}: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "glass p-4 flex items-center gap-4 border-l-2",
            variant === "warning" ? "border-l-warning" : "border-l-primary",
            className
          )}
        >
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
              variant === "warning" ? "bg-warning/10" : "bg-primary/10"
            )}
          >
            <Sparkles
              size={17}
              className={variant === "warning" ? "text-warning" : "text-primary"}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text">{title}</p>
            <p className="text-xs text-muted mt-0.5">{description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/upgrade"
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
            >
              Посмотреть Pro →
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-muted hover:text-text transition-colors"
              aria-label="Закрыть"
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
