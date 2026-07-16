"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCreateShoppingList, useUpdateShoppingList } from "@/lib/hooks/useShopping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface ListFormData {
  name: string;
  store: string;
  plannedDate: string;
  plannedTime: string;
  notes: string;
}

interface ListFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<ListFormData>;
  listId?: string;
}

export function ListFormDialog({ open, onOpenChange, initial, listId }: ListFormDialogProps) {
  const create = useCreateShoppingList();
  const update = useUpdateShoppingList();

  const [form, setForm] = useState<ListFormData>({
    name:        initial?.name        ?? "",
    store:       initial?.store       ?? "",
    plannedDate: initial?.plannedDate ?? "",
    plannedTime: initial?.plannedTime ?? "",
    notes:       initial?.notes       ?? "",
  });

  const pending = create.isPending || update.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name:        form.name,
      store:       form.store || null,
      plannedDate: form.plannedDate || null,
      plannedTime: form.plannedTime ? `${form.plannedTime}:00` : null,
      notes:       form.notes || null,
    };
    if (listId) {
      update.mutate({ id: listId, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          setForm({ name: "", store: "", plannedDate: "", plannedTime: "", notes: "" });
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{listId ? "Изменить список" : "Новый список"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Название *</Label>
            <Input
              placeholder="Пятёрочка, 15 июля"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Магазин</Label>
            <Input
              placeholder="Пятёрочка"
              value={form.store}
              onChange={(e) => setForm({ ...form, store: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Дата</Label>
              <Input
                type="date"
                value={form.plannedDate}
                onChange={(e) => setForm({ ...form, plannedDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Время</Label>
              <Input
                type="time"
                value={form.plannedTime}
                onChange={(e) => setForm({ ...form, plannedTime: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Заметки</Label>
            <Input
              placeholder="Необязательно"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" className="flex-1" disabled={!form.name.trim() || pending}>
              {pending && <Loader2 size={14} className="animate-spin mr-1.5" />}
              {listId ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
