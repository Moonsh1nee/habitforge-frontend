"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CalendarClock, X, Tag as TagIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { taskSchema, type TaskInput } from "@/lib/schemas/task.schema";
import { useCreateTask, useUpdateTask } from "@/lib/hooks/useTasks";
import { useProjects } from "@/lib/hooks/useProjects";
import { useTags } from "@/lib/hooks/useTags";
import { tagsApi } from "@/lib/api/tags";
import { cn, parseNaturalDate } from "@/lib/utils";
import { CollapsibleBody } from "@/components/shared/CollapsibleBody";
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

  const [advancedOpen, setAdvancedOpen] = useState(false);
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
          status: task.status ?? "todo",
          icon: task.icon ?? undefined,
          coverColor: task.coverColor ?? undefined,
          estimatedMinutes: task.estimatedMinutes ?? undefined,
          dueDate: task.dueDate?.split("T")[0],
          isRecurring: task.isRecurring,
          recurrence: task.recurrence ?? undefined,
          projectId: task.projectId ?? undefined,
        }
      : {
          priority: 2,
          status: "todo",
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
      const updated = await updateTask.mutateAsync({ id: task.id, payload: { ...data, estimatedMinutes: data.estimatedMinutes ?? null } as Partial<Task> });
      await syncTags(updated.id);
    } else {
      const created = await createTask.mutateAsync({ ...data, estimatedMinutes: data.estimatedMinutes ?? null } as Partial<Task>);
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
          <Label>Статус</Label>
          <Select
            value={watch("status") ?? "todo"}
            onValueChange={(v) => setValue("status", (v ?? "todo") as TaskInput["status"])}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">К работе</SelectItem>
              <SelectItem value="in_progress">В работе</SelectItem>
              <SelectItem value="review">На проверке</SelectItem>
              <SelectItem value="done">Готово</SelectItem>
              <SelectItem value="cancelled">Отменено</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Дедлайн</Label>
        <DatePicker
          value={watch("dueDate") ?? ""}
          onChange={(v) => { setValue("dueDate", v || undefined); setDetectedDate(null); }}
        />
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

      {/* Advanced toggle */}
      <button
        type="button"
        onClick={() => setAdvancedOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
      >
        <motion.span animate={{ rotate: advancedOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={12} />
        </motion.span>
        Дополнительно
      </button>

      <CollapsibleBody expanded={advancedOpen}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Иконка (emoji)</Label>
            <Input placeholder="📌" maxLength={10} {...register("icon")} />
          </div>

          <div className="space-y-2">
            <Label>Оценка времени (мин)</Label>
            <Input
              type="number"
              min={1}
              placeholder="30"
              {...register("estimatedMinutes", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Цвет карточки</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={watch("coverColor") ?? "#7c3aed"}
              onChange={(e) => setValue("coverColor", e.target.value)}
              className="w-9 h-9 rounded cursor-pointer bg-transparent border border-border"
            />
            <Input
              placeholder="#7c3aed"
              value={watch("coverColor") ?? ""}
              onChange={(e) => setValue("coverColor", e.target.value || undefined)}
              className="flex-1"
            />
            {watch("coverColor") && (
              <button type="button" onClick={() => setValue("coverColor", undefined)} className="text-muted hover:text-text text-xs shrink-0">
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Повторение</Label>
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
      </CollapsibleBody>

      <Button type="submit" disabled={isPending} className="w-full bg-primary text-white font-semibold">
        {isPending && <Loader2 size={16} className="animate-spin mr-2" />}
        {task ? "Сохранить" : "Создать задачу"}
      </Button>
    </form>
  );
}
