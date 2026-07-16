"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAddShoppingItem } from "@/lib/hooks/useShopping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddItemFormProps {
  listId: string;
  onClose: () => void;
}

export function AddItemForm({ listId, onClose }: AddItemFormProps) {
  const addItem = useAddShoppingItem(listId);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addItem.mutate(
      {
        name: name.trim(),
        quantity: parseFloat(qty) || 1,
        unit: unit || null,
        plannedPrice: price ? parseFloat(price) : null,
      },
      {
        onSuccess: () => {
          setName(""); setQty("1"); setUnit(""); setPrice("");
          onClose();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-border">
      <p className="text-sm font-medium text-text">Добавить позицию</p>
      <div className="space-y-2">
        <Input
          placeholder="Название товара *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        <div className="grid grid-cols-3 gap-2">
          <Input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Кол-во"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <Input
            placeholder="Ед."
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="Цена ₽"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" size="sm" className="flex-1" disabled={!name.trim() || addItem.isPending}>
          {addItem.isPending && <Loader2 size={12} className="animate-spin mr-1" />}
          Добавить
        </Button>
      </div>
    </form>
  );
}
