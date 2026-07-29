"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useReminders } from "@/lib/hooks/useReminders";
import { formatDate } from "@/lib/utils";

export function RemindersWidget() {
  const { data: reminders = [] } = useReminders();
  const upcoming = [...reminders]
    .filter((r) => r.isActive)
    .sort((a, b) => a.remindAt.localeCompare(b.remindAt))
    .slice(0, 4);

  return (
    <Link href="/settings" className="block h-full glass p-5 hover:border-primary/30 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bell size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text leading-tight">Напоминания</h2>
          <p className="text-[10px] text-muted">ближайшие</p>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-sm text-muted">Нет активных напоминаний</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-xs">
              <span className="text-text truncate mr-2">{r.title}</span>
              <span className="text-muted shrink-0 tabular-nums">
                {formatDate(new Date(r.remindAt), "d MMM, HH:mm")}
              </span>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
