"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  TrendingUp, TrendingDown, Wallet, Plus, CalendarRange,
} from "lucide-react";
import {
  addDays, endOfMonth, endOfYear, format, parseISO,
  startOfMonth, startOfWeek, startOfYear,
} from "date-fns";
import {
  useCategories, useTransactions, useDeleteTransaction,
  useFinanceSummary,
} from "@/lib/hooks/useFinance";
import { CategoryManager } from "@/components/finance/CategoryManager";
import { TransactionDialog } from "@/components/finance/TransactionDialog";
import { TransactionList } from "@/components/finance/TransactionList";
import { ExpensePieChart } from "@/components/finance/ExpensePieChart";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { StatCard } from "@/components/shared/StatCard";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { cn, getTodayString } from "@/lib/utils";
import type { TransactionType, FinanceTransaction } from "@/types";

type Period = "day" | "week" | "month" | "year";
type TxFilter = "all" | "income" | "expense";
type SummaryMode = "period" | "range";

const PERIOD_LABELS: Record<Period, string> = {
  day: "День", week: "Неделя", month: "Месяц", year: "Год",
};

function getPeriodDateRange(period: Period, refDate: string): { start: string; end: string } {
  const ref = parseISO(refDate);
  switch (period) {
    case "day":
      return { start: refDate, end: refDate };
    case "week": {
      const start = startOfWeek(ref, { weekStartsOn: 1 });
      return { start: format(start, "yyyy-MM-dd"), end: format(addDays(start, 6), "yyyy-MM-dd") };
    }
    case "month":
      return { start: format(startOfMonth(ref), "yyyy-MM-dd"), end: format(endOfMonth(ref), "yyyy-MM-dd") };
    case "year":
      return { start: format(startOfYear(ref), "yyyy-MM-dd"), end: format(endOfYear(ref), "yyyy-MM-dd") };
  }
}

export default function FinancePage() {
  const [period, setPeriod] = useState<Period>("month");
  const [summaryMode, setSummaryMode] = useState<SummaryMode>("period");
  const [rangeStart, setRangeStart] = useState(getTodayString());
  const [rangeEnd, setRangeEnd] = useState(getTodayString());
  const [txFilter, setTxFilter] = useState<TxFilter>("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<FinanceTransaction | null>(null);
  const [txLimit, setTxLimit] = useState(50);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const today = getTodayString();
  const resetLimit = () => setTxLimit(50);

  const summaryParams =
    summaryMode === "range"
      ? { start: rangeStart, end: rangeEnd }
      : { period, date: today };

  const transactionDateRange =
    summaryMode === "range"
      ? { start: rangeStart, end: rangeEnd }
      : getPeriodDateRange(period, today);

  const { data: summary, isLoading: loadingSummary } = useFinanceSummary(summaryParams);
  const { data: categories = [] } = useCategories();
  const { data: transactions = [], isLoading: loadingTx } = useTransactions({
    start: transactionDateRange.start,
    end: transactionDateRange.end,
    ...(txFilter !== "all" ? { type: txFilter as TransactionType } : {}),
    ...(catFilter !== "all" ? { category_id: catFilter } : {}),
    limit: txLimit,
  });
  const deleteTransaction = useDeleteTransaction();

  const hasMore = transactions.length >= txLimit;

  const formatAmount = (n: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

  const chartData = (summary?.by_category ?? [])
    .filter((c) => c.type === "expense" && c.total > 0)
    .map((c) => ({
      name: c.categoryIcon ? `${c.categoryIcon} ${c.categoryName}` : c.categoryName,
      value: c.total,
      color: c.categoryColor ?? "#6366f1",
    }));

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Финансы"
        subtitle={`${summary?.transactions_count ?? 0} транзакций`}
        action={
          <Button onClick={() => setAddOpen(true)} className="bg-primary text-white gap-2">
            <Plus size={16} />
            Добавить
          </Button>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        {summaryMode === "period" ? (
          <FilterTabs
            value={period}
            onChange={(v) => { setPeriod(v as Period); resetLimit(); }}
            options={(Object.keys(PERIOD_LABELS) as Period[]).map((p) => ({
              value: p,
              label: PERIOD_LABELS[p],
            }))}
          />
        ) : (
          <div className="flex items-center gap-2">
            <DatePicker value={rangeStart} onChange={setRangeStart} max={rangeEnd} className="w-44" />
            <span className="text-muted text-sm">—</span>
            <DatePicker value={rangeEnd} onChange={setRangeEnd} min={rangeStart} max={today} className="w-44" />
          </div>
        )}
        <button
          onClick={() => setSummaryMode((m) => m === "period" ? "range" : "period")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
            summaryMode === "range"
              ? "bg-primary/15 border-primary/50 text-primary"
              : "border-border text-muted hover:text-text"
          )}
        >
          <CalendarRange size={13} />
          {summaryMode === "range" ? "Период" : "Диапазон"}
        </button>
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          <StatCard label="Доходы" value={summary?.total_income ?? 0} icon={<TrendingUp size={18} />} color="text-success" bg="bg-success/10" suffix=" ₽" />
          <StatCard label="Расходы" value={summary?.total_expense ?? 0} icon={<TrendingDown size={18} />} color="text-danger" bg="bg-danger/10" suffix=" ₽" />
          <StatCard
            label="Баланс"
            value={summary?.balance ?? 0}
            icon={<Wallet size={18} />}
            color={(summary?.balance ?? 0) >= 0 ? "text-success" : "text-danger"}
            bg={(summary?.balance ?? 0) >= 0 ? "bg-success/10" : "bg-danger/10"}
            suffix=" ₽"
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpensePieChart data={chartData} formatAmount={formatAmount} />
        <GlassCard>
          <CategoryManager categories={categories} />
        </GlassCard>
      </div>

      <TransactionList
        transactions={transactions}
        categories={categories}
        isLoading={loadingTx}
        txFilter={txFilter}
        onTxFilterChange={(v) => { setTxFilter(v); resetLimit(); }}
        catFilter={catFilter}
        onCatFilterChange={(v) => { setCatFilter(v); resetLimit(); }}
        hasMore={hasMore}
        onLoadMore={() => setTxLimit((n) => n + 50)}
        onEdit={setEditTx}
        onDelete={setDeleteConfirmId}
        onAddClick={() => setAddOpen(true)}
        formatAmount={formatAmount}
      />

      <TransactionDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        categories={categories}
      />

      {editTx && (
        <TransactionDialog
          open
          onClose={() => setEditTx(null)}
          categories={categories}
          transaction={editTx}
        />
      )}

      <ConfirmDeleteDialog
        open={!!deleteConfirmId}
        onOpenChange={(o) => !o && setDeleteConfirmId(null)}
        onConfirm={() => { deleteTransaction.mutate(deleteConfirmId!); setDeleteConfirmId(null); }}
        isPending={deleteTransaction.isPending}
        title="Удалить транзакцию?"
      />
    </div>
  );
}
