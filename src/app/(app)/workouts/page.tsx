"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Dumbbell, Clock, Pencil, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  useWorkoutPlans, useWorkoutPlan, useWorkoutLogs, useWorkoutLog,
  useCreatePlan, useUpdatePlan, useDeletePlan,
  useAddExercise, useCreateLog, useUpdateLog, useDeleteLog, useAddExerciseLog,
  useUpdatePlanExercise, useDeletePlanExercise,
  useUpdateLogExercise, useDeleteLogExercise,
} from "@/lib/hooks/useWorkouts";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import type { WorkoutPlan, WorkoutLog, PlanExercise, ExerciseLog } from "@/types";

// ─── Inline exercise editor ───────────────────────────────────────────────────

type ExerciseLike = Pick<PlanExercise, "name" | "muscleGroup" | "sets" | "repsPerSet" | "weightKg">;

function EditExerciseInline({
  exercise,
  onSave,
  onCancel,
}: {
  exercise: ExerciseLike;
  onSave: (payload: Partial<ExerciseLike>) => void;
  onCancel: () => void;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      name: fd.get("name") as string,
      muscleGroup: (fd.get("muscleGroup") as string) || undefined,
      sets: Number(fd.get("sets")) || undefined,
      repsPerSet: Number(fd.get("reps")) || undefined,
      weightKg: Number(fd.get("weight")) || undefined,
    });
  };
  return (
    <form onSubmit={handleSubmit} className="bg-white/3 rounded-lg p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Input name="name" defaultValue={exercise.name} required placeholder="Упражнение" className="bg-white/5 border-border text-text h-8 text-xs" />
        <Input name="muscleGroup" defaultValue={exercise.muscleGroup ?? ""} placeholder="Группа мышц" className="bg-white/5 border-border text-text h-8 text-xs" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Input name="sets" type="number" min={1} defaultValue={exercise.sets ?? ""} placeholder="Подходы" className="bg-white/5 border-border text-text h-8 text-xs" />
        <Input name="reps" type="number" min={1} defaultValue={exercise.repsPerSet ?? ""} placeholder="Повт" className="bg-white/5 border-border text-text h-8 text-xs" />
        <Input name="weight" type="number" min={0} step={0.5} defaultValue={exercise.weightKg ?? ""} placeholder="Кг" className="bg-white/5 border-border text-text h-8 text-xs" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" className="gradient-primary text-white h-7 text-xs px-3">Сохранить</Button>
        <button type="button" onClick={onCancel} className="text-xs text-muted hover:text-text">Отмена</button>
      </div>
    </form>
  );
}

// ─── Log Form ─────────────────────────────────────────────────────────────────

function LogForm({
  log,
  plans,
  onSuccess,
}: {
  log?: WorkoutLog;
  plans: WorkoutPlan[];
  onSuccess: () => void;
}) {
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
    if (log) {
      updateLog.mutate({ id: log.id, payload }, { onSuccess });
    } else {
      createLog.mutate(payload, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-text/80">Дата</Label>
          <Input
            name="date"
            type="date"
            defaultValue={log?.date ?? new Date().toISOString().split("T")[0]}
            className="bg-white/5 border-border text-text"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-text/80">Длительность (мин)</Label>
          <Input
            name="duration"
            type="number"
            min={1}
            defaultValue={log?.durationMinutes ?? ""}
            placeholder="60"
            className="bg-white/5 border-border text-text"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-text/80">Заметки</Label>
        <Textarea
          name="notes"
          defaultValue={log?.notes ?? ""}
          placeholder="Как прошла тренировка?"
          className="bg-white/5 border-border text-text resize-none"
          rows={3}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full gradient-primary text-white">
        {log ? "Сохранить" : "Записать тренировку"}
      </Button>
    </form>
  );
}

// ─── Exercise Form ────────────────────────────────────────────────────────────

function ExerciseForm({
  planId,
  logId,
  onSuccess,
}: {
  planId?: string;
  logId?: string;
  onSuccess: () => void;
}) {
  const addToPlan = useAddExercise();
  const addToLog = useAddExerciseLog();
  const isPending = addToPlan.isPending || addToLog.isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      muscleGroup: (fd.get("muscleGroup") as string) || undefined,
      sets: Number(fd.get("sets")) || undefined,
      repsPerSet: Number(fd.get("reps")) || undefined,
      weightKg: Number(fd.get("weight")) || undefined,
    };
    if (planId) addToPlan.mutate({ planId, payload }, { onSuccess });
    else if (logId) addToLog.mutate({ logId, payload }, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-text/80 text-xs">Упражнение</Label>
          <Input name="name" required placeholder="Жим лёжа" className="bg-white/5 border-border text-text h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-text/80 text-xs">Группа мышц</Label>
          <Input name="muscleGroup" placeholder="Грудь" className="bg-white/5 border-border text-text h-9" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-text/80 text-xs">Подходы</Label>
          <Input name="sets" type="number" min={1} placeholder="3" className="bg-white/5 border-border text-text h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-text/80 text-xs">Повторения</Label>
          <Input name="reps" type="number" min={1} placeholder="10" className="bg-white/5 border-border text-text h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-text/80 text-xs">Вес (кг)</Label>
          <Input name="weight" type="number" min={0} step={0.5} placeholder="60" className="bg-white/5 border-border text-text h-9" />
        </div>
      </div>
      <Button type="submit" disabled={isPending} size="sm" className="w-full gradient-primary text-white">
        Добавить упражнение
      </Button>
    </form>
  );
}

// ─── Plan Form ────────────────────────────────────────────────────────────────

function PlanForm({ plan, onSuccess }: { plan?: WorkoutPlan; onSuccess: () => void }) {
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
        <Label className="text-text/80">Название</Label>
        <Input name="name" required defaultValue={plan?.name ?? ""} placeholder="Силовая A" className="bg-white/5 border-border text-text" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-text/80">Дней в неделю</Label>
          <Input name="days" type="number" min={1} max={7} defaultValue={plan?.daysPerWeek ?? ""} placeholder="3" className="bg-white/5 border-border text-text" />
        </div>
        <div className="space-y-2">
          <Label className="text-text/80">Описание</Label>
          <Input name="description" defaultValue={plan?.description ?? ""} placeholder="Необязательно" className="bg-white/5 border-border text-text" />
        </div>
      </div>
      <Button type="submit" disabled={isPending} className="w-full gradient-primary text-white">
        {plan ? "Сохранить" : "Создать план"}
      </Button>
    </form>
  );
}

// ─── Log Card ─────────────────────────────────────────────────────────────────

function LogCard({ log }: { log: WorkoutLog }) {
  const [expanded, setExpanded] = useState(false);
  const [exOpen, setExOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editExId, setEditExId] = useState<string | null>(null);
  const deleteLog = useDeleteLog();
  const updateLogEx = useUpdateLogExercise();
  const deleteLogEx = useDeleteLogExercise();

  const { data: fullLog } = useWorkoutLog(expanded ? log.id : "");
  const exercises = fullLog?.exercises ?? [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <Dumbbell size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text">{formatDate(log.date)}</p>
          {log.notes && <p className="text-xs text-muted truncate">{log.notes}</p>}
        </div>
        <div className="flex items-center gap-2">
          {log.durationMinutes && (
            <span className="flex items-center gap-1 text-xs text-accent">
              <Clock size={12} />
              {log.durationMinutes} мин
            </span>
          )}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
            <button onClick={() => setEditOpen(true)} className="p-1 text-muted hover:text-primary transition-colors">
              <Pencil size={13} />
            </button>
            <button onClick={() => deleteLog.mutate(log.id)} className="p-1 text-muted hover:text-danger transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
          <button onClick={() => setExpanded((v) => !v)} className="p-1 text-muted hover:text-text transition-colors">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <p className="text-xs text-muted font-medium uppercase tracking-wide">
                Упражнения {exercises.length > 0 && `(${exercises.length})`}
              </p>

              {exercises.length > 0 && (
                <div className="space-y-2">
                  {exercises.map((ex) =>
                    editExId === ex.id ? (
                      <EditExerciseInline
                        key={ex.id}
                        exercise={ex}
                        onSave={(payload) =>
                          updateLogEx.mutate(
                            { logId: log.id, exerciseId: ex.id, payload: payload as Partial<ExerciseLog> },
                            { onSuccess: () => setEditExId(null) }
                          )
                        }
                        onCancel={() => setEditExId(null)}
                      />
                    ) : (
                      <div key={ex.id} className="flex items-center justify-between text-sm bg-white/3 rounded-lg px-3 py-2 group/ex">
                        <div>
                          <span className="text-text font-medium">{ex.name}</span>
                          {ex.muscleGroup && (
                            <span className="text-xs text-muted ml-2">{ex.muscleGroup}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted shrink-0">
                            {[
                              ex.sets && `${ex.sets} п`,
                              ex.repsPerSet && `${ex.repsPerSet} повт`,
                              ex.weightKg && `${ex.weightKg} кг`,
                            ].filter(Boolean).join(" · ")}
                          </span>
                          <div className="opacity-0 group-hover/ex:opacity-100 flex gap-0.5 transition-all">
                            <button onClick={() => setEditExId(ex.id)} className="p-0.5 text-muted hover:text-primary transition-colors">
                              <Pencil size={11} />
                            </button>
                            <button onClick={() => deleteLogEx.mutate({ logId: log.id, exerciseId: ex.id })} className="p-0.5 text-muted hover:text-danger transition-colors">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {exOpen ? (
                <>
                  <ExerciseForm logId={log.id} onSuccess={() => setExOpen(false)} />
                  <button onClick={() => setExOpen(false)} className="text-xs text-muted hover:text-text">Отмена</button>
                </>
              ) : (
                <button
                  onClick={() => setExOpen(true)}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} />
                  Добавить упражнение
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#13131a] border-border">
          <DialogHeader>
            <DialogTitle className="text-text">Редактировать тренировку</DialogTitle>
          </DialogHeader>
          <LogForm log={log} plans={[]} onSuccess={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: WorkoutPlan }) {
  const [expanded, setExpanded] = useState(false);
  const [exOpen, setExOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editExId, setEditExId] = useState<string | null>(null);
  const deletePlan = useDeletePlan();
  const updatePlanEx = useUpdatePlanExercise();
  const deletePlanEx = useDeletePlanExercise();

  const { data: fullPlan } = useWorkoutPlan(expanded ? plan.id : "");
  const exercises = fullPlan?.exercises ?? [];

  return (
    <div className="glass p-5 group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-text">{plan.name}</h3>
          {plan.description && <p className="text-xs text-muted mt-0.5">{plan.description}</p>}
          {plan.daysPerWeek && (
            <p className="text-xs text-muted mt-1">{plan.daysPerWeek} дней/нед</p>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
          <button onClick={() => setEditOpen(true)} className="p-1 text-muted hover:text-primary transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => deletePlan.mutate(plan.id)} className="p-1 text-muted hover:text-danger transition-colors">
            <Trash2 size={13} />
          </button>
          <button onClick={() => setExpanded((v) => !v)} className="p-1 text-muted hover:text-text transition-colors">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <p className="text-xs text-muted font-medium uppercase tracking-wide">
                Упражнения {exercises.length > 0 && `(${exercises.length})`}
              </p>

              {exercises.length > 0 && (
                <div className="space-y-2">
                  {exercises.map((ex) =>
                    editExId === ex.id ? (
                      <EditExerciseInline
                        key={ex.id}
                        exercise={ex}
                        onSave={(payload) =>
                          updatePlanEx.mutate(
                            { planId: plan.id, exerciseId: ex.id, payload: payload as Partial<PlanExercise> },
                            { onSuccess: () => setEditExId(null) }
                          )
                        }
                        onCancel={() => setEditExId(null)}
                      />
                    ) : (
                      <div key={ex.id} className="flex items-center justify-between text-sm bg-white/3 rounded-lg px-3 py-2 group/ex">
                        <div>
                          <span className="text-text font-medium">{ex.name}</span>
                          {ex.muscleGroup && (
                            <span className="text-xs text-muted ml-2">{ex.muscleGroup}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted shrink-0">
                            {[
                              ex.sets && `${ex.sets} п`,
                              ex.repsPerSet && `${ex.repsPerSet} повт`,
                              ex.weightKg && `${ex.weightKg} кг`,
                            ].filter(Boolean).join(" · ")}
                          </span>
                          <div className="opacity-0 group-hover/ex:opacity-100 flex gap-0.5 transition-all">
                            <button onClick={() => setEditExId(ex.id)} className="p-0.5 text-muted hover:text-primary transition-colors">
                              <Pencil size={11} />
                            </button>
                            <button onClick={() => deletePlanEx.mutate({ planId: plan.id, exerciseId: ex.id })} className="p-0.5 text-muted hover:text-danger transition-colors">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {exOpen ? (
                <>
                  <ExerciseForm planId={plan.id} onSuccess={() => setExOpen(false)} />
                  <button onClick={() => setExOpen(false)} className="text-xs text-muted hover:text-text">Отмена</button>
                </>
              ) : (
                <button
                  onClick={() => setExOpen(true)}
                  className={cn("text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors")}
                >
                  <Plus size={12} />
                  Добавить упражнение
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#13131a] border-border">
          <DialogHeader>
            <DialogTitle className="text-text">Редактировать план</DialogTitle>
          </DialogHeader>
          <PlanForm plan={plan} onSuccess={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkoutsPage() {
  const [logOpen, setLogOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("logs");

  const { data: plans } = useWorkoutPlans();
  const { data: logs } = useWorkoutLogs({ limit: 30 });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Тренировки</h1>
        <div className="flex gap-2">
          {activeTab === "plans" && (
            <Button onClick={() => setPlanOpen(true)} variant="outline" className="border-border text-text gap-2">
              <Plus size={16} />
              Новый план
            </Button>
          )}
          <Button onClick={() => setLogOpen(true)} className="gradient-primary text-white gap-2">
            <Plus size={16} />
            Тренировка
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent p-0 gap-2 h-auto">
          {(["logs", "plans"] as const).map((v) => (
            <TabsTrigger
              key={v}
              value={v}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all text-muted data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_16px_var(--color-primary-glow)] hover:text-text"
            >
              {v === "logs" ? "Логи" : "Планы"}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="logs" className="mt-4 space-y-3">
          {!logs || logs.length === 0 ? (
            <EmptyState icon={<Dumbbell />} title="Нет записей" description="Начните записывать свои тренировки" />
          ) : (
            logs.map((log) => <LogCard key={log.id} log={log} />)
          )}
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          {!plans || plans.length === 0 ? (
            <EmptyState
              icon={<Dumbbell />}
              title="Нет планов"
              description="Создайте план для структурированных тренировок"
              action={
                <Button onClick={() => setPlanOpen(true)} className="gradient-primary text-white">
                  Создать план
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="bg-[#13131a] border-border">
          <DialogHeader>
            <DialogTitle className="text-text">Записать тренировку</DialogTitle>
          </DialogHeader>
          <LogForm plans={plans ?? []} onSuccess={() => setLogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="bg-[#13131a] border-border">
          <DialogHeader>
            <DialogTitle className="text-text">Новый план</DialogTitle>
          </DialogHeader>
          <PlanForm onSuccess={() => setPlanOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
