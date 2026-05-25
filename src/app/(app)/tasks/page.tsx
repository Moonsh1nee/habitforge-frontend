"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Filter = "all" | "todo" | "done";

export default function TasksPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useTasks(
    filter === "done" ? { completed: true } : filter === "todo" ? { completed: false } : {}
  );

  const tasks = data?.items ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Задачи</h1>
          <p className="text-sm text-muted mt-0.5">
            {data?.total ?? 0} задач всего
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="gradient-primary text-white gap-2"
        >
          <Plus size={16} />
          Новая задача
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="bg-white/5 border border-border">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Все
          </TabsTrigger>
          <TabsTrigger value="todo" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Активные
          </TabsTrigger>
          <TabsTrigger value="done" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Выполненные
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : (
        <TaskList tasks={tasks} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#13131a] border-border">
          <DialogHeader>
            <DialogTitle className="text-text">Новая задача</DialogTitle>
          </DialogHeader>
          <TaskForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
