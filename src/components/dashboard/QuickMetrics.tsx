"use client";

import { motion } from "motion/react";
import { CheckSquare, Flame, Utensils, Dumbbell } from "lucide-react";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import type { TodayDashboard } from "@/types";

interface QuickMetricsProps {
  today: TodayDashboard;
}

export function QuickMetrics({ today }: QuickMetricsProps) {
  const pendingTasks = today.tasks_pending.length + today.tasks_overdue.length;
  const doneHabits = today.habits.filter((h) => h.completed_today).length;
  const totalHabits = today.habits.length;
  const overdueCount = today.tasks_overdue.length;

  const metrics = [
    {
      icon: CheckSquare,
      label: "Задач осталось",
      value: pendingTasks,
      suffix: "",
      color: overdueCount > 0 ? "text-danger" : pendingTasks === 0 ? "text-success" : "text-primary",
      bg: overdueCount > 0 ? "bg-danger/10" : pendingTasks === 0 ? "bg-success/10" : "bg-primary/10",
      sub: overdueCount > 0 ? `${overdueCount} просрочено` : pendingTasks === 0 ? "Всё готово!" : "в очереди",
    },
    {
      icon: Flame,
      label: "Привычки",
      value: doneHabits,
      suffix: `/${totalHabits}`,
      color: doneHabits === totalHabits && totalHabits > 0 ? "text-success" : "text-warning",
      bg: doneHabits === totalHabits && totalHabits > 0 ? "bg-success/10" : "bg-warning/10",
      sub: totalHabits === 0 ? "Нет привычек" : `выполнено сегодня`,
    },
    {
      icon: Utensils,
      label: "Калории",
      value: today.nutrition_calories,
      suffix: " ккал",
      color: "text-accent",
      bg: "bg-accent/10",
      sub: "за сегодня",
    },
    {
      icon: Dumbbell,
      label: "Тренировка",
      value: today.workout?.durationMinutes ?? 0,
      suffix: " мин",
      color: today.workout ? "text-success" : "text-muted",
      bg: today.workout ? "bg-success/10" : "bg-white/5",
      sub: today.workout ? "выполнено" : "не начата",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {metrics.map(({ icon: Icon, label, value, suffix, color, bg, sub }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="glass p-3.5 flex flex-col gap-1.5"
        >
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={14} className={color} />
            </div>
            <p className="text-[11px] text-muted leading-tight">{label}</p>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-xl font-bold tabular-nums ${color}`}>
              <AnimatedNumber value={value} />
            </span>
            {suffix && <span className="text-xs text-muted">{suffix}</span>}
          </div>
          <p className="text-[10px] text-muted">{sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
