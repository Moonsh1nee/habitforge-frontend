"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart, Plus, Store, CalendarDays, Clock, CheckCircle2, Circle,
  Trash2, Pencil, ShoppingBag, Wallet, ChevronRight, Loader2,
  PackageCheck,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import {
  useShoppingLists,
  useShoppingList,
  useCreateShoppingList,
  useUpdateShoppingList,
  useDeleteShoppingList,
  useCompleteShoppingList,
  useAddShoppingItem,
  useCheckShoppingItem,
  useDeleteShoppingItem,
} from "@/lib/hooks/useShopping";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { ListSkeleton, CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { ShoppingList, ShoppingListStatus } from "@/types";

type StatusFilter = "all" | ShoppingListStatus;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return format(parseISO(dateStr), "d MMM", { locale: ru });
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return null;
  return timeStr.slice(0, 5);
}

const STATUS_COLORS: Record<ShoppingListStatus, string> = {
  active:    "text-primary",
  completed: "text-success",
  cancelled: "text-muted",
};

const STATUS_LABELS: Record<ShoppingListStatus, string> = {
  active:    "Активный",
  completed: "Завершён",
  cancelled: "Отменён",
};

// ─── List card ────────────────────────────────────────────────────────────────

function ShoppingListCard({
  list,
  onClick,
}: {
  list: ShoppingList;
  onClick: () => void;
}) {
  const progress = list.itemsCount > 0
    ? Math.round((list.itemsChecked / list.itemsCount) * 100)
    : 0;

  return (
    <GlassCard hover onClick={onClick} className="p-4 cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-[10px] font-medium uppercase tracking-wider", STATUS_COLORS[list.status])}>
              {STATUS_LABELS[list.status]}
            </span>
          </div>
          <p className="font-medium text-text truncate">{list.name}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
            {list.store && (
              <span className="flex items-center gap-1">
                <Store size={11} />
                {list.store}
              </span>
            )}
            {list.plannedDate && (
              <span className="flex items-center gap-1">
                <CalendarDays size={11} />
                {formatDate(list.plannedDate)}
                {list.plannedTime && <span>{formatTime(list.plannedTime)}</span>}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-text">
            {list.totalActual > 0 ? formatPrice(list.totalActual) : list.totalPlanned > 0 ? formatPrice(list.totalPlanned) : "—"}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {list.itemsChecked}/{list.itemsCount} поз.
          </p>
        </div>
      </div>

      {list.itemsCount > 0 && (
        <div className="mt-3">
          <div className="h-1 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-end mt-2">
        <ChevronRight size={14} className="text-muted/50" />
      </div>
    </GlassCard>
  );
}

// ─── Create / Edit list dialog ────────────────────────────────────────────────

interface ListFormData {
  name: string;
  store: string;
  plannedDate: string;
  plannedTime: string;
  notes: string;
}

function ListFormDialog({
  open,
  onOpenChange,
  initial,
  listId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<ListFormData>;
  listId?: string;
}) {
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
      create.mutate(payload, { onSuccess: () => { onOpenChange(false); setForm({ name: "", store: "", plannedDate: "", plannedTime: "", notes: "" }); } });
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

// ─── Complete dialog ──────────────────────────────────────────────────────────

function CompleteDialog({
  open,
  listId,
  listName,
  totalActual,
  onOpenChange,
  onClose,
}: {
  open: boolean;
  listId: string;
  listName: string;
  totalActual: number;
  onOpenChange: (v: boolean) => void;
  onClose: () => void;
}) {
  const complete = useCompleteShoppingList();

  const handleComplete = () => {
    complete.mutate(
      { id: listId },
      { onSuccess: () => { onOpenChange(false); onClose(); } }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Завершить поход?</AlertDialogTitle>
          <AlertDialogDescription>
            Будет создана транзакция в финансах на сумму{" "}
            <span className="text-text font-medium">{formatPrice(totalActual)}</span>.
            Список «{listName}» будет помечен как завершённый.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={handleComplete} disabled={complete.isPending}>
            {complete.isPending && <Loader2 size={13} className="animate-spin mr-1.5" />}
            Завершить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── List detail sheet ────────────────────────────────────────────────────────

function AddItemForm({ listId, onClose }: { listId: string; onClose: () => void }) {
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

function ListDetailSheet({
  listId,
  open,
  onOpenChange,
}: {
  listId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: listData, isLoading } = useShoppingList(listId);
  const checkItem = useCheckShoppingItem(listId ?? "");
  const deleteItem = useDeleteShoppingItem(listId ?? "");
  const deleteList = useDeleteShoppingList();

  const [addingItem, setAddingItem] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isActive = listData?.status === "active";

  const handleDeleteList = () => {
    if (!listId) return;
    deleteList.mutate(listId, { onSuccess: () => onOpenChange(false) });
  };

  const unchecked = listData?.items?.filter((i) => !i.checked) ?? [];
  const checked   = listData?.items?.filter((i) => i.checked)  ?? [];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto flex flex-col gap-0 p-0">
          {isLoading || !listData ? (
            <div className="p-6 space-y-4">
              <CardSkeleton />
              <ListSkeleton count={4} />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 pb-4 border-b border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] font-medium uppercase tracking-wider", STATUS_COLORS[listData.status])}>
                        {STATUS_LABELS[listData.status]}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-text">{listData.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted">
                      {listData.store && (
                        <span className="flex items-center gap-1">
                          <Store size={11} />
                          {listData.store}
                        </span>
                      )}
                      {listData.plannedDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          {formatDate(listData.plannedDate)}
                        </span>
                      )}
                      {listData.plannedTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatTime(listData.plannedTime)}
                        </span>
                      )}
                    </div>
                  </div>
                  {isActive && (
                    <button
                      onClick={() => setEditOpen(true)}
                      className="p-1.5 text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors shrink-0"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>

                {/* Totals */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white/4 rounded-xl p-3">
                    <p className="text-xs text-muted mb-0.5">Планируемая сумма</p>
                    <p className="text-base font-semibold text-text">
                      {listData.totalPlanned > 0 ? formatPrice(listData.totalPlanned) : "—"}
                    </p>
                  </div>
                  <div className="bg-white/4 rounded-xl p-3">
                    <p className="text-xs text-muted mb-0.5">Фактическая сумма</p>
                    <p className="text-base font-semibold text-success">
                      {listData.totalActual > 0 ? formatPrice(listData.totalActual) : "—"}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                {listData.itemsCount > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>{listData.itemsChecked} из {listData.itemsCount} куплено</span>
                      <span>{Math.round((listData.itemsChecked / listData.itemsCount) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${listData.itemsCount > 0 ? (listData.itemsChecked / listData.itemsCount) * 100 : 0}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Unchecked items */}
                {unchecked.length > 0 && (
                  <div className="space-y-1.5">
                    {unchecked.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/4 group transition-colors"
                      >
                        <button
                          onClick={() => checkItem.mutate(item.id)}
                          disabled={!isActive}
                          className="shrink-0 text-muted hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-default"
                        >
                          <Circle size={18} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-text">{item.name}</span>
                          <span className="text-xs text-muted ml-2">
                            {item.quantity !== 1 || item.unit ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : ""}
                          </span>
                        </div>
                        {item.plannedPrice != null && (
                          <span className="text-xs text-muted tabular-nums shrink-0">
                            {formatPrice(item.plannedPrice * item.quantity)}
                          </span>
                        )}
                        {isActive && (
                          <button
                            onClick={() => deleteItem.mutate(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-danger transition-all shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Checked items */}
                {checked.length > 0 && (
                  <div className="space-y-1.5">
                    {unchecked.length > 0 && (
                      <p className="text-xs text-muted uppercase tracking-wider px-3 pb-1">Куплено</p>
                    )}
                    {checked.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/4 group transition-colors opacity-50"
                      >
                        <button
                          onClick={() => checkItem.mutate(item.id)}
                          disabled={!isActive}
                          className="shrink-0 text-success transition-colors disabled:cursor-default"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-muted line-through">{item.name}</span>
                          <span className="text-xs text-muted/60 ml-2">
                            {item.quantity !== 1 || item.unit ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : ""}
                          </span>
                        </div>
                        {(item.actualPrice ?? item.plannedPrice) != null && (
                          <span className="text-xs text-muted/60 tabular-nums shrink-0">
                            {formatPrice((item.actualPrice ?? item.plannedPrice!) * item.quantity)}
                          </span>
                        )}
                        {isActive && (
                          <button
                            onClick={() => deleteItem.mutate(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-danger transition-all shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {listData.items?.length === 0 && !addingItem && (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <ShoppingBag size={32} className="text-muted/30" />
                    <p className="text-sm text-muted">Список пуст</p>
                    {isActive && (
                      <p className="text-xs text-muted/60">Добавьте первый товар</p>
                    )}
                  </div>
                )}

                {/* Add item form */}
                {isActive && (
                  <AnimatePresence>
                    {addingItem ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                      >
                        <AddItemForm listId={listData.id} onClose={() => setAddingItem(false)} />
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setAddingItem(true)}
                        className="w-full flex items-center gap-2 py-2 px-3 rounded-xl border border-dashed border-border text-sm text-muted hover:text-text hover:border-primary/40 transition-colors"
                      >
                        <Plus size={14} />
                        Добавить товар
                      </button>
                    )}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer actions */}
              {isActive && (
                <div className="p-6 pt-4 border-t border-border flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-danger hover:text-danger"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={14} />
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => setCompleteOpen(true)}
                    disabled={listData.itemsCount === 0}
                  >
                    <PackageCheck size={14} className="mr-1.5" />
                    Завершить поход
                  </Button>
                </div>
              )}

              {/* Finance link for completed */}
              {listData.status === "completed" && listData.transactionId && (
                <div className="p-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Wallet size={13} className="text-success" />
                    <span>Транзакция создана в финансах</span>
                  </div>
                  {listData.notes && (
                    <p className="text-xs text-muted mt-1 italic">{listData.notes}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit dialog */}
      {listData && (
        <ListFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          listId={listData.id}
          initial={{
            name:        listData.name,
            store:       listData.store ?? "",
            plannedDate: listData.plannedDate ?? "",
            plannedTime: listData.plannedTime ? listData.plannedTime.slice(0, 5) : "",
            notes:       listData.notes ?? "",
          }}
        />
      )}

      {/* Complete dialog */}
      {listData && (
        <CompleteDialog
          open={completeOpen}
          listId={listData.id}
          listName={listData.name}
          totalActual={listData.totalActual > 0 ? listData.totalActual : listData.totalPlanned}
          onOpenChange={setCompleteOpen}
          onClose={() => onOpenChange(false)}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить список?</AlertDialogTitle>
            <AlertDialogDescription>
              Список и все товары в нём будут удалены. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteList}
              className="bg-danger hover:bg-danger/90"
              disabled={deleteList.isPending}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { value: "all",       label: "Все" },
  { value: "active",    label: "Активные" },
  { value: "completed", label: "Завершённые" },
  { value: "cancelled", label: "Отменённые" },
];

export default function ShoppingPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: lists = [], isLoading } = useShoppingLists(
    statusFilter !== "all" ? { list_status: statusFilter } : undefined
  );

  const handleListClick = (id: string) => {
    setSelectedListId(id);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Списки покупок"
        subtitle="Планируй покупки и отслеживай расходы"
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} className="mr-1.5" />
            Новый список
          </Button>
        }
      />

      <FilterTabs
        options={FILTER_OPTIONS}
        value={statusFilter}
        onChange={(v) => setStatusFilter(v as StatusFilter)}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : lists.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={40} />}
          title="Нет списков покупок"
          description={
            statusFilter === "active"
              ? "Создайте первый список для похода в магазин"
              : "Нет списков в этой категории"
          }
          action={
            statusFilter === "active" ? (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus size={14} className="mr-1.5" />
                Создать список
              </Button>
            ) : undefined
          }
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
        >
          {lists.map((list) => (
            <motion.div
              key={list.id}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            >
              <ShoppingListCard list={list} onClick={() => handleListClick(list.id)} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <ListFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ListDetailSheet
        listId={selectedListId}
        open={sheetOpen}
        onOpenChange={(v) => {
          setSheetOpen(v);
          if (!v) setSelectedListId(null);
        }}
      />
    </div>
  );
}
