"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import { useCalendarEvents } from "@/lib/hooks/useCalendar";
import { cn } from "@/lib/utils";

export function MiniCalendarWidget() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const { data: events = [] } = useCalendarEvents({
    start: format(gridStart, "yyyy-MM-dd"),
    end: format(gridEnd, "yyyy-MM-dd"),
  });

  const eventDates = useMemo(() => new Set(events.map((e) => e.date)), [events]);
  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);
  const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <Link href="/calendar" className="block h-full glass p-5 hover:border-primary/30 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarDays size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text leading-tight capitalize">
            {format(now, "LLLL yyyy", { locale: ru })}
          </h2>
          <p className="text-[10px] text-muted">мини-календарь</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((w) => (
          <span key={w} className="text-[10px] text-muted font-medium">{w}</span>
        ))}
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const inMonth = isSameMonth(d, now);
          const hasEvent = eventDates.has(key);
          return (
            <div
              key={key}
              className={cn(
                "relative aspect-square flex items-center justify-center text-[11px] rounded-md",
                !inMonth && "text-muted/30",
                inMonth && !isToday(d) && "text-muted",
                isToday(d) && "bg-primary text-white font-semibold"
              )}
            >
              {d.getDate()}
              {hasEvent && !isToday(d) && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>
    </Link>
  );
}
