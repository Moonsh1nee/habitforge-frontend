"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { Flame, CheckSquare, Dumbbell, Smile } from "lucide-react";
import type { WeekStats } from "@/types";

interface WeeklyStatsProps {
  week?: WeekStats;
}

export function WeeklyStats({ week }: WeeklyStatsProps) {
  if (!week) return null;

  const stats = [
    {
      icon: CheckSquare,
      label: "Задачи",
      value: week.tasks_completed ?? 0,
      suffix: `/${week.tasks_total ?? 0}`,
      color: "text-primary",
    },
    {
      icon: Flame,
      label: "Привычки",
      value: week.habits_completion_rate ?? 0,
      suffix: "%",
      color: "text-warning",
    },
    {
      icon: Dumbbell,
      label: "Тренировки",
      value: week.workouts_count ?? 0,
      suffix: " раз",
      color: "text-accent",
    },
    {
      icon: Smile,
      label: "Настроение",
      value: week.avg_mood ?? 0,
      suffix: "/10",
      color: "text-success",
      decimals: 1,
    },
  ];

  return (
    <GlassCard className="col-span-2">
      <h3 className="font-semibold text-text mb-4">Неделя</h3>
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, suffix, color, decimals }) => (
          <div key={label} className="text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <div className="text-xl font-bold text-text">
              <AnimatedNumber value={value} decimals={decimals ?? 0} suffix={suffix} />
            </div>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
