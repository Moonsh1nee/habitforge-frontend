"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, CheckSquare, Repeat2, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TaskForm } from "@/components/tasks/TaskForm";
import { HabitForm } from "@/components/habits/HabitForm";
import { FormDialog } from "@/components/shared/FormDialog";
import { usePlan } from "@/lib/hooks/usePlan";
import { useHabits } from "@/lib/hooks/useHabits";

type QuickAction = "task" | "habit" | null;

const ACTIONS = [
  {
    id: "task",
    icon: CheckSquare,
    label: "Задача",
    className: "text-warning hover:bg-warning/10",
  },
  {
    id: "habit",
    icon: Repeat2,
    label: "Привычка",
    className: "text-primary hover:bg-primary/10",
  },
  {
    id: "journal",
    icon: BookOpen,
    label: "Дневник",
    className: "text-accent hover:bg-accent/10",
    navigate: "/journal",
  },
] as const;

export function QuickAddFab() {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<QuickAction>(null);
  const router = useRouter();

  const { isAtLimit, getLimit } = usePlan();
  const { data: habitsData } = useHabits();
  const habitsCount = habitsData?.total ?? 0;

  const handleSelect = (id: string, navigate?: string) => {
    setOpen(false);
    if (navigate) {
      router.push(navigate);
      return;
    }
    if (id === "habit" && isAtLimit("habits", habitsCount)) {
      toast.error(`Лимит привычек достигнут (${habitsCount}/${getLimit("habits")})`, {
        description: "Перейдите на Pro для снятия ограничений",
        action: { label: "Upgrade →", onClick: () => router.push("/upgrade") },
        duration: 6000,
      });
      return;
    }
    setAction(id as QuickAction);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="fab-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Container */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-end gap-2.5">
        {/* Quick action items */}
        <AnimatePresence>
          {open &&
            [...ACTIONS].reverse().map((a, i) => (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, x: 8, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.85 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                onClick={() => handleSelect(a.id, "navigate" in a ? a.navigate : undefined)}
                className={`flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-xl glass border border-border text-sm font-medium transition-colors ${a.className}`}
              >
                <a.icon size={14} />
                {a.label}
              </motion.button>
            ))}
        </AnimatePresence>

        {/* FAB */}
        <motion.button
          onClick={() => setOpen((v) => !v)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl glow-primary"
          aria-label="Быстрое добавление"
        >
          <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <Plus size={22} className="text-white" />
          </motion.div>
        </motion.button>
      </div>

      {/* Dialogs */}
      <FormDialog
        open={action === "task"}
        onOpenChange={(o) => !o && setAction(null)}
        title="Новая задача"
      >
        <TaskForm onSuccess={() => setAction(null)} />
      </FormDialog>

      <FormDialog
        open={action === "habit"}
        onOpenChange={(o) => !o && setAction(null)}
        title="Новая привычка"
      >
        <HabitForm onSuccess={() => setAction(null)} />
      </FormDialog>
    </>
  );
}
