"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { habitSchema, type HabitInput } from "@/lib/schemas/habit.schema";
import { useCreateHabit, useUpdateHabit } from "@/lib/hooks/useHabits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Habit } from "@/types";

interface HabitFormProps {
  habit?: Habit;
  onSuccess?: () => void;
}

export function HabitForm({ habit, onSuccess }: HabitFormProps) {
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const isPending = createHabit.isPending || updateHabit.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HabitInput>({
    resolver: zodResolver(habitSchema),
    defaultValues: habit
      ? {
          name: habit.name,
          description: habit.description,
          frequency: habit.frequency,
          targetCount: habit.targetCount,
          color: habit.color,
        }
      : { frequency: "daily", targetCount: 1 },
  });

  const onSubmit = (data: HabitInput) => {
    if (habit) {
      updateHabit.mutate({ id: habit.id, payload: data }, { onSuccess });
    } else {
      createHabit.mutate(data, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-text/80">Название</Label>
        <Input
          placeholder="Например: Медитация"
          className="bg-white/5 border-border text-text placeholder:text-muted"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-danger text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-text/80">Описание</Label>
        <Textarea
          placeholder="Зачем эта привычка?"
          className="bg-white/5 border-border text-text placeholder:text-muted resize-none"
          rows={2}
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-text/80">Цвет</Label>
          <Input
            type="color"
            className="bg-white/5 border-border h-10 cursor-pointer"
            defaultValue="#7c3aed"
            {...register("color")}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-text/80">Цель (раз/день)</Label>
          <Input
            type="number"
            min={1}
            className="bg-white/5 border-border text-text"
            {...register("targetCount", { valueAsNumber: true })}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gradient-primary text-white font-semibold"
      >
        {isPending && <Loader2 size={16} className="animate-spin mr-2" />}
        {habit ? "Сохранить" : "Создать привычку"}
      </Button>
    </form>
  );
}
