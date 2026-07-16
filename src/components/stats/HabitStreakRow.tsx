import type { Habit } from "@/types";

interface HabitStreakRowProps {
  habit: Habit;
  streak: number;
  best: number;
}

export function HabitStreakRow({ habit, streak, best }: HabitStreakRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
        style={{ background: (habit.color ?? "#7c3aed") + "20" }}
      >
        {habit.icon ?? "🔄"}
      </div>
      <span className="flex-1 text-sm text-text truncate min-w-0">{habit.title}</span>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right min-w-10">
          <p className={`text-sm font-bold tabular-nums ${streak > 0 ? "text-warning" : "text-muted"}`}>
            {streak > 0 ? `🔥 ${streak}` : streak}
          </p>
          <p className="text-[10px] text-muted">сейчас</p>
        </div>
        <div className="text-right min-w-8">
          <p className="text-sm font-semibold tabular-nums text-primary">{best}</p>
          <p className="text-[10px] text-muted">рекорд</p>
        </div>
      </div>
    </div>
  );
}
