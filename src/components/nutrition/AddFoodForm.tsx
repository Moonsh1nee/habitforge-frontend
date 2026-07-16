"use client";

import { useState } from "react";
import { useCreateNutritionLog } from "@/lib/hooks/useNutrition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SelectOption } from "@/components/shared/SelectOption";
import type { MealType } from "@/types";

const mealLabels: Record<MealType, string> = {
  breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", snack: "Перекус",
};
const mealIcons: Record<MealType, string> = {
  breakfast: "🌅", lunch: "🍽️", dinner: "🌙", snack: "🍎",
};

interface AddFoodFormProps {
  date: string;
  onSuccess: () => void;
}

export function AddFoodForm({ date, onSuccess }: AddFoodFormProps) {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const create = useCreateNutritionLog();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    create.mutate(
      {
        date,
        mealType,
        name: fd.get("name") as string,
        calories: Number(fd.get("calories")),
        protein: Number(fd.get("protein")),
        carbs: Number(fd.get("carbs")),
        fat: Number(fd.get("fat")),
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Название</Label>
        <Input name="name" placeholder="Куриная грудка" required />
      </div>
      <div className="space-y-2">
        <Label>Приём пищи</Label>
        <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(mealLabels) as [MealType, string][]).map(([k, v]) => (
              <SelectOption key={k} value={k} label={v} icon={mealIcons[k]} />
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[["calories", "Калории"], ["protein", "Белки (г)"], ["carbs", "Углеводы (г)"], ["fat", "Жиры (г)"]].map(
          ([name, label]) => (
            <div key={name} className="space-y-2">
              <Label className="text-xs">{label}</Label>
              <Input name={name} type="number" min={0} step={0.1} defaultValue={0} />
            </div>
          )
        )}
      </div>
      <Button type="submit" disabled={create.isPending} className="w-full bg-primary text-white">
        Добавить
      </Button>
    </form>
  );
}
