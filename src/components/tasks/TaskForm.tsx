"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { taskSchema, type TaskInput } from "@/lib/schemas/task.schema";
import { useCreateTask, useUpdateTask } from "@/lib/hooks/useTasks";
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
import type { Task } from "@/types";

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
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
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate?.split("T")[0],
        }
      : { priority: "medium", status: "todo" },
  });

  const onSubmit = (data: TaskInput) => {
    if (task) {
      updateTask.mutate(
        { id: task.id, payload: data },
        { onSuccess }
      );
    } else {
      createTask.mutate(data, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-text/80">Название</Label>
        <Input
          placeholder="Что нужно сделать?"
          className="bg-white/5 border-border text-text placeholder:text-muted"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-danger text-xs">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-text/80">Описание</Label>
        <Textarea
          placeholder="Подробности..."
          className="bg-white/5 border-border text-text placeholder:text-muted resize-none"
          rows={3}
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-text/80">Приоритет</Label>
          <Select
            defaultValue={watch("priority")}
            onValueChange={(v) => setValue("priority", v as TaskInput["priority"])}
          >
            <SelectTrigger className="bg-white/5 border-border text-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#13131a] border-border">
              <SelectItem value="low">Низкий</SelectItem>
              <SelectItem value="medium">Средний</SelectItem>
              <SelectItem value="high">Высокий</SelectItem>
              <SelectItem value="critical">Критический</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-text/80">Дедлайн</Label>
          <Input
            type="date"
            className="bg-white/5 border-border text-text"
            {...register("dueDate")}
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
