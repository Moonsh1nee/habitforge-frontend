"use client";

import { useState } from "react";
import { Plus, Repeat2 } from "lucide-react";
import { motion } from "motion/react";
import { useHabits, useLogHabit } from "@/lib/hooks/useHabits";
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
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const logHabit = useLogHabit();

  const { data, isLoading } = useHabits({ archived: false });
  const habits = data?.items ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Привычки</h1>
          <p className="text-sm text-muted mt-0.5">{habits.length} привычек</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="gradient-primary text-white gap-2"
        >
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
            <Button
              onClick={() => setFormOpen(true)}
              className="gradient-primary text-white"
            >
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
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create habit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-[#13131a] border-border">
          <DialogHeader>
            <DialogTitle className="text-text">Новая привычка</DialogTitle>
          </DialogHeader>
          <HabitForm onSuccess={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Habit detail sheet */}
      <Sheet
        open={!!selectedHabit}
        onOpenChange={(o) => !o && setSelectedHabit(null)}
      >
        <SheetContent
          side="right"
          className="bg-[#13131a] border-border w-full sm:max-w-lg overflow-y-auto"
        >
          {selectedHabit && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-text flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background:
                        selectedHabit.color ?? "var(--color-primary)",
                    }}
                  />
                  {selectedHabit.name}
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
