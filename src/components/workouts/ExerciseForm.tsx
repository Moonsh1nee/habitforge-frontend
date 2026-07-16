"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddExercise, useAddExerciseLog } from "@/lib/hooks/useWorkouts";
import type { PlanExercise } from "@/types";

type ExerciseLike = Pick<PlanExercise, "name" | "muscleGroup" | "sets" | "repsPerSet" | "weightKg">;

// ─── Inline edit for existing exercise ───────────────────────────────────────

interface EditExerciseInlineProps {
  exercise: ExerciseLike;
  onSave: (payload: Partial<ExerciseLike>) => void;
  onCancel: () => void;
}

export function EditExerciseInline({ exercise, onSave, onCancel }: EditExerciseInlineProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      name: fd.get("name") as string,
      muscleGroup: (fd.get("muscleGroup") as string) || undefined,
      sets: Number(fd.get("sets")) || undefined,
      repsPerSet: Number(fd.get("reps")) || undefined,
      weightKg: Number(fd.get("weight")) || undefined,
    });
  };
  return (
    <form onSubmit={handleSubmit} className="bg-white/3 rounded-lg p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Input name="name" defaultValue={exercise.name} required placeholder="Упражнение" className="h-8 text-xs" />
        <Input name="muscleGroup" defaultValue={exercise.muscleGroup ?? ""} placeholder="Группа мышц" className="h-8 text-xs" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Input name="sets" type="number" min={1} defaultValue={exercise.sets ?? ""} placeholder="Подходы" className="h-8 text-xs" />
        <Input name="reps" type="number" min={1} defaultValue={exercise.repsPerSet ?? ""} placeholder="Повт" className="h-8 text-xs" />
        <Input name="weight" type="number" min={0} step={0.5} defaultValue={exercise.weightKg ?? ""} placeholder="Кг" className="h-8 text-xs" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" className="bg-primary text-white h-7 text-xs px-3">Сохранить</Button>
        <button type="button" onClick={onCancel} className="text-xs text-muted hover:text-text">Отмена</button>
      </div>
    </form>
  );
}

// ─── Add new exercise ─────────────────────────────────────────────────────────

interface ExerciseFormProps {
  planId?: string;
  logId?: string;
  onSuccess: () => void;
}

export function ExerciseForm({ planId, logId, onSuccess }: ExerciseFormProps) {
  const addToPlan = useAddExercise();
  const addToLog = useAddExerciseLog();
  const isPending = addToPlan.isPending || addToLog.isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      muscleGroup: (fd.get("muscleGroup") as string) || undefined,
      sets: Number(fd.get("sets")) || undefined,
      repsPerSet: Number(fd.get("reps")) || undefined,
      weightKg: Number(fd.get("weight")) || undefined,
    };
    if (planId) addToPlan.mutate({ planId, payload }, { onSuccess });
    else if (logId) addToLog.mutate({ logId, payload }, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Упражнение</Label>
          <Input name="name" required placeholder="Жим лёжа" className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Группа мышц</Label>
          <Input name="muscleGroup" placeholder="Грудь" className="h-9" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Подходы</Label>
          <Input name="sets" type="number" min={1} placeholder="3" className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Повторения</Label>
          <Input name="reps" type="number" min={1} placeholder="10" className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Вес (кг)</Label>
          <Input name="weight" type="number" min={0} step={0.5} placeholder="60" className="h-9" />
        </div>
      </div>
      <Button type="submit" disabled={isPending} size="sm" className="w-full bg-primary text-white">
        Добавить упражнение
      </Button>
    </form>
  );
}
