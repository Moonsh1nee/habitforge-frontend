"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Plus, Apple, Trash2, ChevronLeft, ChevronRight, Pencil,
  ChevronDown, ChevronUp, UtensilsCrossed,
} from "lucide-react";
import { addDays, format, isToday, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  useNutritionSummary,
  useNutritionLogs,
  useNutritionPlans,
  useCreateNutritionLog,
  useDeleteNutritionLog,
  useCreateNutritionPlan,
  useUpdateNutritionPlan,
  useDeleteNutritionPlan,
  usePlanMeals,
  useAddPlanMeal,
  useUpdatePlanMeal,
  useDeletePlanMeal,
} from "@/lib/hooks/useNutrition";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { CollapsibleBody } from "@/components/shared/CollapsibleBody";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectOption } from "@/components/shared/SelectOption";
import { getTodayString } from "@/lib/utils";
import type { MealType, NutritionPlan, MealTemplate } from "@/types";

const MACRO_COLORS = ["#f59e0b", "#7c3aed", "#06b6d4", "#22c55e"];
const mealLabels: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

const mealIcons: Record<MealType, string> = {
  breakfast: "🌅",
  lunch: "🍽️",
  dinner: "🌙",
  snack: "🍎",
};

// ─── Add Food Form ────────────────────────────────────────────────────────────

function AddFoodForm({ date, onSuccess }: { date: string; onSuccess: () => void }) {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const create = useCreateNutritionLog();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    create.mutate(
      {
        date,
        mealType,
        name: fd.get("name") as string,
        calories: Number(fd.get("calories")),
        protein: Number(fd.get("protein")),
        carbs: Number(fd.get("carbs")),
        fat: Number(fd.get("fat")),
      },
      { onSuccess: onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Название</Label>
        <Input
          name="name"
          placeholder="Куриная грудка"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Приём пищи</Label>
        <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(mealLabels) as [MealType, string][]).map(([k, v]) => (
              <SelectOption key={k} value={k} label={v} icon={mealIcons[k]} />
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[["calories", "Калории"], ["protein", "Белки (г)"], ["carbs", "Углеводы (г)"], ["fat", "Жиры (г)"]].map(
          ([name, label]) => (
            <div key={name} className="space-y-2">
              <Label className="text-xs">{label}</Label>
              <Input
                name={name}
                type="number"
                min={0}
                step={0.1}
                defaultValue={0}
              />
            </div>
          )
        )}
      </div>
      <Button
        type="submit"
        disabled={create.isPending}
        className="w-full gradient-primary text-white"
      >
        Добавить
      </Button>
    </form>
  );
}

// ─── Nutrition Plan Form ──────────────────────────────────────────────────────

function PlanForm({ plan, onSuccess }: { plan?: NutritionPlan; onSuccess: () => void }) {
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
      <Button type="submit" disabled={isPending} className="w-full gradient-primary text-white">
        {plan ? "Сохранить" : "Создать план"}
      </Button>
    </form>
  );
}

// ─── Meal Template Form ───────────────────────────────────────────────────────

function MealTemplateForm({
  planId,
  meal,
  onSuccess,
  onCancel,
}: {
  planId: string;
  meal?: MealTemplate;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [mealType, setMealType] = useState<MealType>(meal?.mealType ?? "breakfast");

  const create = useAddPlanMeal(planId);
  const upd = useUpdatePlanMeal(planId);

  const isPending = create.isPending || upd.isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      mealType,
      calories: Number(fd.get("calories")) || undefined,
      protein: Number(fd.get("protein")) || undefined,
      carbs: Number(fd.get("carbs")) || undefined,
      fat: Number(fd.get("fat")) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    };
    if (meal) upd.mutate({ mealId: meal.id, payload }, { onSuccess });
    else create.mutate(payload, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/3 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Название</Label>
          <Input name="name" required defaultValue={meal?.name ?? ""} placeholder="Омлет" className="h-8 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Приём пищи</Label>
          <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(mealLabels) as [MealType, string][]).map(([k, v]) => (
                <SelectOption key={k} value={k} label={v} icon={mealIcons[k]} />
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {(
          [
            ["calories", "Ккал", meal?.calories],
            ["protein", "Белки", meal?.protein],
            ["carbs", "Углев", meal?.carbs],
            ["fat", "Жиры", meal?.fat],
          ] as [string, string, number | null | undefined][]
        ).map(([name, label, val]) => (
          <div key={name} className="space-y-1">
            <Label className="text-muted text-[10px]">{label}</Label>
            <Input name={name} type="number" min={0} step={0.1} defaultValue={val ?? ""} placeholder="0" className="h-7 text-xs" />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Заметки</Label>
        <Input name="notes" defaultValue={meal?.notes ?? ""} placeholder="Необязательно" className="h-8 text-sm" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={isPending} className="gradient-primary text-white h-7 text-xs px-3">
          {meal ? "Сохранить" : "Добавить"}
        </Button>
        <button type="button" onClick={onCancel} className="text-xs text-muted hover:text-text">Отмена</button>
      </div>
    </form>
  );
}

// ─── Nutrition Plan Card ──────────────────────────────────────────────────────

function NutritionPlanCard({ plan }: { plan: NutritionPlan }) {
  const [expanded, setExpanded] = useState(false);
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [editMealId, setEditMealId] = useState<string | null>(null);
  const [editPlanOpen, setEditPlanOpen] = useState(false);

  const { data: meals = [] } = usePlanMeals(plan.id, expanded);
  const deletePlan = useDeleteNutritionPlan();
  const deleteMeal = useDeletePlanMeal(plan.id);

  return (
    <div className="glass p-5 group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-text">{plan.name}</h3>
          {plan.description && <p className="text-xs text-muted mt-0.5">{plan.description}</p>}
          {plan.targetCalories && (
            <p className="text-xs text-warning mt-1">{plan.targetCalories} ккал/день</p>
          )}
          {(plan.targetProtein || plan.targetCarbs || plan.targetFat) && (
            <p className="text-xs text-muted mt-0.5">
              {[
                plan.targetProtein && `Б ${plan.targetProtein}г`,
                plan.targetCarbs && `У ${plan.targetCarbs}г`,
                plan.targetFat && `Ж ${plan.targetFat}г`,
              ].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-all shrink-0">
          <button onClick={() => setEditPlanOpen(true)} aria-label="Редактировать план питания" className="p-1 text-muted hover:text-primary transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => deletePlan.mutate(plan.id)} aria-label="Удалить план питания" className="p-1 text-muted hover:text-danger transition-colors">
            <Trash2 size={13} />
          </button>
          <button onClick={() => setExpanded((v) => !v)} className="p-1 text-muted hover:text-text transition-colors">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      <CollapsibleBody expanded={expanded}>
        <p className="text-xs text-muted font-medium uppercase tracking-wide">
          Шаблоны приёмов пищи {meals.length > 0 && `(${meals.length})`}
        </p>

        {meals.length > 0 && (
          <div className="space-y-2">
            {meals.map((meal) =>
              editMealId === meal.id ? (
                <MealTemplateForm
                  key={meal.id}
                  planId={plan.id}
                  meal={meal}
                  onSuccess={() => setEditMealId(null)}
                  onCancel={() => setEditMealId(null)}
                />
              ) : (
                <div key={meal.id} className="flex items-center justify-between text-sm bg-white/3 rounded-lg px-3 py-2 group/meal">
                  <div className="min-w-0">
                    <span className="text-xs text-primary font-medium mr-2">{mealLabels[meal.mealType]}</span>
                    <span className="text-text font-medium">{meal.name}</span>
                    {meal.calories && (
                      <span className="text-xs text-muted ml-2">{meal.calories} ккал</span>
                    )}
                    {(meal.protein || meal.carbs || meal.fat) && (
                      <p className="text-xs text-muted mt-0.5">
                        {[
                          meal.protein && `Б ${meal.protein}г`,
                          meal.carbs && `У ${meal.carbs}г`,
                          meal.fat && `Ж ${meal.fat}г`,
                        ].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="opacity-0 group-hover/meal:opacity-100 flex gap-0.5 transition-all shrink-0">
                    <button onClick={() => setEditMealId(meal.id)} aria-label="Редактировать приём пищи" className="p-0.5 text-muted hover:text-primary transition-colors">
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => deleteMeal.mutate(meal.id)} aria-label="Удалить приём пищи" className="p-0.5 text-muted hover:text-danger transition-colors">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {addMealOpen ? (
          <MealTemplateForm
            planId={plan.id}
            onSuccess={() => setAddMealOpen(false)}
            onCancel={() => setAddMealOpen(false)}
          />
        ) : (
          <button
            onClick={() => setAddMealOpen(true)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <Plus size={12} />
            Добавить шаблон
          </button>
        )}
      </CollapsibleBody>

      <FormDialog open={editPlanOpen} onOpenChange={setEditPlanOpen} title="Редактировать план">
        <PlanForm plan={plan} onSuccess={() => setEditPlanOpen(false)} />
      </FormDialog>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState("diary");
  const [addOpen, setAddOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const today = getTodayString();

  const shiftDate = (days: number) => {
    setSelectedDate((d) => format(addDays(parseISO(d), days), "yyyy-MM-dd"));
  };

  const { data: summary, isFetching: summaryFetching } = useNutritionSummary(selectedDate);
  const { data: logs = [], isFetching: logsFetching } = useNutritionLogs(selectedDate);
  const { data: plans = [] } = useNutritionPlans(true);
  const deleteLog = useDeleteNutritionLog();
  const [deleteLogConfirmId, setDeleteLogConfirmId] = useState<string | null>(null);
  const isFetching = summaryFetching || logsFetching;

  const macros = summary
    ? [
        { name: "Белки", value: summary.total_protein ?? 0, color: MACRO_COLORS[1] },
        { name: "Углеводы", value: summary.total_carbs ?? 0, color: MACRO_COLORS[2] },
        { name: "Жиры", value: summary.total_fat ?? 0, color: MACRO_COLORS[3] },
      ]
    : [];

  const activePlan = plans[0] ?? null;
  const planBars = activePlan
    ? [
        { label: "Калории", value: summary?.total_calories ?? 0, target: activePlan.targetCalories, color: MACRO_COLORS[0] },
        { label: "Белки", value: summary?.total_protein ?? 0, target: activePlan.targetProtein, color: MACRO_COLORS[1] },
        { label: "Углеводы", value: summary?.total_carbs ?? 0, target: activePlan.targetCarbs, color: MACRO_COLORS[2] },
        { label: "Жиры", value: summary?.total_fat ?? 0, target: activePlan.targetFat, color: MACRO_COLORS[3] },
      ].filter((b) => b.target && b.target > 0)
    : [];

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Питание"
        action={
          activeTab === "plans" ? (
            <Button onClick={() => setPlanOpen(true)} className="gradient-primary text-white gap-2">
              <Plus size={16} />
              Новый план
            </Button>
          ) : (
            <Button onClick={() => setAddOpen(true)} className="gradient-primary text-white gap-2">
              <Plus size={16} />
              Добавить еду
            </Button>
          )
        }
      />

      <FilterTabs
        value={activeTab}
        onChange={setActiveTab}
        size="md"
        options={[
          { value: "diary", label: "Дневник" },
          { value: "plans", label: "Планы" },
        ]}
      />

      <Tabs value={activeTab}>
        {/* ── Diary tab ── */}
        <TabsContent value="diary" className="mt-4 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => shiftDate(-1)}
              className="p-2 rounded-lg border border-border text-muted hover:text-text hover:border-primary/40 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-center min-w-40 relative">
              <p className="text-sm font-medium text-text capitalize">
                {isToday(parseISO(selectedDate))
                  ? "Сегодня"
                  : format(parseISO(selectedDate), "d MMMM", { locale: ru })}
              </p>
              {isFetching && (
                <span className="absolute -right-5 top-1/2 -translate-y-1/2">
                  <span className="block w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
                </span>
              )}
              <p className="text-xs text-muted">
                {format(parseISO(selectedDate), "EEEE", { locale: ru })}
              </p>
            </div>
            <button
              onClick={() => shiftDate(1)}
              disabled={selectedDate >= today}
              className="p-2 rounded-lg border border-border text-muted hover:text-text hover:border-primary/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
            {selectedDate !== today && (
              <button
                onClick={() => setSelectedDate(today)}
                className="text-xs text-primary hover:text-primary/80 transition-colors ml-1"
              >
                Сегодня
              </button>
            )}
          </div>

          {summary && (
            <GlassCard className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-40 h-40 shrink-0">
                <PieChart width={160} height={160}>
                  <Pie
                    data={macros}
                    cx={80}
                    cy={80}
                    innerRadius={45}
                    outerRadius={65}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {macros.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#13131a",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      color: "#f1f5f9",
                    }}
                  />
                </PieChart>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <AnimatedNumber
                    value={summary.total_calories}
                    className="text-3xl font-bold text-warning"
                  />
                  <p className="text-xs text-muted">ккал</p>
                </div>
                {macros.map((m) => (
                  <div key={m.name} className="text-center">
                    <span className="text-xl font-bold" style={{ color: m.color }}>
                      <AnimatedNumber value={m.value} decimals={1} suffix=" г" />
                    </span>
                    <p className="text-xs text-muted">{m.name}</p>
                  </div>
                ))}
              </div>
            </div>
            {planBars.length > 0 && (
              <div className="border-t border-border pt-4 space-y-2">
                {planBars.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted">{bar.label}</span>
                      <span style={{ color: bar.color }}>
                        {Math.round(bar.value)} / {bar.target}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          background: bar.color,
                          width: `${Math.min(100, (bar.value / bar.target!) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            </GlassCard>
          )}

          <div className="space-y-3">
            {!logs.length ? (
              <EmptyState
                icon={<Apple />}
                title="Нет записей питания"
                description="Добавьте первый приём пищи"
              />
            ) : (
              logs.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass p-4 flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary font-medium">
                        {mealLabels[entry.mealType]}
                      </span>
                      <span className="text-sm font-medium text-text">{entry.name}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {entry.calories} ккал · Б {entry.protein}г · У {entry.carbs}г · Ж {entry.fat}г
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteLogConfirmId(entry.id)}
                    aria-label="Удалить запись питания"
                    className="opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 text-muted hover:text-danger transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* ── Plans tab ── */}
        <TabsContent value="plans" className="mt-4">
          {!plans.length ? (
            <EmptyState
              icon={<UtensilsCrossed />}
              title="Нет планов питания"
              description="Создайте план с целями по макронутриентам и шаблонами приёмов пищи"
              action={
                <Button onClick={() => setPlanOpen(true)} className="gradient-primary text-white">
                  Создать план
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <NutritionPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <FormDialog open={addOpen} onOpenChange={setAddOpen} title="Добавить еду">
        <AddFoodForm date={selectedDate} onSuccess={() => setAddOpen(false)} />
      </FormDialog>

      <FormDialog open={planOpen} onOpenChange={setPlanOpen} title="Новый план питания">
        <PlanForm onSuccess={() => setPlanOpen(false)} />
      </FormDialog>

      <AlertDialog open={!!deleteLogConfirmId} onOpenChange={(o) => !o && setDeleteLogConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить запись питания?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted">
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { deleteLog.mutate(deleteLogConfirmId!); setDeleteLogConfirmId(null); }}
              className="bg-danger text-white hover:bg-danger/80"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}