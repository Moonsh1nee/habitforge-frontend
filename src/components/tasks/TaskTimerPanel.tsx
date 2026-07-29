"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Play, Square, Loader2 } from "lucide-react";
import { useTaskTimer, useTimeEntries, useStartTimer, useStopTimer } from "@/lib/hooks/useTasks";
import { cn } from "@/lib/utils";

interface TaskTimerPanelProps {
  taskId: string;
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function TaskTimerPanel({ taskId }: TaskTimerPanelProps) {
  const { data: status } = useTaskTimer(taskId);
  const { data: entries = [] } = useTimeEntries(taskId);
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!status?.running) {
      setElapsed(0);
      return;
    }
    setElapsed(status.elapsed_seconds ?? 0);
    const interval = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const isPending = startTimer.isPending || stopTimer.isPending;
  const totalMinutes = entries.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mt-2 ml-7 flex items-center justify-between gap-3 border-l border-border pl-3 py-1.5">
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            status?.running ? "text-primary" : "text-muted"
          )}
        >
          {status?.running ? formatDuration(elapsed) : "00:00:00"}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted">Всего: {totalMinutes} мин</span>
          <button
            onClick={() =>
              status?.running ? stopTimer.mutate(taskId) : startTimer.mutate(taskId)
            }
            disabled={isPending}
            className={cn(
              "flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border transition-all",
              status?.running
                ? "border-danger/40 text-danger hover:bg-danger/10"
                : "border-success/40 text-success hover:bg-success/10"
            )}
          >
            {isPending ? (
              <Loader2 size={10} className="animate-spin" />
            ) : status?.running ? (
              <Square size={10} />
            ) : (
              <Play size={10} />
            )}
            {status?.running ? "Стоп" : "Старт"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
