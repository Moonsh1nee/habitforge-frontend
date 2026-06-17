"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { BookOpen, Dumbbell, TrendingUp } from "lucide-react";
import { useDashboardToday, useDashboardWeek } from "@/lib/hooks/useDashboard";
import { useAuthStore } from "@/lib/stores/authStore";
import { DailyScore } from "@/components/dashboard/DailyScore";
import { QuickMetrics } from "@/components/dashboard/QuickMetrics";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { HabitProgressRing } from "@/components/dashboard/HabitProgressRing";
import { WeeklyStats } from "@/components/dashboard/WeeklyStats";
import { MacroBar } from "@/components/dashboard/MacroBar";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { OnboardingBanner } from "@/components/layout/OnboardingBanner";
import { getGreeting, formatDate } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: today, isLoading: loadingToday } = useDashboardToday();
  const { data: week, isLoading: loadingWeek } = useDashboardWeek();

  const isLoading = loadingToday || loadingWeek;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-text">
            {user ? getGreeting(user.firstName) : "Добро пожаловать"}
          </h1>
          <p className="text-muted text-sm mt-0.5 capitalize">
            {formatDate(new Date(), "EEEE, d MMMM")}
          </p>
        </div>
        <Link
          href="/tasks"
          className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1"
        >
          <TrendingUp size={13} />
          все задачи
        </Link>
      </motion.div>

      {!isLoading && (
        <OnboardingBanner
          show={
            (today?.habits?.length ?? 0) === 0 &&
            (today?.tasks_pending?.length ?? 0) === 0 &&
            (today?.tasks_overdue?.length ?? 0) === 0
          }
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* ── Row 1: Daily Score + Quick Metrics ── */}
          {today && (
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <DailyScore today={today} />
              </div>
              <div className="md:col-span-2">
                <QuickMetrics today={today} />
              </div>
            </motion.div>
          )}

          {/* ── Row 2: Today Tasks + Habits ── */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Link href="/tasks" className="block">
                <TodayCard
                  pending={today?.tasks_pending ?? []}
                  overdue={today?.tasks_overdue ?? []}
                />
              </Link>
            </div>
            <div>
              <Link href="/habits" className="block">
                <HabitProgressRing habits={today?.habits ?? []} />
              </Link>
            </div>
          </motion.div>

          {/* ── Row 3: Weekly Stats + Side Cards ── */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <WeeklyStats week={week} />
            </div>

            <div className="space-y-4">
              {/* Nutrition */}
              <Link href="/nutrition" className="block">
                <MacroBar calories={today?.nutrition_calories ?? 0} />
              </Link>

              {/* Journal or Workout side card */}
              {today?.journal_entry ? (
                <Link href="/journal" className="block glass p-4 hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen size={14} className="text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-text">Дневник</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-primary">{today.journal_entry.mood ?? "—"}</p>
                      <p className="text-[10px] text-muted">настроение</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-accent">{today.journal_entry.energy ?? "—"}</p>
                      <p className="text-[10px] text-muted">энергия</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-warning">{today.journal_entry.sleepHours ?? "—"}</p>
                      <p className="text-[10px] text-muted">сон (ч)</p>
                    </div>
                  </div>
                </Link>
              ) : today?.workout ? (
                <Link href="/workouts" className="block glass p-4 hover:border-success/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
                      <Dumbbell size={14} className="text-success" />
                    </div>
                    <h3 className="text-sm font-semibold text-text">Тренировка</h3>
                  </div>
                  <p className="text-2xl font-bold text-success">{today.workout.durationMinutes} мин</p>
                  <p className="text-xs text-muted mt-0.5">{today.workout.notes ?? "Без заметок"}</p>
                </Link>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
