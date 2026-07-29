"use client";

import Link from "next/link";
import { Timer } from "lucide-react";
import { useTimeTrackingToday } from "@/lib/hooks/useTasks";

function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}м`;
  return `${h}ч ${m}м`;
}

export function TimeTrackingWidget() {
  const { data } = useTimeTrackingToday();

  const totalMinutes = data?.total_minutes ?? 0;
  const runningTask = data?.running_task ?? null;
  const topEntries = (data?.entries ?? []).slice(0, 3);

  return (
    <Link href="/tasks" className="block h-full glass p-5 hover:border-primary/30 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Timer size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text leading-tight">Время сегодня</h2>
          <p className="text-[10px] text-muted">затрачено на задачи</p>
        </div>
      </div>

      <p className="text-2xl font-bold tabular-nums mb-3 text-text">
        {formatMinutes(totalMinutes)}
      </p>

      {runningTask ? (
        <div className="flex items-center gap-1.5 text-xs text-primary mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse shrink-0" />
          <span className="truncate">Идёт: {runningTask.title}</span>
        </div>
      ) : topEntries.length === 0 ? (
        <p className="text-xs text-muted">Пока нет отслеженного времени</p>
      ) : null}
    </Link>
  );
}
