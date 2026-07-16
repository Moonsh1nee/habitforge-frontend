"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store, CalendarDays, Clock, CheckCircle2, Circle,
  Trash2, Pencil, ShoppingBag, Wallet, Plus, PackageCheck,
} from "lucide-react";
import {
  useShoppingList, useCheckShoppingItem, useDeleteShoppingItem, useDeleteShoppingList,
} from "@/lib/hooks/useShopping";
import { ListSkeleton, CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AddItemForm } from "./AddItemForm";
import { ListFormDialog } from "./ListFormDialog";
import { CompleteDialog } from "./CompleteDialog";
import { formatPrice, formatDate, formatTime, STATUS_COLORS, STATUS_LABELS } from "./helpers";

interface ListDetailSheetProps {
  listId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ListDetailSheet({ listId, open, onOpenChange }: ListDetailSheetProps) {
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
                    {isActive && <p className="text-xs text-muted/60">Добавьте первый товар</p>}
                  </div>
                )}

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

      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={handleDeleteList}
        isPending={deleteList.isPending}
        title="Удалить список?"
        description="Список и все товары в нём будут удалены. Это действие нельзя отменить."
      />
    </>
  );
}
