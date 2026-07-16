"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePlan, useUpdatePlan } from "@/lib/hooks/useWorkouts";
import type { WorkoutPlan } from "@/types";

interface PlanFormProps {
  plan?: WorkoutPlan;
  onSuccess: () => void;
}

export function PlanForm({ plan, onSuccess }: PlanFormProps) {
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const isPending = createPlan.isPending || updatePlan.isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      daysPerWeek: Number(fd.get("days")) || undefined,
    };
    if (plan) updatePlan.mutate({ id: plan.id, payload }, { onSuccess });
    else createPlan.mutate(payload, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Название</Label>
        <Input name="name" required defaultValue={plan?.name ?? ""} placeholder="Силовая A" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Дней в неделю</Label>
          <Input name="days" type="number" min={1} max={7} defaultValue={plan?.daysPerWeek ?? ""} placeholder="3" />
        </div>
        <div className="space-y-2">
          <Label>Описание</Label>
          <Input name="description" defaultValue={plan?.description ?? ""} placeholder="Необязательно" />
        </div>
      </div>
      <Button type="submit" disabled={isPending} className="w-full bg-primary text-white">
        {plan ? "Сохранить" : "Создать план"}
      </Button>
    </form>
  );
}
