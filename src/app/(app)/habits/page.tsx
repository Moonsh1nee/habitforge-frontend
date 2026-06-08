"use client";

import { useState } from "react";
import { Plus, Repeat2 } from "lucide-react";
import { motion } from "motion/react";
import { useHabits, useLogHabit, useDeleteHabit } from "@/lib/hooks/useHabits";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitForm } from "@/components/habits/HabitForm";
import { HabitCalendar } from "@/components/habits/HabitCalendar";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function HabitsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const logHabit = useLogHabit();
  const deleteHabit = useDeleteHabit();

  const { data, isLoading } = useHabits({ archived: false });
  const habits = data?.items ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Привычки</h1>
          <p className="text-sm text-muted mt-0.5">{habits.length} привычек</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gradient-primary text-white gap-2">
          <Plus size={16} />
          Новая привычка
        </Button>
      </div>

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
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая привычка</DialogTitle>
          </DialogHeader>
          <HabitForm onSuccess={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editHabit} onOpenChange={(o) => !o && setEditHabit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать привычку</DialogTitle>
          </DialogHeader>
          {editHabit && (
            <HabitForm habit={editHabit} onSuccess={() => setEditHabit(null)} />
          )}
        </DialogContent>
      </Dialog>

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
