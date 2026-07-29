"use client";

import { useMemo } from "react";
import { BookOpen, Smile, Meh, Frown } from "lucide-react";
import { useJournalEntries } from "@/lib/hooks/useJournal";
import { formatDate, getTodayString, dateNDaysAgoString } from "@/lib/utils";

function moodIcon(mood: number) {
  if (mood >= 4) return <Smile size={14} className="text-success" />;
  if (mood >= 3) return <Meh size={14} className="text-warning" />;
  return <Frown size={14} className="text-danger" />;
}

export function JournalTrendWidget() {
  const { data: entries = [] } = useJournalEntries({
    start: dateNDaysAgoString(13),
    end: getTodayString(),
  });

  const withMood = useMemo(
    () => entries.filter((e) => e.mood != null).sort((a, b) => a.date.localeCompare(b.date)),
    [entries]
  );
  const avgMood = withMood.length
    ? withMood.reduce((s, e) => s + (e.mood ?? 0), 0) / withMood.length
    : null;

  return (
    <div className="h-full glass p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-violet-400/10 flex items-center justify-center">
          <BookOpen size={16} className="text-violet-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text leading-tight">Настроение</h2>
          <p className="text-[10px] text-muted">за 14 дней</p>
        </div>
      </div>

      {withMood.length === 0 ? (
        <p className="text-sm text-muted">Пока нет записей с настроением</p>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            {avgMood !== null && moodIcon(avgMood)}
            <p className="text-2xl font-bold tabular-nums text-text">
              {avgMood !== null ? avgMood.toFixed(1) : "—"}
              <span className="text-xs text-muted font-normal"> / 5 в среднем</span>
            </p>
          </div>
          <div className="flex items-end gap-1 h-10">
            {withMood.map((e) => (
              <div
                key={e.id}
                title={`${formatDate(new Date(e.date), "d MMM")}: ${e.mood}/5`}
                className="flex-1 rounded-sm bg-violet-400/70"
                style={{ height: `${((e.mood ?? 0) / 5) * 100}%`, minHeight: 4 }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
