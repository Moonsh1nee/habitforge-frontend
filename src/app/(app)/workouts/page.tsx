"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Plus, Dumbbell, Clock, ChevronRight } from "lucide-react";
import { workoutsApi } from "@/lib/api/workouts";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

function WorkoutLogForm({ onSuccess }: { onSuccess: () => void }) {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: workoutsApi.createLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-logs"] });
      toast.success("Тренировка записана!");
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    create.mutate({
      date: (fd.get("date") as string) || new Date().toISOString().split("T")[0],
      durationMinutes: Number(fd.get("duration")),
      notes: fd.get("notes") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-text/80">Дата</Label>
          <Input
            name="date"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="bg-white/5 border-border text-text"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-text/80">Длительность (мин)</Label>
          <Input
            name="duration"
            type="number"
            min={1}
            placeholder="60"
            className="bg-white/5 border-border text-text"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-text/80">Заметки</Label>
        <Textarea
          name="notes"
          placeholder="Как прошла тренировка?"
          className="bg-white/5 border-border text-text resize-none"
          rows={3}
        />
      </div>
      <Button
        type="submit"
        disabled={create.isPending}
        className="w-full gradient-primary text-white"
      >
        Записать тренировку
      </Button>
    </form>
  );
}

export default function WorkoutsPage() {
  const [logOpen, setLogOpen] = useState(false);

  const { data: plans } = useQuery({
    queryKey: ["workout-plans"],
    queryFn: workoutsApi.getPlans,
  });

  const { data: logs } = useQuery({
    queryKey: ["workout-logs"],
    queryFn: () => workoutsApi.getLogs({ limit: 20 }),
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Тренировки</h1>
        <Button
          onClick={() => setLogOpen(true)}
          className="gradient-primary text-white gap-2"
        >
          <Plus size={16} />
          Записать тренировку
        </Button>
      </div>

      <Tabs defaultValue="logs">
        <TabsList className="bg-white/5 border border-border">
          <TabsTrigger value="logs" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Логи
          </TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Планы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="mt-4 space-y-3">
          {!logs || logs.length === 0 ? (
            <EmptyState
              icon={<Dumbbell />}
              title="Нет записей тренировок"
              description="Начните записывать свои тренировки"
            />
          ) : (
            logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Dumbbell size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">
                      {formatDate(log.date)}
                    </p>
                    <p className="text-xs text-muted">{log.notes ?? "Без заметок"}</p>
                  </div>
                </div>
                {log.durationMinutes && (
                  <div className="flex items-center gap-1.5 text-sm text-accent">
                    <Clock size={14} />
                    {log.durationMinutes} мин
                  </div>
                )}
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          {!plans || plans.length === 0 ? (
            <EmptyState
              icon={<Dumbbell />}
              title="Нет планов тренировок"
              description="Создайте план для структурированных тренировок"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <GlassCard key={plan.id} hover className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text">{plan.name}</h3>
                    <p className="text-xs text-muted mt-1">
                      {plan.daysPerWeek} дней в неделю
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted" />
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="bg-[#13131a] border-border">
          <DialogHeader>
            <DialogTitle className="text-text">Записать тренировку</DialogTitle>
          </DialogHeader>
          <WorkoutLogForm onSuccess={() => setLogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
