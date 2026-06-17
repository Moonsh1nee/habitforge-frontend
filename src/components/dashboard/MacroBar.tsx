"use client";

import { motion } from "motion/react";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface MacroBarProps {
  calories?: number;
  targets?: { calories: number };
}

export function MacroBar({ calories = 0, targets }: MacroBarProps) {
  const target = targets?.calories ?? 2000;
  const pct = Math.min((calories / target) * 100, 100);
  const isOver = calories > target;

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
          <Utensils size={13} className="text-warning" />
        </div>
        <h3 className="text-sm font-semibold text-text">Питание</h3>
      </div>

      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className={cn("text-xl font-bold tabular-nums", isOver ? "text-danger" : "text-warning")}>
              <AnimatedNumber value={calories} decimals={0} />
            </span>
            <span className="text-xs text-muted">/ {target} ккал</span>
          </div>

          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: isOver ? "var(--color-danger)" : "var(--color-warning)" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>

          <p className="text-[10px] text-muted mt-1 text-right">
            {calories === 0 ? "данных нет" : isOver ? `+${calories - target} сверх нормы` : `${target - calories} до нормы`}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
