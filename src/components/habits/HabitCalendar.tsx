"use client";

import { ActivityCalendar } from "react-activity-calendar";
import { useHabitLogs, useHabitStats } from "@/lib/hooks/useHabits";
import { Skeleton } from "@/components/shared/LoadingSkeleton";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { Flame, TrendingUp, Calendar } from "lucide-react";
import { format, subYears } from "date-fns";

interface HabitCalendarProps {
  habitId: string;
}

export function HabitCalendar({ habitId }: HabitCalendarProps) {
  const start = format(subYears(new Date(), 1), "yyyy-MM-dd");
  const end = format(new Date(), "yyyy-MM-dd");

  const { data: logs, isLoading: logsLoading } = useHabitLogs(habitId, { start, end });
  const { data: stats, isLoading: statsLoading } = useHabitStats(habitId);

  if (logsLoading || statsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
    );
  }

  const calendarData = (() => {
    const map = new Map<string, number>();
    logs?.forEach((log) => {
      const key = log.date.split("T")[0];
      map.set(key, (map.get(key) ?? 0) + log.count);
    });
    return Array.from(map.entries()).map(([date, count]) => ({
      date,
      count,
      level: Math.min(count, 4) as 0 | 1 | 2 | 3 | 4,
    }));
  })();

  return (
    <div className="space-y-5">
      <ActivityCalendar
        data={calendarData}
        colorScheme="dark"
        theme={{
          dark: ["rgba(255,255,255,0.05)", "#4c1d95", "#6d28d9", "#7c3aed", "#a78bfa"],
        }}
        labels={{ totalCount: "{{count}} выполнений за последний год" }}
        style={{ fontSize: "12px" }}
      />

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass p-3 text-center">
            <Flame size={16} className="text-warning mx-auto mb-1" />
            <div className="text-lg font-bold text-text">
              <AnimatedNumber value={stats.currentStreak} />
            </div>
            <p className="text-[10px] text-muted">Текущий стрик</p>
          </div>
          <div className="glass p-3 text-center">
            <TrendingUp size={16} className="text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-text">
              <AnimatedNumber value={stats.longestStreak} />
            </div>
            <p className="text-[10px] text-muted">Лучший стрик</p>
          </div>
          <div className="glass p-3 text-center">
            <Calendar size={16} className="text-accent mx-auto mb-1" />
            <div className="text-lg font-bold text-text">
              <AnimatedNumber value={Math.round(stats.completionRate * 100)} suffix="%" />
            </div>
            <p className="text-[10px] text-muted">Выполнение</p>
          </div>
        </div>
      )}
    </div>
  );
}
