"use client";

import { useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/lib/hooks/useFinance";
import { EmojiPicker } from "@/components/finance/EmojiPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { FinanceCategory } from "@/types";

interface CategoryManagerProps {
  categories: FinanceCategory[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FinanceCategory | null>(null);
  const [addIcon, setAddIcon] = useState<string | null>(null);
  const [editIcon, setEditIcon] = useState<string | null>(null);
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const handleOpenEdit = (cat: FinanceCategory) => {
    setEditTarget(cat);
    setEditIcon(cat.icon);
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createCat.mutate(
      { name: fd.get("name") as string, icon: addIcon, color: fd.get("color") as string },
      { onSuccess: () => { setAddOpen(false); setAddIcon(null); } }
    );
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTarget) return;
    const fd = new FormData(e.currentTarget);
    updateCat.mutate(
      { id: editTarget.id, payload: { name: fd.get("name") as string, icon: editIcon, color: fd.get("color") as string } },
      { onSuccess: () => setEditTarget(null) }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted font-medium uppercase tracking-wide">Категории</p>
        <button
          onClick={() => setAddOpen(true)}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          <Plus size={12} />
          Добавить
        </button>
      </div>

      {categories.length === 0 && (
        <p className="text-xs text-muted py-2">Нет категорий</p>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-border group text-sm"
          >
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
            {cat.icon && <span className="text-xs">{cat.icon}</span>}
            <span className="text-text/80 text-xs">{cat.name}</span>
            <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
              <button onClick={() => handleOpenEdit(cat)} aria-label="Редактировать категорию" className="text-muted hover:text-primary transition-colors">
                <Pencil size={11} />
              </button>
              <button onClick={() => deleteCat.mutate(cat.id)} aria-label="Удалить категорию" className="text-muted hover:text-danger transition-colors">
                <X size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) { setAddOpen(false); setAddIcon(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новая категория</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label>Название</Label>
                <Input name="name" required placeholder="Еда" />
              </div>
              <div className="space-y-2">
                <Label>Иконка</Label>
                <EmojiPicker value={addIcon} onChange={setAddIcon} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Цвет</Label>
              <Input name="color" type="color" defaultValue="#6366f1" className="h-10 cursor-pointer" />
            </div>
            <Button type="submit" disabled={createCat.isPending} className="w-full bg-primary text-white">
              Создать
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Редактировать категорию</DialogTitle></DialogHeader>
          {editTarget && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Название</Label>
                  <Input name="name" required defaultValue={editTarget.name} />
                </div>
                <div className="space-y-2">
                  <Label>Иконка</Label>
                  <EmojiPicker value={editIcon} onChange={setEditIcon} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Цвет</Label>
                <Input name="color" type="color" defaultValue={editTarget.color} className="h-10 cursor-pointer" />
              </div>
              <Button type="submit" disabled={updateCat.isPending} className="w-full bg-primary text-white">
                Сохранить
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
