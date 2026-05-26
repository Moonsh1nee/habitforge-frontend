"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";

interface MacroBarProps {
  calories?: number;
  targets?: { calories: number };
}

export function MacroBar({ calories = 0, targets }: MacroBarProps) {
  const target = targets?.calories ?? 2000;
  const pct = Math.min((calories / target) * 100, 100);

  return (
    <GlassCard>
      <h3 className="font-semibold text-text mb-4">Питание сегодня</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted">Калории</span>
            <span className="text-text/80">
              <AnimatedNumber value={calories} decimals={0} suffix={` / ${target} ккал`} />
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: "var(--color-warning)" }}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
