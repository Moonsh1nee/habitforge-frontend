"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Dumbbell, Clock, Pencil, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useWorkoutLog, useDeleteLog, useUpdateLogExercise, useDeleteLogExercise } from "@/lib/hooks/useWorkouts";
import { ExerciseForm, EditExerciseInline } from "@/components/workouts/ExerciseForm";
import { LogForm } from "@/components/workouts/LogForm";
import { ExerciseRow } from "@/components/workouts/ExerciseRow";
import { CollapsibleBody } from "@/components/shared/CollapsibleBody";
import { FormDialog } from "@/components/shared/FormDialog";
import { formatDate } from "@/lib/utils";
import type { WorkoutLog, ExerciseLog } from "@/types";

interface LogCardProps {
  log: WorkoutLog;
}

export function LogCard({ log }: LogCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [exOpen, setExOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editExId, setEditExId] = useState<string | null>(null);
  const deleteLog = useDeleteLog();
  const updateLogEx = useUpdateLogExercise();
  const deleteLogEx = useDeleteLogExercise();

  const { data: fullLog, isLoading: exercisesLoading } = useWorkoutLog(expanded ? log.id : "");
  const exercises = fullLog?.exercises ?? [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
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
          <div className="opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 flex items-center gap-0.5 transition-all">
            <button onClick={() => setEditOpen(true)} aria-label="Редактировать тренировку" className="p-1 text-muted hover:text-primary transition-colors">
              <Pencil size={13} />
            </button>
            <button onClick={() => deleteLog.mutate(log.id)} aria-label="Удалить тренировку" className="p-1 text-muted hover:text-danger transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
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
                    updateLogEx.mutate(
                      { logId: log.id, exerciseId: ex.id, payload: payload as Partial<ExerciseLog> },
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
                  onDelete={() => deleteLogEx.mutate({ logId: log.id, exerciseId: ex.id })}
                />
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
      </CollapsibleBody>

      <FormDialog open={editOpen} onOpenChange={setEditOpen} title="Редактировать тренировку">
        <LogForm log={log} onSuccess={() => setEditOpen(false)} />
      </FormDialog>
    </motion.div>
  );
}
