"use client";

import { useState } from "react";
import { useAddPlanMeal, useUpdatePlanMeal } from "@/lib/hooks/useNutrition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SelectOption } from "@/components/shared/SelectOption";
import type { MealType, MealTemplate } from "@/types";

const mealLabels: Record<MealType, string> = {
  breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", snack: "Перекус",
};
const mealIcons: Record<MealType, string> = {
  breakfast: "🌅", lunch: "🍽️", dinner: "🌙", snack: "🍎",
};

interface MealTemplateFormProps {
  planId: string;
  meal?: MealTemplate;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MealTemplateForm({ planId, meal, onSuccess, onCancel }: MealTemplateFormProps) {
  const [mealType, setMealType] = useState<MealType>(meal?.mealType ?? "breakfast");
  const create = useAddPlanMeal(planId);
  const upd = useUpdatePlanMeal(planId);
  const isPending = create.isPending || upd.isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      mealType,
      calories: Number(fd.get("calories")) || undefined,
      protein: Number(fd.get("protein")) || undefined,
      carbs: Number(fd.get("carbs")) || undefined,
      fat: Number(fd.get("fat")) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    };
    if (meal) upd.mutate({ mealId: meal.id, payload }, { onSuccess });
    else create.mutate(payload, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/3 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Название</Label>
          <Input name="name" required defaultValue={meal?.name ?? ""} placeholder="Омлет" className="h-8 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Приём пищи</Label>
          <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(mealLabels) as [MealType, string][]).map(([k, v]) => (
                <SelectOption key={k} value={k} label={v} icon={mealIcons[k]} />
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {(
          [
            ["calories", "Ккал", meal?.calories],
            ["protein", "Белки", meal?.protein],
            ["carbs", "Углев", meal?.carbs],
            ["fat", "Жиры", meal?.fat],
          ] as [string, string, number | null | undefined][]
        ).map(([name, label, val]) => (
          <div key={name} className="space-y-1">
            <Label className="text-muted text-[10px]">{label}</Label>
            <Input name={name} type="number" min={0} step={0.1} defaultValue={val ?? ""} placeholder="0" className="h-7 text-xs" />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Заметки</Label>
        <Input name="notes" defaultValue={meal?.notes ?? ""} placeholder="Необязательно" className="h-8 text-sm" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={isPending} className="bg-primary text-white h-7 text-xs px-3">
          {meal ? "Сохранить" : "Добавить"}
        </Button>
        <button type="button" onClick={onCancel} className="text-xs text-muted hover:text-text">Отмена</button>
      </div>
    </form>
  );
}
