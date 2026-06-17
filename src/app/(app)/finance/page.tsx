"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, TrendingDown, Wallet, Plus, Trash2, Pencil, X, CalendarRange,
} from "lucide-react";
import {
  addDays, endOfMonth, endOfYear, format, parseISO,
  startOfMonth, startOfWeek, startOfYear,
} from "date-fns";
import { ru } from "date-fns/locale";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction,
  useFinanceSummary,
} from "@/lib/hooks/useFinance";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { StatCard } from "@/components/shared/StatCard";
import { CardSkeleton, ListSkeleton } from "@/components/shared/LoadingSkeleton";
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

// ─── Emoji Picker ─────────────────────────────────────────────────────────────

const EMOJI_GROUPS = [
  { label: "Финансы",      emojis: ["💰","💳","🏦","💵","🪙","📊","📈","💹","🏧","💸","🤑","💎"] },
  { label: "Еда",          emojis: ["🍕","🍔","🍜","🍣","☕","🍺","🥗","🥐","🍱","🍎","🧃","🛒"] },
  { label: "Транспорт",    emojis: ["🚗","✈️","🚌","🚇","🚲","🛵","⛽","🚕","🛳️","🚁"] },
  { label: "Дом",          emojis: ["🏠","🔧","💡","🧹","🪴","🛁","🪑","🔑"] },
  { label: "Здоровье",     emojis: ["💊","🏥","🏃","💪","🧘","🦷","🧴","❤️"] },
  { label: "Развлечения",  emojis: ["🎮","🎬","🎵","🎭","📚","🎯","🎲","🎸"] },
  { label: "Покупки",      emojis: ["👕","👗","👠","💄","🛍️","👒","💍","🧢"] },
  { label: "Работа",       emojis: ["💼","🖥️","📱","🖊️","📝","🗂️","⚙️","🔬"] },
];

function EmojiPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (emoji: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-10 h-10 rounded-xl border text-lg flex items-center justify-center transition-all",
          open
            ? "border-primary/50 bg-primary/10"
            : "border-border bg-white/5 hover:border-primary/30 hover:bg-white/8"
        )}
      >
        {value ?? <span className="text-muted text-sm">+</span>}
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 w-72 rounded-xl border border-border bg-popover/95 shadow-2xl backdrop-blur-xl p-3 space-y-3 max-h-72 overflow-y-auto scrollbar-thin">
          {/* Clear option */}
          <button
            type="button"
            onClick={() => { onChange(null); setOpen(false); }}
            className="w-full text-left text-xs text-muted hover:text-text px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            Без иконки
          </button>

          {EMOJI_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1.5 px-1">{group.label}</p>
              <div className="grid grid-cols-8 gap-0.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { onChange(emoji); setOpen(false); }}
                    className={cn(
                      "w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all hover:bg-white/10",
                      value === emoji && "bg-primary/20 ring-1 ring-primary/50"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add Transaction Dialog ───────────────────────────────────────────────────

function AddTransactionDialog({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: FinanceCategory[];
}) {
  const [type, setType] = useState<TransactionType>("expense");
  const create = useCreateTransaction();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    create.mutate(
      {
        type,
        amount: Number(fd.get("amount")),
        date: (fd.get("date") as string) || getTodayString(),
        description: (fd.get("description") as string) || undefined,
        categoryId: (fd.get("categoryId") as string) || null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая транзакция</DialogTitle>
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
              placeholder="0.00"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Категория</Label>
            <Select name="categoryId">
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
            <Input name="description" placeholder="Необязательно" />
          </div>

          <div className="space-y-2">
            <Label>Дата</Label>
            <DatePicker name="date" defaultValue={getTodayString()} />
          </div>

          <Button
            type="submit"
            disabled={create.isPending}
            className="w-full gradient-primary text-white"
          >
            Добавить
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Transaction Dialog ──────────────────────────────────────────────────

function EditTransactionDialog({
  transaction,
  onClose,
  categories,
}: {
  transaction: FinanceTransaction;
  onClose: () => void;
  categories: FinanceCategory[];
}) {
  const [type, setType] = useState<TransactionType>(transaction.type);
  const update = useUpdateTransaction();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    update.mutate(
      {
        id: transaction.id,
        payload: {
          type,
          amount: Number(fd.get("amount")),
          date: (fd.get("date") as string) || getTodayString(),
          description: (fd.get("description") as string) || undefined,
          categoryId: (fd.get("categoryId") as string) || null,
        },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать транзакцию</DialogTitle>
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
              defaultValue={transaction.amount}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Категория</Label>
            <Select name="categoryId" defaultValue={transaction.categoryId ?? ""}>
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
              defaultValue={transaction.description ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Дата</Label>
            <DatePicker name="date" defaultValue={transaction.date} />
          </div>

          <Button
            type="submit"
            disabled={update.isPending}
            className="w-full gradient-primary text-white"
          >
            Сохранить
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Category Manager ─────────────────────────────────────────────────────────

function CategoryManager({ categories }: { categories: FinanceCategory[] }) {
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
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: cat.color }}
            />
            {cat.icon && <span className="text-xs">{cat.icon}</span>}
            <span className="text-text/80 text-xs">{cat.name}</span>
            <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
              <button onClick={() => handleOpenEdit(cat)} className="text-muted hover:text-primary transition-colors">
                <Pencil size={11} />
              </button>
              <button onClick={() => deleteCat.mutate(cat.id)} className="text-muted hover:text-danger transition-colors">
                <X size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add dialog */}
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
            <Button type="submit" disabled={createCat.isPending} className="w-full gradient-primary text-white">
              Создать
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
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
              <Button type="submit" disabled={updateCat.isPending} className="w-full gradient-primary text-white">
                Сохранить
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const [period, setPeriod] = useState<Period>("month");
  const [summaryMode, setSummaryMode] = useState<SummaryMode>("period");
  const [rangeStart, setRangeStart] = useState(getTodayString());
  const [rangeEnd, setRangeEnd] = useState(getTodayString());

  const [txFilter, setTxFilter] = useState<TxFilter>("all");
  const [catFilter, setCatFilter] = useState<string>("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<FinanceTransaction | null>(null);

  const today = getTodayString();

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
    limit: 50,
  });
  const deleteTransaction = useDeleteTransaction();

  const chartData = (summary?.by_category ?? [])
    .filter((c) => c.type === "expense" && c.total > 0)
    .map((c) => ({
      name: c.categoryIcon ? `${c.categoryIcon} ${c.categoryName}` : c.categoryName,
      value: c.total,
      color: c.categoryColor ?? "#6366f1",
    }));

  const formatAmount = (n: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

  const getCategoryForTx = (categoryId: string | null) =>
    categories.find((c) => c.id === categoryId) ?? null;

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Финансы"
        subtitle={`${summary?.transactions_count ?? 0} транзакций`}
        action={
          <Button onClick={() => setAddOpen(true)} className="gradient-primary text-white gap-2">
            <Plus size={16} />
            Добавить
          </Button>
        }
      />

      {/* Period / Range toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        {summaryMode === "period" ? (
          <FilterTabs
            value={period}
            onChange={setPeriod}
            options={(Object.keys(PERIOD_LABELS) as Period[]).map((p) => ({
              value: p,
              label: PERIOD_LABELS[p],
            }))}
          />
        ) : (
          <div className="flex items-center gap-2">
            <DatePicker
              value={rangeStart}
              onChange={setRangeStart}
              max={rangeEnd}
              className="w-44"
            />
            <span className="text-muted text-sm">—</span>
            <DatePicker
              value={rangeEnd}
              onChange={setRangeEnd}
              min={rangeStart}
              max={today}
              className="w-44"
            />
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

      {/* Summary cards */}
      {loadingSummary ? (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
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
        </div>
      )}

      {/* Chart + categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="font-semibold text-text mb-4">Расходы по категориям</h3>
          {chartData.length > 0 ? (
            <div className="flex items-center gap-6">
              <PieChart width={180} height={180}>
                <Pie
                  data={chartData}
                  cx={90}
                  cy={90}
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatAmount(v as number)}
                  contentStyle={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f1f5f9" }}
                />
              </PieChart>
              <div className="space-y-2 flex-1 min-w-0">
                {chartData.slice(0, 5).map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="text-xs text-text/80 truncate">{item.name}</span>
                    </div>
                    <span className="text-xs text-danger shrink-0">{formatAmount(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-8">Нет расходов за период</p>
          )}
        </GlassCard>

        <GlassCard>
          <CategoryManager categories={categories} />
        </GlassCard>
      </div>

      {/* Transactions */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <FilterTabs
            value={txFilter}
            onChange={setTxFilter}
            options={[
              { value: "all", label: "Все" },
              { value: "income", label: "Доходы" },
              { value: "expense", label: "Расходы" },
            ]}
          />

          {/* Category filter */}
          <Select value={catFilter} onValueChange={(v) => setCatFilter(v ?? "all")}>
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

        {loadingTx ? (
          <ListSkeleton count={4} />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<Wallet />}
            title="Нет транзакций"
            description="Добавьте первую транзакцию"
            action={
              <Button onClick={() => setAddOpen(true)} className="gradient-primary text-white">
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
                    {/* Category icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                      style={{ background: cat ? `${cat.color}22` : "rgba(255,255,255,0.05)" }}
                    >
                      {cat?.icon ? (
                        <span>{cat.icon}</span>
                      ) : (
                        <Wallet size={18} className="text-muted" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {tx.description ?? cat?.name ?? (isIncome ? "Доход" : "Расход")}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {cat && (
                          <span className="text-xs text-muted">{cat.name}</span>
                        )}
                        <span className="text-xs text-muted">
                          {format(new Date(tx.date), "d MMM", { locale: ru })}
                        </span>
                      </div>
                    </div>

                    {/* Amount + actions */}
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-semibold", isIncome ? "text-success" : "text-danger")}>
                        {isIncome ? "+" : "-"}{formatAmount(tx.amount)}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditTx(tx)}
                          className="text-muted hover:text-primary transition-colors p-1"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteTransaction.mutate(tx.id)}
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
          </div>
        )}
      </div>

      <AddTransactionDialog open={addOpen} onClose={() => setAddOpen(false)} categories={categories} />
      {editTx && (
        <EditTransactionDialog
          transaction={editTx}
          onClose={() => setEditTx(null)}
          categories={categories}
        />
      )}
    </div>
  );
}
