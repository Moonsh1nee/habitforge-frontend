"use client";

import { motion } from "motion/react";
import { GlassCard } from "@/components/shared/GlassCard";
import { CheckSquare, Flame, Dumbbell, Smile, Moon, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeekStats } from "@/types";

interface WeeklyStatsProps {
  week?: WeekStats;
}

interface StatRowProps {
  icon: React.ElementType;
  label: string;
  value: number;
  maxValue: number;
  display: string;
  color: string;
  barColor: string;
  delay: number;
}

function StatRow({ icon: Icon, label, value, maxValue, display, color, barColor, delay }: StatRowProps) {
  const pct = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="flex items-center gap-3"
    >
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", `bg-${color}-500/10`)}>
        <Icon size={14} className={cn(`text-${color}-400`)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted">{label}</span>
          <span className="text-xs font-semibold text-text tabular-nums">{display}</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", barColor)}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: delay + 0.2, duration: 0.7, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function WeeklyStats({ week }: WeeklyStatsProps) {
  if (!week) return null;

  const taskRate = week.tasks_total > 0
    ? Math.round((week.tasks_completed / week.tasks_total) * 100)
    : 0;

  const rows: StatRowProps[] = [
    {
      icon: CheckSquare,
      label: "Задачи",
      value: week.tasks_completed,
      maxValue: week.tasks_total || 1,
      display: `${week.tasks_completed}/${week.tasks_total} (${taskRate}%)`,
      color: "violet",
      barColor: "bg-primary",
      delay: 0.05,
    },
    {
      icon: Flame,
      label: "Привычки",
      value: week.habits_completion_rate,
      maxValue: 100,
      display: `${Math.round(week.habits_completion_rate)}%`,
      color: "amber",
      barColor: "bg-warning",
      delay: 0.1,
    },
    {
      icon: Dumbbell,
      label: "Тренировки",
      value: week.workouts_count,
      maxValue: 7,
      display: `${week.workouts_count} раз`,
      color: "cyan",
      barColor: "bg-accent",
      delay: 0.15,
    },
    ...(week.avg_mood !== null && week.avg_mood !== undefined ? [{
      icon: Smile,
      label: "Настроение",
      value: week.avg_mood,
      maxValue: 10,
      display: `${week.avg_mood.toFixed(1)}/10`,
      color: "green",
      barColor: "bg-success",
      delay: 0.2,
    }] : []),
    ...(week.avg_sleep_hours !== null && week.avg_sleep_hours !== undefined ? [{
      icon: Moon,
      label: "Сон",
      value: week.avg_sleep_hours,
      maxValue: 9,
      display: `${week.avg_sleep_hours.toFixed(1)} ч/ночь`,
      color: "indigo",
      barColor: "bg-primary",
      delay: 0.25,
    }] : []),
    ...(week.avg_energy !== null && week.avg_energy !== undefined ? [{
      icon: Zap,
      label: "Энергия",
      value: week.avg_energy,
      maxValue: 10,
      display: `${week.avg_energy.toFixed(1)}/10`,
      color: "yellow",
      barColor: "bg-warning",
      delay: 0.3,
    }] : []),
  ] as StatRowProps[];

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text">Итоги недели</h2>
        <span className="text-xs text-muted/60 font-mono">
          {week.week_start ? week.week_start.slice(5).replace("-", ".") : ""} — {week.week_end ? week.week_end.slice(5).replace("-", ".") : ""}
        </span>
      </div>

      <div className="space-y-3.5">
        {rows.map((row) => (
          <StatRow key={row.label} {...row} />
        ))}
      </div>
    </GlassCard>
  );
}
