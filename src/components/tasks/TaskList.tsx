"use client";

import { AnimatePresence } from "motion/react";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckSquare } from "lucide-react";
import type { Task } from "@/types";

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare />}
        title="Нет задач"
        description="Нажмите «+» чтобы создать первую задачу"
      />
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </AnimatePresence>
    </div>
  );
}
