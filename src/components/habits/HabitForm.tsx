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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types";

const WEEKDAYS = [
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
  { value: 7, label: "Вс" },
];

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<HabitInput>({
    resolver: zodResolver(habitSchema),
    defaultValues: habit
      ? {
          title: habit.title,
          description: habit.description ?? undefined,
          frequency: habit.frequency,
          targetPerWeek: habit.targetPerWeek ?? undefined,
          weekdays: habit.weekdays ?? undefined,
          color: habit.color ?? "#7c3aed",
          icon: habit.icon ?? undefined,
        }
      : { frequency: "daily", color: "#7c3aed" },
  });

  const frequency = watch("frequency");
  const selectedWeekdays = watch("weekdays") ?? [];

  const toggleWeekday = (day: number) => {
    const current = selectedWeekdays;
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => a - b);
    setValue("weekdays", next);
  };

  const onSubmit = (data: HabitInput) => {
    // strip fields irrelevant for the chosen frequency
    const payload = {
      ...data,
      targetPerWeek: data.frequency === "weekly" ? data.targetPerWeek : undefined,
      weekdays: data.frequency === "weekdays" ? data.weekdays : undefined,
    };
    if (habit) {
      updateHabit.mutate({ id: habit.id, payload: payload as Partial<Habit> }, { onSuccess });
    } else {
      createHabit.mutate(payload as Partial<Habit>, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title + Icon */}
      <div className="flex gap-3">
        <div className="space-y-2 flex-1">
          <Label className="text-text/80">Название</Label>
          <Input
            placeholder="Например: Медитация"
            className="bg-white/5 border-border text-text placeholder:text-muted"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-danger text-xs">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2 w-20">
          <Label className="text-text/80">Иконка</Label>
          <Input
            placeholder="🏃"
            maxLength={2}
            className="bg-white/5 border-border text-text text-center text-lg"
            {...register("icon")}
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-text/80">Описание</Label>
        <Textarea
          placeholder="Зачем эта привычка?"
          className="bg-white/5 border-border text-text placeholder:text-muted resize-none"
          rows={2}
          {...register("description")}
        />
      </div>

      {/* Color + Frequency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-text/80">Цвет</Label>
          <Input
            type="color"
            className="bg-white/5 border-border h-10 cursor-pointer"
            {...register("color")}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-text/80">Частота</Label>
          <Select
            value={frequency ?? "daily"}
            onValueChange={(v) => {
              setValue("frequency", v as HabitInput["frequency"]);
              setValue("targetPerWeek", undefined);
              setValue("weekdays", undefined);
            }}
          >
            <SelectTrigger className="bg-white/5 border-border text-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#13131a] border-border">
              <SelectItem value="daily">Ежедневно</SelectItem>
              <SelectItem value="weekly">Раз в неделю</SelectItem>
              <SelectItem value="weekdays">По дням</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* targetPerWeek — only for weekly */}
      {frequency === "weekly" && (
        <div className="space-y-2">
          <Label className="text-text/80">Цель (раз в неделю)</Label>
          <Input
            type="number"
            min={1}
            max={7}
            placeholder="3"
            className="bg-white/5 border-border text-text"
            {...register("targetPerWeek", { valueAsNumber: true })}
          />
          {errors.targetPerWeek && (
            <p className="text-danger text-xs">{errors.targetPerWeek.message}</p>
          )}
        </div>
      )}

      {/* Weekday picker — only for weekdays */}
      {frequency === "weekdays" && (
        <div className="space-y-2">
          <Label className="text-text/80">Дни недели</Label>
          <div className="flex gap-1.5">
            {WEEKDAYS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleWeekday(value)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  selectedWeekdays.includes(value)
                    ? "bg-primary/20 border-primary/60 text-primary"
                    : "bg-white/5 border-border text-muted hover:text-text"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

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
