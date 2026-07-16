"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/lib/hooks/useProjects";
import { usePlan } from "@/lib/hooks/usePlan";
import { ColorPicker } from "@/components/shared/ColorPicker";
import { LimitBadge } from "@/components/shared/LimitBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Project } from "@/types";

interface ProjectsManagerProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function ProjectsManager({ open, onOpenChange }: ProjectsManagerProps) {
  const { data: projects = [] } = useProjects();
  const create = useCreateProject();
  const { isAtLimit, getLimit } = usePlan();
  const atProjectLimit = isAtLimit("projects", projects.length);
  const projectLimit = getLimit("projects");
  const update = useUpdateProject();
  const del = useDeleteProject();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#7c3aed");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    create.mutate(
      { name: newName.trim(), color: newColor },
      { onSuccess: () => { setNewName(""); setNewColor("#7c3aed"); } }
    );
  };

  const startEdit = (p: Project) => {
    setEditId(p.id);
    setEditName(p.name);
    setEditColor(p.color);
  };

  const handleUpdate = () => {
    if (!editId || !editName.trim()) return;
    update.mutate(
      { id: editId, payload: { name: editName.trim(), color: editColor } },
      { onSuccess: () => setEditId(null) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Управление проектами</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {projects.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">Пока нет проектов</p>
          ) : projects.map((p) =>
            editId === p.id ? (
              <div key={p.id} className="space-y-3 p-3 rounded-xl bg-white/5 border border-border">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                  autoFocus
                />
                <ColorPicker value={editColor} onChange={setEditColor} />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={!editName.trim() || update.isPending}
                    className="bg-primary text-white"
                  >
                    Сохранить
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div
                key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group transition-colors"
              >
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color }} />
                <span className="flex-1 text-sm text-text truncate">{p.name}</span>
                {p.tasksCount > 0 && (
                  <span className="text-xs text-muted tabular-nums shrink-0">
                    {p.tasksDone}/{p.tasksCount}
                  </span>
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => startEdit(p)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить «{p.name}»?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Задачи в проекте не удаляются — они просто открепятся от него.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => del.mutate(p.id)}
                          className="bg-danger text-white hover:bg-danger/80"
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          )}
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted font-medium uppercase tracking-wide">Новый проект</p>
            <LimitBadge current={projects.length} max={projectLimit} label="проектов" />
          </div>
          {atProjectLimit ? (
            <p className="text-xs text-muted text-center py-2">
              Лимит {projectLimit} проектов на Free.{" "}
              <a href="/upgrade" className="text-primary hover:underline">Перейти на Pro →</a>
            </p>
          ) : (
            <>
              <Input
                placeholder="Название проекта"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <ColorPicker value={newColor} onChange={setNewColor} />
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || create.isPending}
                className="bg-primary text-white w-full gap-2"
              >
                <Plus size={14} />
                Создать проект
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
