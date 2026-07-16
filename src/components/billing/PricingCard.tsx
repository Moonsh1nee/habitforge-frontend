"use client";

import { Check, X, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Feature {
  label: string;
  included: boolean;
}

interface PricingCardProps {
  plan: "free" | "pro";
  price: string;
  period?: string;
  features: Feature[];
  highlighted?: boolean;
  onUpgrade?: () => void;
  isLoading?: boolean;
}

export function PricingCard({
  plan,
  price,
  period = "/мес",
  features,
  highlighted = false,
  onUpgrade,
  isLoading = false,
}: PricingCardProps) {
  const isPro = plan === "pro";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isPro ? 0.1 : 0 }}
      className={cn(
        "glass p-6 rounded-2xl flex flex-col gap-5 relative",
        highlighted && "ring-1 ring-primary/40"
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
            Популярный
          </span>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-1">
          {isPro && <Sparkles size={16} className="text-primary" />}
          <h3 className="text-lg font-bold text-text capitalize">{plan === "free" ? "Free" : "Pro"}</h3>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-text tabular-nums">{price}</span>
          <span className="text-muted text-sm mb-0.5">{period}</span>
        </div>
      </div>

      <ul className="space-y-3 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm">
            {f.included ? (
              <Check size={15} className="text-success shrink-0" />
            ) : (
              <X size={15} className="text-muted/50 shrink-0" />
            )}
            <span className={f.included ? "text-text" : "text-muted"}>{f.label}</span>
          </li>
        ))}
      </ul>

      {isPro ? (
        <Button
          onClick={onUpgrade}
          disabled={isLoading}
          className="bg-primary text-white w-full gap-2"
        >
          {isLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Sparkles size={15} />
          )}
          Начать с Pro
        </Button>
      ) : (
        <Button variant="outline" className="w-full border-border text-muted" disabled>
          Текущий план
        </Button>
      )}
    </motion.div>
  );
}
