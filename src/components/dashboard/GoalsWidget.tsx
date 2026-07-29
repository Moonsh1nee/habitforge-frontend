"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import { useGoals } from "@/lib/hooks/useGoals";

export function GoalsWidget() {
  const { data: goals = [] } = useGoals("active");
  const top = [...goals].sort((a, b) => b.progressPct - a.progressPct).slice(0, 3);

  return (
    <Link href="/goals" className="block h-full glass p-5 hover:border-primary/30 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Target size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text leading-tight">Цели</h2>
          <p className="text-[10px] text-muted">активные цели</p>
        </div>
      </div>

      {top.length === 0 ? (
        <p className="text-sm text-muted">Нет активных целей</p>
      ) : (
        <div className="space-y-3">
          {top.map((g) => (
            <div key={g.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text truncate mr-2">{g.title}</span>
                <span className="text-muted shrink-0 tabular-nums">{Math.round(g.progressPct)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, g.progressPct)}%`, background: g.color ?? "var(--color-primary)" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
