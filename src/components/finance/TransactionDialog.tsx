"use client";

import { useState } from "react";
import { useCreateTransaction, useUpdateTransaction } from "@/lib/hooks/useFinance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { SelectOption } from "@/components/shared/SelectOption";
import { cn, getTodayString } from "@/lib/utils";
import type { TransactionType, FinanceCategory, FinanceTransaction } from "@/types";

interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  categories: FinanceCategory[];
  transaction?: FinanceTransaction;
}

export function TransactionDialog({ open, onClose, categories, transaction }: TransactionDialogProps) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense");
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const isPending = create.isPending || update.isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      type,
      amount: Number(fd.get("amount")),
      date: (fd.get("date") as string) || getTodayString(),
      description: (fd.get("description") as string) || undefined,
      categoryId: (fd.get("categoryId") as string) || null,
    };
    if (transaction) {
      update.mutate({ id: transaction.id, payload }, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Редактировать транзакцию" : "Новая транзакция"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["income", "expense"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "py-2.5 rounded-xl text-sm font-medium border transition-all",
                  type === t
                    ? t === "income"
                      ? "bg-success/15 border-success/50 text-success"
                      : "bg-danger/15 border-danger/50 text-danger"
                    : "border-border text-muted hover:text-text"
                )}
              >
                {t === "income" ? "↑ Доход" : "↓ Расход"}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Сумма</Label>
            <Input
              name="amount"
              type="number"
              min={0}
              step={0.01}
              required
              defaultValue={transaction?.amount ?? ""}
              placeholder="0.00"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Категория</Label>
            <Select name="categoryId" defaultValue={transaction?.categoryId ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="Без категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Без категории</SelectItem>
                {categories.map((c) => (
                  <SelectOption key={c.id} value={c.id} label={c.name} icon={c.icon} color={c.color} />
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Input
              name="description"
              placeholder="Необязательно"
              defaultValue={transaction?.description ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Дата</Label>
            <DatePicker name="date" defaultValue={transaction?.date ?? getTodayString()} />
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-primary text-white">
            {transaction ? "Сохранить" : "Добавить"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
