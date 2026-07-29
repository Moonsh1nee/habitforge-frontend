"use client";

import Link from "next/link";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { useDashboardToday, useDashboardWeek } from "@/lib/hooks/useDashboard";
import { DailyScore } from "./DailyScore";
import { QuickMetrics } from "./QuickMetrics";
import { TodayCard } from "./TodayCard";
import { HabitProgressRing } from "./HabitProgressRing";
import { WeeklyStats } from "./WeeklyStats";
import { MacroBar } from "./MacroBar";
import { FinanceWidget } from "./FinanceWidget";
import { ShoppingWidget } from "./ShoppingWidget";
import { TimeTrackingWidget } from "./TimeTrackingWidget";

// ─── Self-contained wrappers ───────────────────────────────────────────────────

function DailyScoreWidget() {
  const { data: today } = useDashboardToday();
  if (!today) return <CardSkeleton />;
  return <DailyScore today={today} />;
}

function QuickMetricsWidget() {
  const { data: today } = useDashboardToday();
  if (!today) return <CardSkeleton />;
  return <QuickMetrics today={today} />;
}

function TodayCardWidget() {
  const { data: today } = useDashboardToday();
  if (!today) return <CardSkeleton />;
  return (
    <Link href="/tasks" className="block">
      <TodayCard pending={today.tasks_pending ?? []} overdue={today.tasks_overdue ?? []} />
    </Link>
  );
}

function HabitRingsWidget() {
  const { data: today } = useDashboardToday();
  if (!today) return <CardSkeleton />;
  return (
    <Link href="/habits" className="block">
      <HabitProgressRing habits={today.habits ?? []} />
    </Link>
  );
}

function WeeklyStatsWidget() {
  const { data: week } = useDashboardWeek();
  return <WeeklyStats week={week} />;
}

function MacroBarWidget() {
  const { data: today } = useDashboardToday();
  return (
    <Link href="/nutrition" className="block">
      <MacroBar calories={today?.nutrition_calories ?? 0} />
    </Link>
  );
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export interface WidgetConfig {
  label: string;
  desc: string;
  component: React.ComponentType;
  span: "half" | "full";
}

export const WIDGET_REGISTRY: Record<string, WidgetConfig> = {
  "daily-score": {
    label: "Оценка дня",
    desc: "Ежедневный балл продуктивности",
    component: DailyScoreWidget,
    span: "half",
  },
  "quick-metrics": {
    label: "Метрики",
    desc: "Задачи, привычки, калории",
    component: QuickMetricsWidget,
    span: "full",
  },
  "today-card": {
    label: "Задачи на сегодня",
    desc: "Текущие и просроченные задачи",
    component: TodayCardWidget,
    span: "full",
  },
  "habit-rings": {
    label: "Привычки",
    desc: "Прогресс привычек на сегодня",
    component: HabitRingsWidget,
    span: "half",
  },
  "weekly-stats": {
    label: "Статистика недели",
    desc: "Графики выполнения за 7 дней",
    component: WeeklyStatsWidget,
    span: "full",
  },
  "macros": {
    label: "Макросы",
    desc: "Прогресс калорий и БЖУ",
    component: MacroBarWidget,
    span: "half",
  },
  "finance": {
    label: "Финансы",
    desc: "Баланс за текущую неделю",
    component: FinanceWidget,
    span: "half",
  },
  "shopping": {
    label: "Покупки",
    desc: "Активные списки покупок",
    component: ShoppingWidget,
    span: "half",
  },
  "time-tracking": {
    label: "Учёт времени",
    desc: "Затраченное время на задачи сегодня",
    component: TimeTrackingWidget,
    span: "half",
  },
};
