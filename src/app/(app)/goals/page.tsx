"use client";

import { useState } from "react";
import { Plus, Target, Trash2, Pencil, CheckCircle2, Archive } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { staggerContainer } from "@/lib/constants/motionVariants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useAddProgress } from "@/lib/hooks/useGoals";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Goal, GoalCategory, GoalStatus } from "@/types";

// ─── Schema ──────────────────────────────────────────────────────────────────

const goalSchema = z.object({
  title: z.string().min(1, "Обязательное поле"),
  category: z.enum(["health", "fitness", "productivity", "finance", "learning", "other"]),
  target_value: z.coerce.number().positive("Должно быть больше 0"),
  current_value: z.coerce.number().min(0).optional(),
  unit: z.string().min(1, "Обязательное поле"),
  due_date: z.string().optional(),
});

type GoalInput = z.input<typeof goalSchema>;

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  health: "🏥 Здоровье",
  fitness: "💪 Фитнес",
  productivity: "⚡ Продуктивность",
  finance: "💰 Финансы",
  learning: "📚 Обучение",
  other: "🎯 Другое",
};

const STATUS_TABS = [
  { value: "active", label: "Активные" },
  { value: "completed", label: "Выполнены" },
  { value: "archived", label: "Архив" },
];

// ─── Goal Form ────────────────────────────────────────────────────────────────

function GoalForm({
  goal,
  onSuccess,
}: {
  goal?: Goal;
  onSuccess: () => void;
}) {
  const create = useCreateGoal();
  const update = useUpdateGoal();
  const isPending = create.isPending || update.isPending;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title ?? "",
      category: goal?.category ?? "other",
      target_value: goal?.targetValue ?? undefined,
      current_value: goal?.currentValue ?? 0,
      unit: goal?.unit ?? "",
      due_date: goal?.dueDate ?? "",
    },
  });

  const category = watch("category");

  const onSubmit = (values: GoalInput) => {
    if (goal) {
      update.mutate(
        {
          id: goal.id,
          payload: {
            title: values.title,
            category: values.category,
            targetValue: values.target_value as number,
            unit: values.unit,
            dueDate: values.due_date || null,
          },
        },
        { onSuccess }
      );
    } else {
      create.mutate(
        {
          title: values.title,
          category: values.category,
          targetValue: values.target_value as number,
          currentValue: (values.current_value as number) ?? 0,
          unit: values.unit,
          dueDate: values.due_date || null,
        },
        { onSuccess }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Название</Label>
        <Input {...register("title")} placeholder="Пробежать 100 км" />
        {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Категория</Label>
          <Select value={category} onValueChange={(v) => setValue("category", (v ?? "other") as GoalCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Единица</Label>
          <Input {...register("unit")} placeholder="км, кг, книг..." />
          {errors.unit && <p className="text-xs text-danger">{errors.unit.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Цель</Label>
          <Input {...register("target_value")} type="number" min={1} placeholder="100" />
          {errors.target_value && <p className="text-xs text-danger">{errors.target_value.message}</p>}
        </div>

        {!goal && (
          <div className="space-y-2">
            <Label>Старт (текущее)</Label>
            <Input {...register("current_value")} type="number" min={0} placeholder="0" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Дедлайн <span className="text-muted text-xs">(опционально)</span></Label>
        <Input {...register("due_date")} type="date" />
      </div>

      <Button type="submit" disabled={isPending} className="bg-primary text-white w-full">
        {goal ? "Сохранить" : "Создать цель"}
      </Button>
    </form>
  );
}

// ─── Progress Form ────────────────────────────────────────────────────────────

function ProgressForm({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const addProgress = useAddProgress();
  const [value, setValue] = useState<string>("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    addProgress.mutate({ id: goal.id, value: num, note: note || undefined }, { onSuccess: onClose });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted">
        Текущий прогресс: <span className="text-text font-semibold">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
      </p>
      <div className="space-y-2">
        <Label>Новое значение ({goal.unit})</Label>
        <Input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={String(goal.currentValue)}
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label>Заметка <span className="text-muted text-xs">(опционально)</span></Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Пробежал 5 км сегодня" />
      </div>
      <Button type="submit" disabled={addProgress.isPending} className="bg-primary text-white w-full">
        Обновить прогресс
      </Button>
    </form>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────

function GoalCard({ goal }: { goal: Goal }) {
  const [editOpen, setEditOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const deleteGoal = useDeleteGoal();
  const updateGoal = useUpdateGoal();

  const pct = Math.min(Math.round(goal.progressPct ?? (goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0)), 100);

  const ringColor =
    pct >= 100 ? "var(--color-success)"
    : pct >= 60 ? "var(--color-primary)"
    : pct >= 30 ? "var(--color-warning)"
    : "var(--color-muted)";

  const isCompleted = goal.isCompleted || goal.status === "completed";
  const isArchived = goal.status === "archived";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className={cn("glass p-5 flex flex-col gap-4", isCompleted && "border-success/20")}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted mb-0.5">{CATEGORY_LABELS[goal.category]}</p>
            <h3 className={cn("font-semibold text-text truncate", isCompleted && "line-through text-muted")}>
              {goal.title}
            </h3>
            {goal.dueDate && (
              <p className="text-xs text-muted mt-0.5">
                до {format(new Date(goal.dueDate), "d MMM yyyy", { locale: ru })}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isCompleted && !isArchived && (
              <button
                onClick={() => setEditOpen(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors"
              >
                <Pencil size={13} />
              </button>
            )}
            {!isArchived && (
              <button
                onClick={() => updateGoal.mutate({ id: goal.id, payload: { status: "archived" } })}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors"
                title="Архивировать"
              >
                <Archive size={13} />
              </button>
            )}
            <button
              onClick={() => deleteGoal.mutate(goal.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <ProgressRing
            value={pct}
            size={64}
            strokeWidth={5}
            color={ringColor}
            label={`${pct}%`}
          />

          <div className="flex-1">
            <div className="flex items-end gap-1">
              <AnimatedNumber
                value={goal.currentValue}
                decimals={goal.currentValue % 1 !== 0 ? 1 : 0}
                className="text-xl font-bold text-text tabular-nums"
              />
              <span className="text-muted text-sm mb-0.5">/ {goal.targetValue} {goal.unit}</span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              {isCompleted ? "✅ Цель достигнута!" : `Осталось ${Math.max(0, goal.targetValue - goal.currentValue)} ${goal.unit}`}
            </p>
          </div>
        </div>

        {/* Action */}
        {!isCompleted && !isArchived && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setProgressOpen(true)}
            className="w-full border-border text-text hover:bg-white/5 gap-1.5"
          >
            <CheckCircle2 size={14} />
            Обновить прогресс
          </Button>
        )}
      </motion.div>

      <FormDialog open={editOpen} onOpenChange={setEditOpen} title="Редактировать цель">
        <GoalForm goal={goal} onSuccess={() => setEditOpen(false)} />
      </FormDialog>

      <FormDialog open={progressOpen} onOpenChange={setProgressOpen} title="Обновить прогресс">
        <ProgressForm goal={goal} onClose={() => setProgressOpen(false)} />
      </FormDialog>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const [status, setStatus] = useState<GoalStatus>("active");
  const [formOpen, setFormOpen] = useState(false);

  const { data: goals = [], isLoading } = useGoals(status);

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Цели"
        subtitle={`${goals.length} ${status === "active" ? "активных" : status === "completed" ? "выполненных" : "в архиве"}`}
        action={
          <Button onClick={() => setFormOpen(true)} className="bg-primary text-white gap-2">
            <Plus size={16} />
            Новая цель
          </Button>
        }
      />

      <FilterTabs
        value={status}
        onChange={(v) => setStatus(v as GoalStatus)}
        options={STATUS_TABS}
      />

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={<Target />}
          title={
            status === "active"
              ? "Нет активных целей"
              : status === "completed"
              ? "Нет выполненных целей"
              : "Архив пуст"
          }
          description={
            status === "active"
              ? "Поставьте первую цель и отслеживайте прогресс"
              : "Выполненные цели появятся здесь"
          }
          action={
            status === "active" ? (
              <Button onClick={() => setFormOpen(true)} className="bg-primary text-white">
                Поставить цель
              </Button>
            ) : undefined
          }
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title="Новая цель">
        <GoalForm onSuccess={() => setFormOpen(false)} />
      </FormDialog>
    </div>
  );
}
