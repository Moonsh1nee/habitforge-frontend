"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useHabitStreaks } from "@/lib/hooks/useHabits";

export function HabitStreaksWidget() {
  const { data: ranked = [] } = useHabitStreaks();
  const top = ranked.slice(0, 5);

  return (
    <Link href="/habits" className="block h-full glass p-5 hover:border-danger/30 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-danger/10 flex items-center justify-center">
          <Flame size={16} className="text-danger" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text leading-tight">Стрики привычек</h2>
          <p className="text-[10px] text-muted">рейтинг серий</p>
        </div>
      </div>

      {top.length === 0 ? (
        <p className="text-sm text-muted">Пока нет привычек</p>
      ) : (
        <div className="space-y-2">
          {top.map(({ habit, stats }, i) => (
            <div key={habit.id} className="flex items-center gap-2.5 text-xs">
              <span className="w-4 text-muted font-medium tabular-nums shrink-0">{i + 1}</span>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: habit.color }}
              />
              <span className="text-text truncate flex-1">{habit.title}</span>
              <span className="flex items-center gap-1 text-danger font-semibold shrink-0 tabular-nums">
                <Flame size={11} />
                {stats.current_streak}
              </span>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
