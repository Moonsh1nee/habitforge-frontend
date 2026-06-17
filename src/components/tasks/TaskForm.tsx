"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { taskSchema, type TaskInput } from "@/lib/schemas/task.schema";
import { useCreateTask, useUpdateTask } from "@/lib/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "@/types";

interface TaskFormProps {
  task?: Task;
  defaultDueDate?: string;
  onSuccess?: () => void;
}

export function TaskForm({ task, defaultDueDate, onSuccess }: TaskFormProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isPending = createTask.isPending || updateTask.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description ?? undefined,
          priority: task.priority,
          dueDate: task.dueDate?.split("T")[0],
          isRecurring: task.isRecurring,
          recurrence: task.recurrence ?? undefined,
        }
      : { priority: 2, isRecurring: false, dueDate: defaultDueDate },
  });

  const onSubmit = (data: TaskInput) => {
    if (task) {
      updateTask.mutate({ id: task.id, payload: data as Partial<Task> }, { onSuccess });
    } else {
      createTask.mutate(data as Partial<Task>, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Название</Label>
        <Input placeholder="Что нужно сделать?" {...register("title")} />
        {errors.title && (
          <p className="text-danger text-xs">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Описание</Label>
        <Textarea placeholder="Подробности..." className="resize-none" rows={3} {...register("description")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Приоритет</Label>
          <Select
            value={String(watch("priority") ?? 2)}
            onValueChange={(v) => setValue("priority", Number(v ?? "2") as TaskInput["priority"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Высокий</SelectItem>
              <SelectItem value="2">Средний</SelectItem>
              <SelectItem value="3">Низкий</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Дедлайн</Label>
          <DatePicker
            value={watch("dueDate") ?? ""}
            onChange={(v) => setValue("dueDate", v || undefined)}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full gradient-primary text-white font-semibold"
      >
        {isPending && <Loader2 size={16} className="animate-spin mr-2" />}
        {task ? "Сохранить" : "Создать задачу"}
      </Button>
    </form>
  );
}
