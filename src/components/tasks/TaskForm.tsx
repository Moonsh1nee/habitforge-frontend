"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CalendarClock, X, Tag as TagIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { taskSchema, type TaskInput } from "@/lib/schemas/task.schema";
import { useCreateTask, useUpdateTask } from "@/lib/hooks/useTasks";
import { useProjects } from "@/lib/hooks/useProjects";
import { useTags } from "@/lib/hooks/useTags";
import { tagsApi } from "@/lib/api/tags";
import { cn, parseNaturalDate } from "@/lib/utils";
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
  defaultProjectId?: string;
  onSuccess?: () => void;
}

export function TaskForm({ task, defaultDueDate, defaultProjectId, onSuccess }: TaskFormProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: projects = [] } = useProjects();
  const { data: allTags = [] } = useTags();
  const isPending = createTask.isPending || updateTask.isPending;

  const [detectedDate, setDetectedDate] = useState<{
    date: string;
    label: string;
    matchText: string;
  } | null>(null);

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    task?.tags?.map((t) => t.id) ?? []
  );

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
          projectId: task.projectId ?? undefined,
        }
      : {
          priority: 2,
          isRecurring: false,
          dueDate: defaultDueDate,
          projectId: defaultProjectId,
        },
  });

  const syncTags = async (taskId: string) => {
    const oldIds = task?.tags?.map((t) => t.id) ?? [];
    const toAdd = selectedTagIds.filter((id) => !oldIds.includes(id));
    const toRemove = oldIds.filter((id) => !selectedTagIds.includes(id));
    await Promise.all([
      ...toAdd.map((tagId) => tagsApi.addToTask(taskId, tagId)),
      ...toRemove.map((tagId) => tagsApi.removeFromTask(taskId, tagId)),
    ]);
  };

  const onSubmit = async (data: TaskInput) => {
    if (task) {
      const updated = await updateTask.mutateAsync({ id: task.id, payload: data as Partial<Task> });
      await syncTags(updated.id);
    } else {
      const created = await createTask.mutateAsync(data as Partial<Task>);
      await syncTags(created.id);
    }
    onSuccess?.();
  };

  const handleTitleChange = (value: string) => {
    if (!watch("dueDate")) {
      const parsed = parseNaturalDate(value);
      setDetectedDate(parsed);
    } else {
      setDetectedDate(null);
    }
  };

  const applyDetectedDate = () => {
    if (!detectedDate) return;
    setValue("dueDate", detectedDate.date);
    setDetectedDate(null);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Название</Label>
        <Input
          placeholder="Что нужно сделать?"
          {...register("title", {
            onChange: (e) => handleTitleChange(e.target.value),
          })}
        />
        {errors.title && <p className="text-danger text-xs">{errors.title.message}</p>}

        <AnimatePresence>
          {detectedDate && (
            <motion.div
              key="date-hint"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25 text-primary text-xs"
            >
              <CalendarClock size={12} className="shrink-0" />
              <span className="flex-1">📅 {detectedDate.label}</span>
              <button type="button" onClick={applyDetectedDate} className="font-semibold hover:text-white transition-colors">
                Применить
              </button>
              <button type="button" onClick={() => setDetectedDate(null)} className="text-primary/60 hover:text-primary transition-colors" aria-label="Закрыть">
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
            <SelectTrigger><SelectValue /></SelectTrigger>
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
            onChange={(v) => { setValue("dueDate", v || undefined); setDetectedDate(null); }}
          />
        </div>
      </div>

      {/* Project */}
      {projects.length > 0 && (
        <div className="space-y-2">
          <Label>Проект</Label>
          <Select
            value={watch("projectId") ?? "none"}
            onValueChange={(v) => setValue("projectId", !v || v === "none" ? undefined : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Без проекта" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Без проекта</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
                    {p.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <TagIcon size={12} />
            Теги
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border transition-all",
                    selected ? "font-medium" : "border-border text-muted hover:text-text"
                  )}
                  style={selected ? { color: tag.color, borderColor: `${tag.color}60`, background: `${tag.color}15` } : {}}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recurrence */}
      <div className="space-y-2">
        <Label className="text-sm">Повторение</Label>
        <div className="flex flex-wrap gap-2">
          {(["daily", "weekly", "monthly"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                if (watch("recurrence") === r) {
                  setValue("isRecurring", false);
                  setValue("recurrence", undefined);
                } else {
                  setValue("isRecurring", true);
                  setValue("recurrence", r);
                }
              }}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-all",
                watch("recurrence") === r
                  ? "border-primary/60 text-primary bg-primary/10"
                  : "border-border text-muted hover:text-text hover:border-border/80"
              )}
            >
              {r === "daily" ? "Ежедневно" : r === "weekly" ? "Еженедельно" : "Ежемесячно"}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full bg-primary text-white font-semibold">
        {isPending && <Loader2 size={16} className="animate-spin mr-2" />}
        {task ? "Сохранить" : "Создать задачу"}
      </Button>
    </form>
  );
}
