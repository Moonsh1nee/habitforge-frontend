"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { telegramApi, type Reminder } from "@/lib/api/telegram";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface TelegramReminderFormProps {
  onSuccess: () => void;
}

export function TelegramReminderForm({ onSuccess }: TelegramReminderFormProps) {
  const qc = useQueryClient();
  const [type, setType] = useState("custom");

  const create = useMutation({
    mutationFn: (p: Partial<Reminder>) => telegramApi.createReminder(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["telegram-reminders"] });
      toast.success("Напоминание создано");
      onSuccess();
    },
    onError: () => toast.error("Ошибка создания напоминания"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    create.mutate({
      title: fd.get("title") as string,
      type,
      message: fd.get("message") as string,
      cronExpression: fd.get("cron") as string,
      isActive: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Название</Label>
        <Input name="title" placeholder="Утренняя медитация" />
      </div>
      <div className="space-y-2">
        <Label>Тип</Label>
        <Select value={type} onValueChange={(v) => setType(v ?? "custom")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="habit">Привычка</SelectItem>
            <SelectItem value="task">Задача</SelectItem>
            <SelectItem value="custom">Произвольное</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Сообщение</Label>
        <Textarea name="message" placeholder="Текст напоминания..." className="resize-none" rows={2} />
      </div>
      <div className="space-y-2">
        <Label>
          Cron-расписание
          <span className="text-muted text-xs ml-2">например: 0 9 * * 1-5</span>
        </Label>
        <Input name="cron" placeholder="0 9 * * *" className="font-mono text-sm" />
      </div>
      <Button type="submit" disabled={create.isPending} className="w-full bg-primary text-white">
        {create.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
        Создать напоминание
      </Button>
    </form>
  );
}
