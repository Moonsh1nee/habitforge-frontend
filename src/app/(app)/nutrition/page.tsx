"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { TOOLTIP_STYLE } from "@/lib/constants/chartStyles";
import {
  Plus, Apple, Trash2, ChevronLeft, ChevronRight, UtensilsCrossed,
} from "lucide-react";
import { addDays, format, isToday, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  useNutritionSummary, useNutritionLogs, useNutritionPlans,
  useDeleteNutritionLog,
} from "@/lib/hooks/useNutrition";
import { AddFoodForm } from "@/components/nutrition/AddFoodForm";
import { NutritionPlanForm } from "@/components/nutrition/NutritionPlanForm";
import { NutritionPlanCard } from "@/components/nutrition/NutritionPlanCard";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormDialog } from "@/components/shared/FormDialog";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { getTodayString } from "@/lib/utils";

const MACRO_COLORS = ["#f59e0b", "#7c3aed", "#06b6d4", "#22c55e"];
const mealLabels = {
  breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", snack: "Перекус",
};

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
            <Button onClick={() => setPlanOpen(true)} className="bg-primary text-white gap-2">
              <Plus size={16} />
              Новый план
            </Button>
          ) : (
            <Button onClick={() => setAddOpen(true)} className="bg-primary text-white gap-2">
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
        <TabsContent value="diary" className="mt-4 space-y-4">
          {/* Date navigator */}
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

          {/* Macro summary */}
          {summary && (
            <GlassCard className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-40 h-40 shrink-0">
                  <PieChart width={160} height={160}>
                    <Pie data={macros} cx={80} cy={80} innerRadius={45} outerRadius={65} dataKey="value" strokeWidth={0}>
                      {macros.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <AnimatedNumber value={summary.total_calories} className="text-3xl font-bold text-warning" />
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
                        <span style={{ color: bar.color }}>{Math.round(bar.value)} / {bar.target}</span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ background: bar.color, width: `${Math.min(100, (bar.value / bar.target!) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {/* Food log */}
          <div className="space-y-3">
            {!logs.length ? (
              <EmptyState icon={<Apple />} title="Нет записей питания" description="Добавьте первый приём пищи" />
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
                        {mealLabels[entry.mealType as keyof typeof mealLabels]}
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

        <TabsContent value="plans" className="mt-4">
          {!plans.length ? (
            <EmptyState
              icon={<UtensilsCrossed />}
              title="Нет планов питания"
              description="Создайте план с целями по макронутриентам и шаблонами приёмов пищи"
              action={
                <Button onClick={() => setPlanOpen(true)} className="bg-primary text-white">
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
        <NutritionPlanForm onSuccess={() => setPlanOpen(false)} />
      </FormDialog>

      <ConfirmDeleteDialog
        open={!!deleteLogConfirmId}
        onOpenChange={(o) => !o && setDeleteLogConfirmId(null)}
        onConfirm={() => { deleteLog.mutate(deleteLogConfirmId!); setDeleteLogConfirmId(null); }}
        isPending={deleteLog.isPending}
        title="Удалить запись питания?"
      />
    </div>
  );
}
