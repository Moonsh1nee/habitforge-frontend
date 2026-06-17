"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Flame, Dumbbell, BookOpen, Heart, TrendingUp,
  Zap, Moon, BarChart2,
} from "lucide-react";
import { useJournalEntries } from "@/lib/hooks/useJournal";
import { useWorkoutLogs } from "@/lib/hooks/useWorkouts";
import { useHabits, useHabitStats } from "@/lib/hooks/useHabits";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { CardSkeleton, Skeleton } from "@/components/shared/LoadingSkeleton";
import { getTodayString } from "@/lib/utils";
import type { Habit } from "@/types";

type Period = "7" | "30" | "90";

const TT_STYLE = {
  background: "#13131a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  color: "#f1f5f9",
  fontSize: 12,
};

// ─── Habit streak row (each triggers its own stats query) ──────────────────

function HabitStreakRow({ habit }: { habit: Habit }) {
  const { data: stats } = useHabitStats(habit.id);
  const streak = stats?.current_streak ?? 0;
  const best = stats?.longest_streak ?? 0;

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
        <div className="text-right min-w-[40px]">
          <p className={`text-sm font-bold tabular-nums ${streak > 0 ? "text-warning" : "text-muted"}`}>
            {streak > 0 ? `🔥 ${streak}` : streak}
          </p>
          <p className="text-[10px] text-muted">сейчас</p>
        </div>
        <div className="text-right min-w-[32px]">
          <p className="text-sm font-semibold tabular-nums text-primary">{best}</p>
          <p className="text-[10px] text-muted">рекорд</p>
        </div>
      </div>
    </div>
  );
}

// ─── Metric Card ───────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  decimals = 1,
  colorClass,
}: {
  icon: React.ElementType;
  label: string;
  value: number | null;
  suffix?: string;
  decimals?: number;
  colorClass: string;
}) {
  return (
    <GlassCard className="p-4 text-center flex flex-col items-center gap-2">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white/5`}>
        <Icon size={16} className={colorClass} />
      </div>
      <p className={`text-2xl font-bold tabular-nums ${colorClass}`}>
        {value != null ? (
          <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
        ) : (
          <span className="text-muted text-lg">—</span>
        )}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </GlassCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>("30");
  const days = parseInt(period);
  const today = getTodayString();
  const start = format(subDays(new Date(), days - 1), "yyyy-MM-dd");

  const { data: entries = [], isLoading: loadingEntries } = useJournalEntries({ start, end: today, limit: 100 });
  const { data: workoutLogs = [], isLoading: loadingWorkouts } = useWorkoutLogs({ limit: 50 });
  const { data: habitsData, isLoading: loadingHabits } = useHabits({ archived: false });
  const habits = habitsData?.items ?? [];
  const isLoading = loadingEntries || loadingWorkouts || loadingHabits;

  const workoutsInPeriod = useMemo(
    () => workoutLogs.filter((l) => l.date >= start && l.date <= today),
    [workoutLogs, start, today]
  );

  // Build chart data
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
        .map((w) => ({
          date: format(new Date(w.date), "d.MM"),
          duration: w.durationMinutes ?? 0,
        })),
    [workoutsInPeriod]
  );

  const weightData = useMemo(
    () =>
      entries
        .filter((e) => e.weight != null)
        .map((e) => ({
          date: format(new Date(e.date), "d.MM"),
          weight: e.weight!,
        })),
    [entries]
  );

  // Summary stats
  const moodEntries = entries.filter((e) => e.mood != null);
  const energyEntries = entries.filter((e) => e.energy != null);
  const sleepEntries = entries.filter((e) => e.sleepHours != null);

  const avgMood = moodEntries.length > 0
    ? moodEntries.reduce((s, e) => s + e.mood!, 0) / moodEntries.length
    : null;
  const avgEnergy = energyEntries.length > 0
    ? energyEntries.reduce((s, e) => s + e.energy!, 0) / energyEntries.length
    : null;
  const avgSleep = sleepEntries.length > 0
    ? sleepEntries.reduce((s, e) => s + e.sleepHours!, 0) / sleepEntries.length
    : null;

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
        onChange={setPeriod}
        size="md"
        options={[
          { value: "7", label: "7 дней" },
          { value: "30", label: "30 дней" },
          { value: "90", label: "90 дней" },
        ]}
      />

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

      {!isLoading && (
      <motion.div key={period} variants={container} initial="hidden" animate="visible" className="space-y-4">
        {/* Summary metrics */}
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard icon={Heart} label="Ср. настроение" value={avgMood} suffix="/10" colorClass="text-primary" />
          <MetricCard icon={Zap} label="Ср. энергия" value={avgEnergy} suffix="/10" colorClass="text-accent" />
          <MetricCard icon={Moon} label="Ср. сон (ч)" value={avgSleep} colorClass="text-warning" />
          <MetricCard icon={Dumbbell} label="Тренировок" value={workoutsInPeriod.length} decimals={0} colorClass="text-success" />
        </motion.div>

        {/* Mood & Energy trend */}
        {moodChartData.length > 1 && (
          <motion.div variants={item}>
            <GlassCard>
              <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
                <Heart size={14} className="text-primary" />
                Настроение и энергия
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={moodChartData}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[1, 10]}
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#7c3aed"
                    fill="url(#moodGrad)"
                    strokeWidth={2}
                    name="Настроение"
                    dot={false}
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    stroke="#06b6d4"
                    fill="url(#energyGrad)"
                    strokeWidth={2}
                    name="Энергия"
                    dot={false}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        )}

        {/* Workout + Habits row */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Workout history */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
              <Dumbbell size={14} className="text-success" />
              Тренировки за период
            </h3>
            {workoutChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={workoutChartData}>
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={TT_STYLE}
                    formatter={(v) => [`${v} мин`, "Длительность"]}
                  />
                  <Bar
                    dataKey="duration"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    name="Длительность"
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <Dumbbell size={24} className="text-muted/40" />
                <p className="text-sm text-muted">Нет тренировок за период</p>
              </div>
            )}
          </GlassCard>

          {/* Habit streaks */}
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
                {habits.map((habit) => (
                  <HabitStreakRow key={habit.id} habit={habit} />
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Journal overview */}
        {moodChartData.length === 0 && habits.length === 0 && workoutsInPeriod.length === 0 && (
          <motion.div variants={item}>
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

        {/* Weight trend */}
        {weightData.length > 1 && (
          <motion.div variants={item}>
            <GlassCard>
              <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-accent" />
                Динамика веса
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={weightData}>
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={TT_STYLE}
                    formatter={(v) => [`${v} кг`, "Вес"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4", r: 3, strokeWidth: 0 }}
                    name="Вес"
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
      )}
    </div>
  );
}
