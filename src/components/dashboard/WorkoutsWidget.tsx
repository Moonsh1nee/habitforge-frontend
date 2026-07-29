"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { useWorkoutLogs } from "@/lib/hooks/useWorkouts";
import { formatDate, getTodayString, dateNDaysAgoString } from "@/lib/utils";

export function WorkoutsWidget() {
  const { data: logs = [] } = useWorkoutLogs({ start: dateNDaysAgoString(6), end: getTodayString() });
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const last = sorted[0];
  const weekCount = logs.length;

  return (
    <Link href="/workouts" className="block h-full glass p-5 hover:border-warning/30 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center">
          <Dumbbell size={16} className="text-warning" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text leading-tight">Тренировки</h2>
          <p className="text-[10px] text-muted">за 7 дней</p>
        </div>
      </div>

      <p className="text-2xl font-bold tabular-nums mb-2 text-warning">
        {weekCount} <span className="text-xs text-muted font-normal">за неделю</span>
      </p>

      {last ? (
        <p className="text-xs text-muted">
          Последняя: {formatDate(new Date(last.date), "d MMM")}
          {last.durationMinutes ? ` · ${last.durationMinutes} мин` : ""}
        </p>
      ) : (
        <p className="text-xs text-muted">Нет записей за неделю</p>
      )}
    </Link>
  );
}
