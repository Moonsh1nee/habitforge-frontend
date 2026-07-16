"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateLog, useUpdateLog } from "@/lib/hooks/useWorkouts";
import type { WorkoutLog } from "@/types";

interface LogFormProps {
  log?: WorkoutLog;
  onSuccess: () => void;
}

export function LogForm({ log, onSuccess }: LogFormProps) {
  const createLog = useCreateLog();
  const updateLog = useUpdateLog();
  const isPending = createLog.isPending || updateLog.isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      date: (fd.get("date") as string) || new Date().toISOString().split("T")[0],
      durationMinutes: Number(fd.get("duration")) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    };
    if (log) updateLog.mutate({ id: log.id, payload }, { onSuccess });
    else createLog.mutate(payload, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Дата</Label>
          <DatePicker name="date" defaultValue={log?.date ?? new Date().toISOString().split("T")[0]} />
        </div>
        <div className="space-y-2">
          <Label>Длительность (мин)</Label>
          <Input name="duration" type="number" min={1} defaultValue={log?.durationMinutes ?? ""} placeholder="60" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Заметки</Label>
        <Textarea name="notes" defaultValue={log?.notes ?? ""} placeholder="Как прошла тренировка?" className="resize-none" rows={3} />
      </div>
      <Button type="submit" disabled={isPending} className="w-full bg-primary text-white">
        {log ? "Сохранить" : "Записать тренировку"}
      </Button>
    </form>
  );
}
