"use client";

import { motion } from "motion/react";
import { useDashboardToday, useDashboardWeek } from "@/lib/hooks/useDashboard";
import { useAuthStore } from "@/lib/stores/authStore";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { HabitProgressRing } from "@/components/dashboard/HabitProgressRing";
import { MacroBar } from "@/components/dashboard/MacroBar";
import { WeeklyStats } from "@/components/dashboard/WeeklyStats";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { getGreeting, formatDate } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: today, isLoading: loadingToday } = useDashboardToday();
  const { data: week, isLoading: loadingWeek } = useDashboardWeek();

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-text">
          {user ? getGreeting(user.firstName) : "Добро пожаловать"}
        </h1>
        <p className="text-muted text-sm mt-0.5">
          {formatDate(new Date(), "EEEE, d MMMM")}
        </p>
      </motion.div>

      {loadingToday || loadingWeek ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <motion.div variants={item} className="lg:col-span-2">
            <TodayCard
              pending={today?.tasks_pending ?? []}
              overdue={today?.tasks_overdue ?? []}
            />
          </motion.div>

          <motion.div variants={item}>
            <HabitProgressRing habits={today?.habits ?? []} />
          </motion.div>

          <motion.div variants={item}>
            <MacroBar calories={today?.nutrition_calories ?? 0} />
          </motion.div>

          {today?.journal_entry && (
            <motion.div variants={item} className="glass p-6">
              <h3 className="font-semibold text-text mb-3">Дневник сегодня</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {today.journal_entry.mood ?? "—"}
                  </div>
                  <p className="text-xs text-muted">Настроение</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {today.journal_entry.energy ?? "—"}
                  </div>
                  <p className="text-xs text-muted">Энергия</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {today.journal_entry.sleepHours ?? "—"}
                  </div>
                  <p className="text-xs text-muted">Сон (ч)</p>
                </div>
              </div>
            </motion.div>
          )}

          {today?.workout && (
            <motion.div variants={item} className="glass p-6">
              <h3 className="font-semibold text-text mb-2">Тренировка</h3>
              <p className="text-3xl font-bold text-success">
                {today.workout.durationMinutes} мин
              </p>
              <p className="text-xs text-muted mt-1">
                {today.workout.notes ?? "Без заметок"}
              </p>
            </motion.div>
          )}

          <motion.div variants={item} className="lg:col-span-2">
            <WeeklyStats week={week} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
