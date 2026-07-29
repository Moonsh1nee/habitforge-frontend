"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Activity, CheckSquare, Repeat2, Dumbbell, BookOpen, Bell } from "lucide-react";
import { useCalendarEvents } from "@/lib/hooks/useCalendar";
import { formatDate, getTodayString, dateNDaysAgoString } from "@/lib/utils";
import type { CalendarEventType } from "@/types";

const TYPE_ICON: Record<CalendarEventType, React.ElementType> = {
  task: CheckSquare,
  habit: Repeat2,
  workout: Dumbbell,
  journal: BookOpen,
  reminder: Bell,
};

const TYPE_LABEL: Record<CalendarEventType, string> = {
  task: "Задача",
  habit: "Привычка",
  workout: "Тренировка",
  journal: "Дневник",
  reminder: "Напоминание",
};

export function ActivityFeedWidget() {
  const { data: events = [] } = useCalendarEvents({
    start: dateNDaysAgoString(6),
    end: getTodayString(),
  });

  const recent = useMemo(
    () => [...events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [events]
  );

  return (
    <div className="h-full glass p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-cyan-400/10 flex items-center justify-center">
          <Activity size={16} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text leading-tight">Лента активности</h2>
          <p className="text-[10px] text-muted">за последние 7 дней</p>
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-muted">Пока нет активности</p>
      ) : (
        <div className="space-y-2.5">
          {recent.map((e) => {
            const Icon = TYPE_ICON[e.type];
            const inner = (
              <div className="flex items-center gap-2.5 text-xs">
                <Icon size={13} className="text-muted shrink-0" />
                <span className="text-text truncate flex-1">{e.title}</span>
                <span className="text-muted shrink-0">{formatDate(new Date(e.date), "d MMM")}</span>
              </div>
            );
            return e.url ? (
              <Link key={e.id} href={e.url} title={TYPE_LABEL[e.type]} className="block hover:text-primary">
                {inner}
              </Link>
            ) : (
              <div key={e.id} title={TYPE_LABEL[e.type]}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
