"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { usePlanMeals, useDeleteNutritionPlan, useDeletePlanMeal } from "@/lib/hooks/useNutrition";
import { MealTemplateForm } from "@/components/nutrition/MealTemplateForm";
import { NutritionPlanForm } from "@/components/nutrition/NutritionPlanForm";
import { CollapsibleBody } from "@/components/shared/CollapsibleBody";
import { FormDialog } from "@/components/shared/FormDialog";
import type { NutritionPlan, MealType } from "@/types";

const mealLabels: Record<MealType, string> = {
  breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", snack: "Перекус",
};

interface NutritionPlanCardProps {
  plan: NutritionPlan;
}

export function NutritionPlanCard({ plan }: NutritionPlanCardProps) {
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
                    {meal.calories && <span className="text-xs text-muted ml-2">{meal.calories} ккал</span>}
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
        <NutritionPlanForm plan={plan} onSuccess={() => setEditPlanOpen(false)} />
      </FormDialog>
    </div>
  );
}
