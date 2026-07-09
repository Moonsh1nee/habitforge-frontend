"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Repeat2, CheckCircle2, Flame } from "lucide-react";
import { motion } from "motion/react";
import { useHabits, useLogHabit, useDeleteHabit, useFreezeHabit } from "@/lib/hooks/useHabits";
import { useDashboardToday } from "@/lib/hooks/useDashboard";
import { usePlan } from "@/lib/hooks/usePlan";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitForm } from "@/components/habits/HabitForm";
import { HabitCalendar } from "@/components/habits/HabitCalendar";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { LimitBadge } from "@/components/shared/LimitBadge";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Habit } from "@/types";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

function HabitsPageInner() {
  const [formOpen, setFormOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("create") === "1") setFormOpen(true);
  }, [searchParams]);

  const logHabit = useLogHabit();
  const deleteHabit = useDeleteHabit();
  const freezeHabit = useFreezeHabit();

  const { data, isLoading } = useHabits({ archived: false });
  const habits = data?.items ?? [];

  const { data: todayData } = useDashboardToday();
  const todayHabits = todayData?.habits ?? [];
  const doneToday = todayHabits.filter((h) => h.completed_today).length;
  const totalToday = todayHabits.length;
  const allDone = totalToday > 0 && doneToday === totalToday;

  const { isPro, getLimit, isAtLimit } = usePlan();
  const habitLimit = getLimit("habits");
  const atHabitLimit = isAtLimit("habits", habits.length);

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Привычки"
        subtitle={
          <span className="flex items-center gap-2">
            {habits.length} привычек
            {!isPro && (
              <LimitBadge current={habits.length} max={habitLimit} label="привычек" />
            )}
          </span>
        }
        action={
          <Button
            onClick={() => !atHabitLimit && setFormOpen(true)}
            disabled={atHabitLimit}
            className="gradient-primary text-white gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            title={atHabitLimit ? "Лимит достигнут — перейдите на Pro" : undefined}
          >
            <Plus size={16} />
            Новая привычка
          </Button>
        }
      />

      {atHabitLimit && (
        <UpgradePrompt
          title="Достигнут лимит привычек"
          description={`В Free-плане доступно максимум ${habitLimit} привычек. Перейдите на Pro чтобы добавлять сколько угодно.`}
          variant="warning"
        />
      )}

      {/* Today summary */}
      {totalToday > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass p-4 flex items-center justify-between ${allDone ? "border-success/20" : "border-border"}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${allDone ? "bg-success/15" : "bg-warning/10"}`}>
              {allDone ? <CheckCircle2 size={16} className="text-success" /> : <Flame size={16} className="text-warning" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-text">
                {allDone ? "Все привычки выполнены!" : `Сегодня: ${doneToday} из ${totalToday}`}
              </p>
              <p className="text-xs text-muted">
                {allDone ? "Отличная работа, так держать" : `Осталось ${totalToday - doneToday} привычек`}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-lg font-bold tabular-nums ${allDone ? "text-success" : "text-warning"}`}>
              {totalToday > 0 ? Math.round((doneToday / totalToday) * 100) : 0}%
            </span>
            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${allDone ? "bg-success" : "gradient-primary"}`}
                initial={{ width: 0 }}
                animate={{ width: `${(doneToday / totalToday) * 100}%` }}
                transition={{ duration: 0.7 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : habits.length === 0 ? (
        <EmptyState
          icon={<Repeat2 />}
          title="Нет привычек"
          description="Создайте первую привычку для отслеживания прогресса"
          action={
            <Button onClick={() => setFormOpen(true)} className="gradient-primary text-white">
              Создать привычку
            </Button>
          }
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {habits.map((habit) => (
            <motion.div key={habit.id} variants={item}>
              <HabitCard
                habit={habit}
                onLog={() => logHabit.mutate({ id: habit.id })}
                onClick={() => setSelectedHabit(habit)}
                onEdit={(h) => setEditHabit(h)}
                onDelete={(id) => deleteHabit.mutate(id)}
                onFreeze={() => freezeHabit.mutate({ id: habit.id })}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title="Новая привычка">
        <HabitForm onSuccess={() => setFormOpen(false)} />
      </FormDialog>

      <FormDialog
        open={!!editHabit}
        onOpenChange={(o) => !o && setEditHabit(null)}
        title="Редактировать привычку"
      >
        {editHabit && (
          <HabitForm habit={editHabit} onSuccess={() => setEditHabit(null)} />
        )}
      </FormDialog>

      {/* Detail sheet */}
      <Sheet open={!!selectedHabit} onOpenChange={(o) => !o && setSelectedHabit(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto scrollbar-thin"
        >
          {selectedHabit && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                  {selectedHabit.icon ? (
                    <span>{selectedHabit.icon}</span>
                  ) : (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: selectedHabit.color ?? "var(--color-primary)" }}
                    />
                  )}
                  {selectedHabit.title}
                </SheetTitle>
              </SheetHeader>
              <HabitCalendar habitId={selectedHabit.id} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function HabitsPage() {
  return (
    <Suspense>
      <HabitsPageInner />
    </Suspense>
  );
}
