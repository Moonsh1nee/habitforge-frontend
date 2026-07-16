"use client";

import { useState, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { format, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { Dumbbell, Flame, Heart, Moon, Zap, BarChart2, BookOpen, Lightbulb } from "lucide-react";
import { staggerContainer, fadeUpItem } from "@/lib/constants/motionVariants";
import { useJournalEntries } from "@/lib/hooks/useJournal";
import { useWorkoutLogs } from "@/lib/hooks/useWorkouts";
import { useHabits } from "@/lib/hooks/useHabits";
import { habitsApi } from "@/lib/api/habits";
import { usePlan } from "@/lib/hooks/usePlan";
import { useInsights } from "@/lib/hooks/useInsights";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { CardSkeleton, Skeleton } from "@/components/shared/LoadingSkeleton";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { InsightCard } from "@/components/stats/InsightCard";
import { MetricCard } from "@/components/stats/MetricCard";
import { HabitStreakRow } from "@/components/stats/HabitStreakRow";
import { MoodEnergyChart } from "@/components/stats/MoodEnergyChart";
import { WorkoutHistoryChart } from "@/components/stats/WorkoutHistoryChart";
import { WeightTrendChart } from "@/components/stats/WeightTrendChart";
import { getTodayString } from "@/lib/utils";

type Period = "7" | "30" | "90";

export default function StatsPage() {
  const { isPro } = usePlan();
  const [period, setPeriod] = useState<Period>("7");
  const days = parseInt(period);
  const today = getTodayString();
  const start = format(subDays(new Date(), days - 1), "yyyy-MM-dd");

  const { data: entries = [], isLoading: loadingEntries } = useJournalEntries({ start, end: today, limit: 100 });
  const { data: workoutLogs = [], isLoading: loadingWorkouts } = useWorkoutLogs({ limit: 50 });
  const { data: habitsData, isLoading: loadingHabits } = useHabits({ archived: false });
  const habits = habitsData?.items ?? [];

  const habitStatsQueries = useQueries({
    queries: habits.map((h) => ({
      queryKey: ["habits", h.id, "stats"],
      queryFn: () => habitsApi.getStats(h.id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = loadingEntries || loadingWorkouts || loadingHabits;

  const workoutsInPeriod = useMemo(
    () => workoutLogs.filter((l) => l.date >= start && l.date <= today),
    [workoutLogs, start, today]
  );

  const moodEntries = useMemo(() => entries.filter((e) => e.mood != null), [entries]);
  const energyEntries = useMemo(() => entries.filter((e) => e.energy != null), [entries]);
  const sleepEntries = useMemo(() => entries.filter((e) => e.sleepHours != null), [entries]);

  const moodChartData = useMemo(
    () =>
      entries
        .filter((e) => e.mood != null || e.energy != null)
        .map((e) => ({
          date: format(new Date(e.date), days <= 14 ? "d MMM" : "d.MM", { locale: ru }),
          mood: e.mood,
          energy: e.energy,
        })),
    [entries, days]
  );

  const workoutChartData = useMemo(
    () =>
      workoutsInPeriod
        .slice(0, 20)
        .reverse()
        .map((w) => ({ date: format(new Date(w.date), "d.MM"), duration: w.durationMinutes ?? 0 })),
    [workoutsInPeriod]
  );

  const weightData = useMemo(
    () =>
      entries
        .filter((e) => e.weight != null)
        .map((e) => ({ date: format(new Date(e.date), "d.MM"), weight: e.weight! })),
    [entries]
  );

  const insights = useInsights({ entries, moodEntries, workoutsInPeriod, workoutLogs, days, isLoading });

  const avgMood = moodEntries.length > 0 ? moodEntries.reduce((s, e) => s + e.mood!, 0) / moodEntries.length : null;
  const avgEnergy = energyEntries.length > 0 ? energyEntries.reduce((s, e) => s + e.energy!, 0) / energyEntries.length : null;
  const avgSleep = sleepEntries.length > 0 ? sleepEntries.reduce((s, e) => s + e.sleepHours!, 0) / sleepEntries.length : null;

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Аналитика"
        subtitle="Ваш прогресс за период"
        action={
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart2 size={14} className="text-primary" />
          </div>
        }
      />

      <FilterTabs
        value={period}
        onChange={(v) => {
          if (!isPro && (v === "30" || v === "90")) return;
          setPeriod(v as Period);
        }}
        size="md"
        options={[
          { value: "7", label: "7 дней" },
          { value: "30", label: isPro ? "30 дней" : "30 дней 🔒" },
          { value: "90", label: isPro ? "90 дней" : "90 дней 🔒" },
        ]}
      />

      {!isPro && (
        <UpgradePrompt
          title="Расширенная аналитика в Pro"
          description="Периоды 30 и 90 дней доступны на Pro-плане. Откройте историю и тренды."
          variant="primary"
        />
      )}

      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0,1,2,3].map((i) => <CardSkeleton key={i} className="p-4" />)}
          </div>
          <Skeleton className="h-56 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-52 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
          </div>
        </div>
      )}

      {!isLoading && insights.length > 0 && (
        <motion.div
          key={`insights-${period}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-warning" />
            <h3 className="text-sm font-semibold text-text">Инсайты</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <AnimatePresence>
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {!isLoading && (
        <motion.div key={period} variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={fadeUpItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard icon={Heart} label="Ср. настроение" value={avgMood} suffix="/10" colorClass="text-primary" />
            <MetricCard icon={Zap} label="Ср. энергия" value={avgEnergy} suffix="/10" colorClass="text-accent" />
            <MetricCard icon={Moon} label="Ср. сон (ч)" value={avgSleep} colorClass="text-warning" />
            <MetricCard icon={Dumbbell} label="Тренировок" value={workoutsInPeriod.length} decimals={0} colorClass="text-success" />
          </motion.div>

          {moodChartData.length > 1 && (
            <motion.div variants={fadeUpItem}>
              <MoodEnergyChart data={moodChartData} />
            </motion.div>
          )}

          <motion.div variants={fadeUpItem} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WorkoutHistoryChart data={workoutChartData} />
            <GlassCard>
              <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                <Flame size={14} className="text-warning" />
                Серии привычек
              </h3>
              {habits.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Flame size={24} className="text-muted/40" />
                  <p className="text-sm text-muted">Нет активных привычек</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-52 scrollbar-thin">
                  {habits.map((habit, i) => (
                    <HabitStreakRow
                      key={habit.id}
                      habit={habit}
                      streak={habitStatsQueries[i]?.data?.current_streak ?? 0}
                      best={habitStatsQueries[i]?.data?.longest_streak ?? 0}
                    />
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {moodChartData.length === 0 && habits.length === 0 && workoutsInPeriod.length === 0 && (
            <motion.div variants={fadeUpItem}>
              <GlassCard className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={24} className="text-primary" />
                </div>
                <p className="text-base font-semibold text-text mb-2">Данных пока нет</p>
                <p className="text-sm text-muted max-w-xs mx-auto">
                  Начните вести дневник, отмечать привычки и записывать тренировки — здесь появится ваш прогресс
                </p>
              </GlassCard>
            </motion.div>
          )}

          {weightData.length > 1 && (
            <motion.div variants={fadeUpItem}>
              <WeightTrendChart data={weightData} />
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
