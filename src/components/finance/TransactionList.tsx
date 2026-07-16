"use client";

import { motion, AnimatePresence } from "motion/react";
import { Pencil, Trash2, Wallet } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import { SelectOption } from "@/components/shared/SelectOption";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FinanceCategory, FinanceTransaction } from "@/types";

type TxFilter = "all" | "income" | "expense";

interface TransactionListProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  isLoading: boolean;
  txFilter: TxFilter;
  onTxFilterChange: (v: TxFilter) => void;
  catFilter: string;
  onCatFilterChange: (v: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  onEdit: (tx: FinanceTransaction) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  formatAmount: (n: number) => string;
}

export function TransactionList({
  transactions,
  categories,
  isLoading,
  txFilter,
  onTxFilterChange,
  catFilter,
  onCatFilterChange,
  hasMore,
  onLoadMore,
  onEdit,
  onDelete,
  onAddClick,
  formatAmount,
}: TransactionListProps) {
  const getCategoryForTx = (categoryId: string | null) =>
    categories.find((c) => c.id === categoryId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <FilterTabs
          value={txFilter}
          onChange={(v) => onTxFilterChange(v as TxFilter)}
          options={[
            { value: "all", label: "Все" },
            { value: "income", label: "Доходы" },
            { value: "expense", label: "Расходы" },
          ]}
        />

        <Select value={catFilter} onValueChange={(v) => onCatFilterChange(v ?? "all")}>
          <SelectTrigger className="w-48" size="sm">
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((c) => (
              <SelectOption key={c.id} value={c.id} label={c.name} icon={c.icon} color={c.color} />
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<Wallet />}
          title="Нет транзакций"
          description="Добавьте первую транзакцию"
          action={
            <Button onClick={onAddClick} className="bg-primary text-white">
              Добавить
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {transactions.map((tx, i) => {
              const cat = getCategoryForTx(tx.categoryId);
              const isIncome = tx.type === "income";
              return (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn("glass p-4 flex items-center gap-3 group border-l-2", isIncome ? "border-l-success/60" : "border-l-danger/60")}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                    style={{ background: cat ? `${cat.color}22` : "rgba(255,255,255,0.05)" }}
                  >
                    {cat?.icon ? <span>{cat.icon}</span> : <Wallet size={18} className="text-muted" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {tx.description ?? cat?.name ?? (isIncome ? "Доход" : "Расход")}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {cat && <span className="text-xs text-muted">{cat.name}</span>}
                      <span className="text-xs text-muted">
                        {format(new Date(tx.date), "d MMM", { locale: ru })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-semibold", isIncome ? "text-success" : "text-danger")}>
                      {isIncome ? "+" : "-"}{formatAmount(tx.amount)}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(tx)}
                        aria-label="Редактировать транзакцию"
                        className="text-muted hover:text-primary transition-colors p-1"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(tx.id)}
                        aria-label="Удалить транзакцию"
                        className="text-muted hover:text-danger transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="w-full mt-2 py-2.5 text-sm text-muted hover:text-primary border border-border hover:border-primary/40 rounded-xl transition-all"
            >
              {isLoading ? "Загрузка..." : "Загрузить ещё"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
