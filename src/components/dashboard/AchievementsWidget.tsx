"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { useXP, useAchievements } from "@/lib/hooks/useXP";

export function AchievementsWidget() {
  const { data: xp } = useXP();
  const { data: achievements } = useAchievements();
  const unlockedCount = achievements?.unlocked.length ?? 0;
  const totalCount = (achievements?.unlocked.length ?? 0) + (achievements?.locked.length ?? 0);

  return (
    <Link href="/achievements" className="block h-full glass p-5 hover:border-orange-400/30 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-orange-400/10 flex items-center justify-center">
          <Trophy size={16} className="text-orange-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text leading-tight">Достижения</h2>
          <p className="text-[10px] text-muted">{xp ? `Уровень ${xp.level}` : "уровень и XP"}</p>
        </div>
      </div>

      {xp ? (
        <>
          <div className="flex items-baseline gap-1.5 mb-2">
            <p className="text-2xl font-bold tabular-nums text-orange-400">{xp.totalXp}</p>
            <span className="text-xs text-muted">XP</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-orange-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, xp.xpProgressPct)}%` }}
            />
          </div>
        </>
      ) : null}

      <p className="text-xs text-muted">
        {unlockedCount} из {totalCount} наград открыто
      </p>
    </Link>
  );
}
