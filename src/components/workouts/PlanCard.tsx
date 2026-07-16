"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useWorkoutPlan, useDeletePlan, useUpdatePlanExercise, useDeletePlanExercise } from "@/lib/hooks/useWorkouts";
import { ExerciseForm, EditExerciseInline } from "@/components/workouts/ExerciseForm";
import { PlanForm } from "@/components/workouts/PlanForm";
import { ExerciseRow } from "@/components/workouts/ExerciseRow";
import { CollapsibleBody } from "@/components/shared/CollapsibleBody";
import { FormDialog } from "@/components/shared/FormDialog";
import type { WorkoutPlan, PlanExercise } from "@/types";

interface PlanCardProps {
  plan: WorkoutPlan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [exOpen, setExOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editExId, setEditExId] = useState<string | null>(null);
  const deletePlan = useDeletePlan();
  const updatePlanEx = useUpdatePlanExercise();
  const deletePlanEx = useDeletePlanExercise();

  const { data: fullPlan, isLoading: exercisesLoading } = useWorkoutPlan(expanded ? plan.id : "");
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
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-all shrink-0">
          <button onClick={() => setEditOpen(true)} aria-label="Редактировать план" className="p-1 text-muted hover:text-primary transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => deletePlan.mutate(plan.id)} aria-label="Удалить план" className="p-1 text-muted hover:text-danger transition-colors">
            <Trash2 size={13} />
          </button>
          <button onClick={() => setExpanded((v) => !v)} className="p-1 text-muted hover:text-text transition-colors">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      <CollapsibleBody expanded={expanded}>
        <p className="text-xs text-muted font-medium uppercase tracking-wide">
          Упражнения {exercises.length > 0 && `(${exercises.length})`}
        </p>

        {exercisesLoading ? (
          <div className="flex justify-center py-3">
            <Loader2 size={16} className="animate-spin text-muted" />
          </div>
        ) : exercises.length > 0 && (
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
                <ExerciseRow
                  key={ex.id}
                  exercise={ex}
                  onEdit={() => setEditExId(ex.id)}
                  onDelete={() => deletePlanEx.mutate({ planId: plan.id, exerciseId: ex.id })}
                />
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
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <Plus size={12} />
            Добавить упражнение
          </button>
        )}
      </CollapsibleBody>

      <FormDialog open={editOpen} onOpenChange={setEditOpen} title="Редактировать план">
        <PlanForm plan={plan} onSuccess={() => setEditOpen(false)} />
      </FormDialog>
    </div>
  );
}
