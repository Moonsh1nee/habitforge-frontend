"use client";

import { useMemo } from "react";
import type { Insight } from "@/components/stats/InsightCard";
import type { DailyEntry } from "@/types";

interface UseInsightsParams {
  entries: DailyEntry[];
  moodEntries: DailyEntry[];
  isLoading: boolean;
}

export function useInsights({
  entries,
  moodEntries,
  isLoading,
}: UseInsightsParams): Insight[] {
  return useMemo<Insight[]>(() => {
    const result: Insight[] = [];

    // 1. Sleep ↔ mood correlation
    const goodSleepMood = entries.filter((e) => e.sleepHours != null && e.sleepHours >= 7 && e.mood != null);
    const poorSleepMood = entries.filter((e) => e.sleepHours != null && e.sleepHours < 7 && e.mood != null);
    if (goodSleepMood.length >= 2 && poorSleepMood.length >= 2) {
      const avgG = goodSleepMood.reduce((s, e) => s + e.mood!, 0) / goodSleepMood.length;
      const avgP = poorSleepMood.reduce((s, e) => s + e.mood!, 0) / poorSleepMood.length;
      const diff = avgG - avgP;
      if (diff >= 0.8) {
        result.push({
          id: "sleep-mood",
          variant: "primary",
          emoji: "😴",
          title: `При 7+ часах сна настроение выше на ${diff.toFixed(1)} балла`,
          description: "Хороший сон — твой главный инструмент восстановления",
        });
      }
    }

    // 2. Mood trend (first half vs second half of period)
    if (moodEntries.length >= 4) {
      const half = Math.floor(moodEntries.length / 2);
      const avgFirst = moodEntries.slice(0, half).reduce((s, e) => s + e.mood!, 0) / half;
      const avgSecond = moodEntries.slice(half).reduce((s, e) => s + e.mood!, 0) / (moodEntries.length - half);
      const diff = avgSecond - avgFirst;
      if (diff >= 0.5) {
        result.push({
          id: "mood-trend-up",
          variant: "success",
          emoji: "📈",
          title: `Настроение улучшилось на ${diff.toFixed(1)} балла за период`,
        });
      } else if (diff <= -0.5) {
        result.push({
          id: "mood-trend-down",
          variant: "warning",
          emoji: "📉",
          title: `Настроение снизилось на ${Math.abs(diff).toFixed(1)} балла за период`,
          description: "Обрати внимание на сон и физическую активность",
        });
      }
    }

    // 3. No journal entries in period
    if (entries.length === 0 && !isLoading) {
      result.push({
        id: "no-journal",
        variant: "warning",
        emoji: "📓",
        title: "Нет записей в дневнике за выбранный период",
        description: "Добавь первую запись — и здесь появятся персональные инсайты",
      });
    }

    return result.slice(0, 4);
  }, [entries, moodEntries, isLoading]);
}
