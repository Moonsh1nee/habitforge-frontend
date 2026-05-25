"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { Flame, CheckSquare, Dumbbell, Smile } from "lucide-react";
import type { DashboardWeek } from "@/types";

interface WeeklyStatsProps {
  week?: DashboardWeek;
}

export function WeeklyStats({ week }: WeeklyStatsProps) {
  if (!week) return null;

  const tasksCompleted = week.tasks?.completed ?? 0;
  const tasksTotal = week.tasks?.total ?? 0;
  const habits = week.habits ?? [];
  const avgHabitRate =
    habits.length > 0
      ? Math.round(
          habits.reduce((acc, h) => acc + (h.completionRate ?? 0), 0) /
            habits.length
        )
      : 0;

  const stats = [
    {
      icon: CheckSquare,
      label: "Задачи",
      value: tasksCompleted,
      suffix: `/${tasksTotal}`,
      color: "text-primary",
    },
    {
      icon: Flame,
      label: "Привычки",
      value: avgHabitRate,
      suffix: "%",
      color: "text-warning",
    },
    {
      icon: Dumbbell,
      label: "Тренировки",
      value: week.workouts ?? 0,
      suffix: " раз",
      color: "text-accent",
    },
    {
      icon: Smile,
      label: "Настроение",
      value: week.journal?.avgMood ?? 0,
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
