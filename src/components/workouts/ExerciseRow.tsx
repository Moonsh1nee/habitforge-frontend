import { Pencil, Trash2 } from "lucide-react";

interface ExerciseLike {
  id: string;
  name: string;
  muscleGroup?: string | null;
  sets?: number | null;
  repsPerSet?: number | null;
  weightKg?: number | null;
}

interface ExerciseRowProps {
  exercise: ExerciseLike;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExerciseRow({ exercise: ex, onEdit, onDelete }: ExerciseRowProps) {
  const stats = [
    ex.sets && `${ex.sets} п`,
    ex.repsPerSet && `${ex.repsPerSet} повт`,
    ex.weightKg && `${ex.weightKg} кг`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-center justify-between text-sm bg-white/3 rounded-lg px-3 py-2 group/ex">
      <div>
        <span className="text-text font-medium">{ex.name}</span>
        {ex.muscleGroup && (
          <span className="text-xs text-muted ml-2">{ex.muscleGroup}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {stats && <span className="text-xs text-muted shrink-0">{stats}</span>}
        <div className="opacity-0 group-hover/ex:opacity-100 flex gap-0.5 transition-all">
          <button
            onClick={onEdit}
            className="p-0.5 text-muted hover:text-primary transition-colors"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={onDelete}
            className="p-0.5 text-muted hover:text-danger transition-colors"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
