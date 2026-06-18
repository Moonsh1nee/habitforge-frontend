"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useSubtasks, useCreateSubtask, useUpdateTask } from "@/lib/hooks/useTasks";
import { cn } from "@/lib/utils";

interface SubtaskListProps {
  taskId: string;
}

export function SubtaskList({ taskId }: SubtaskListProps) {
  const { data: subtasks = [], isLoading } = useSubtasks(taskId);
  const createSubtask = useCreateSubtask();
  const updateTask = useUpdateTask();
  const [addingTitle, setAddingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const title = addingTitle.trim();
    if (!title) return;
    createSubtask.mutate({ taskId, title, priority: 2 });
    setAddingTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") setAddingTitle("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="mt-2 ml-7 space-y-1 border-l border-border pl-3">
        {isLoading && (
          <div className="flex items-center gap-1.5 py-1">
            <Loader2 size={12} className="animate-spin text-muted" />
            <span className="text-xs text-muted">Загрузка...</span>
          </div>
        )}

        <AnimatePresence initial={false}>
          {subtasks.map((sub) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className="flex items-center gap-2 group/sub"
            >
              <button
                onClick={() =>
                  updateTask.mutate({
                    id: sub.id,
                    payload: { completed: !sub.completed },
                  })
                }
                className={cn(
                  "shrink-0 transition-colors",
                  sub.completed ? "text-success" : "text-muted hover:text-primary"
                )}
              >
                {sub.completed ? <CheckCircle2 size={13} /> : <Circle size={13} />}
              </button>
              <span
                className={cn(
                  "text-xs flex-1",
                  sub.completed ? "line-through text-muted" : "text-text"
                )}
              >
                {sub.title}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Inline add */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <Plus size={12} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            value={addingTitle}
            onChange={(e) => setAddingTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAdd}
            placeholder="Добавить подзадачу..."
            className="text-xs bg-transparent outline-none text-text placeholder:text-muted/50 flex-1 py-0.5"
          />
        </div>
      </div>
    </motion.div>
  );
}
