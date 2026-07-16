"use client";

import { useCreateNutritionPlan, useUpdateNutritionPlan } from "@/lib/hooks/useNutrition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NutritionPlan } from "@/types";

interface NutritionPlanFormProps {
  plan?: NutritionPlan;
  onSuccess: () => void;
}

export function NutritionPlanForm({ plan, onSuccess }: NutritionPlanFormProps) {
  const create = useCreateNutritionPlan();
  const update = useUpdateNutritionPlan();
  const isPending = create.isPending || update.isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      targetCalories: Number(fd.get("calories")) || undefined,
      targetProtein: Number(fd.get("protein")) || undefined,
      targetCarbs: Number(fd.get("carbs")) || undefined,
      targetFat: Number(fd.get("fat")) || undefined,
    };
    if (plan) update.mutate({ id: plan.id, payload }, { onSuccess });
    else create.mutate(payload, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Название</Label>
        <Input name="name" required defaultValue={plan?.name ?? ""} placeholder="Набор массы" />
      </div>
      <div className="space-y-2">
        <Label>Описание</Label>
        <Textarea name="description" defaultValue={plan?.description ?? ""} placeholder="Необязательно" rows={2} className="resize-none" />
      </div>
      <p className="text-xs text-muted font-medium uppercase tracking-wide pt-1">Цели по макронутриентам</p>
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ["calories", "Калории", plan?.targetCalories],
            ["protein", "Белки (г)", plan?.targetProtein],
            ["carbs", "Углеводы (г)", plan?.targetCarbs],
            ["fat", "Жиры (г)", plan?.targetFat],
          ] as [string, string, number | null | undefined][]
        ).map(([name, label, val]) => (
          <div key={name} className="space-y-1.5">
            <Label className="text-xs">{label}</Label>
            <Input name={name} type="number" min={0} step={1} defaultValue={val ?? ""} placeholder="—" />
          </div>
        ))}
      </div>
      <Button type="submit" disabled={isPending} className="w-full bg-primary text-white">
        {plan ? "Сохранить" : "Создать план"}
      </Button>
    </form>
  );
}
