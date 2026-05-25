"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import type { NutritionSummary } from "@/types";

interface MacroBarProps {
  nutrition?: NutritionSummary;
  targets?: { calories: number; protein: number; carbs: number; fat: number };
}

export function MacroBar({ nutrition, targets }: MacroBarProps) {
  if (!nutrition) {
    return (
      <GlassCard>
        <h3 className="font-semibold text-text mb-3">Питание сегодня</h3>
        <p className="text-sm text-muted">Нет данных</p>
      </GlassCard>
    );
  }

  const macros = [
    {
      label: "Калории",
      value: nutrition.calories,
      target: targets?.calories ?? 2000,
      color: "var(--color-warning)",
      unit: "ккал",
    },
    {
      label: "Белки",
      value: nutrition.protein,
      target: targets?.protein ?? 150,
      color: "var(--color-primary)",
      unit: "г",
    },
    {
      label: "Углеводы",
      value: nutrition.carbs,
      target: targets?.carbs ?? 250,
      color: "var(--color-accent)",
      unit: "г",
    },
    {
      label: "Жиры",
      value: nutrition.fat,
      target: targets?.fat ?? 70,
      color: "var(--color-success)",
      unit: "г",
    },
  ];

  return (
    <GlassCard>
      <h3 className="font-semibold text-text mb-4">Питание сегодня</h3>
      <div className="space-y-3">
        {macros.map(({ label, value, target, color, unit }) => {
          const pct = Math.min((value / target) * 100, 100);
          return (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">{label}</span>
                <span className="text-text/80">
                  <AnimatedNumber value={value} decimals={0} suffix={` / ${target} ${unit}`} />
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
