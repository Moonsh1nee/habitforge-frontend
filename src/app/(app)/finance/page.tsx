"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, TrendingDown, Wallet, Plus, Trash2, Pencil, X, CalendarRange,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction,
  useFinanceSummary,
} from "@/lib/hooks/useFinance";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn, getTodayString } from "@/lib/utils";
import type { TransactionType, FinanceCategory, FinanceTransaction } from "@/types";

type Period = "day" | "week" | "month" | "year";
type TxFilter = "all" | "income" | "expense";
type SummaryMode = "period" | "range";

const PERIOD_LABELS: Record<Period, string> = {
  day: "День", week: "Неделя", month: "Месяц", year: "Год",
};

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
        <div className="absolute left-0 top-12 z-50 w-72 rounded-xl border border-border bg-[#13131a] shadow-2xl p-3 space-y-3 max-h-72 overflow-y-auto">
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
      <DialogContent className="bg-[#13131a] border-border">
        <DialogHeader>
          <DialogTitle className="text-text">Новая транзакция</DialogTitle>
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
            <Label className="text-text/80">Сумма</Label>
            <Input
              name="amount"
              type="number"
              min={0}
              step={0.01}
              required
              placeholder="0.00"
              className="bg-white/5 border-border text-text text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-text/80">Категория</Label>
            <Select name="categoryId">
              <SelectTrigger className="bg-white/5 border-border text-text">
                <SelectValue placeholder="Без категории" />
              </SelectTrigger>
              <SelectContent className="bg-[#13131a] border-border">
                <SelectItem value="">Без категории</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-text/80">Описание</Label>
            <Input
              name="description"
              placeholder="Необязательно"
              className="bg-white/5 border-border text-text"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-text/80">Дата</Label>
            <Input
              name="date"
              type="date"
              defaultValue={getTodayString()}
              className="bg-white/5 border-border text-text"
            />
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
      <DialogContent className="bg-[#13131a] border-border">
        <DialogHeader>
          <DialogTitle className="text-text">Редактировать транзакцию</DialogTitle>
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
            <Label className="text-text/80">Сумма</Label>
            <Input
              name="amount"
              type="number"
              min={0}
              step={0.01}
              required
              defaultValue={transaction.amount}
              className="bg-white/5 border-border text-text text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-text/80">Категория</Label>
            <Select name="categoryId" defaultValue={transaction.categoryId ?? ""}>
              <SelectTrigger className="bg-white/5 border-border text-text">
                <SelectValue placeholder="Без категории" />
              </SelectTrigger>
              <SelectContent className="bg-[#13131a] border-border">
                <SelectItem value="">Без категории</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-text/80">Описание</Label>
            <Input
              name="description"
              placeholder="Необязательно"
              defaultValue={transaction.description ?? ""}
              className="bg-white/5 border-border text-text"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-text/80">Дата</Label>
            <Input
              name="date"
              type="date"
              defaultValue={transaction.date}
              className="bg-white/5 border-border text-text"
            />
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
        <DialogContent className="bg-[#13131a] border-border">
          <DialogHeader><DialogTitle className="text-text">Новая категория</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label className="text-text/80">Название</Label>
                <Input name="name" required placeholder="Еда" className="bg-white/5 border-border text-text" />
              </div>
              <div className="space-y-2">
                <Label className="text-text/80">Иконка</Label>
                <EmojiPicker value={addIcon} onChange={setAddIcon} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-text/80">Цвет</Label>
              <Input name="color" type="color" defaultValue="#6366f1" className="bg-white/5 border-border h-10 cursor-pointer" />
            </div>
            <Button type="submit" disabled={createCat.isPending} className="w-full gradient-primary text-white">
              Создать
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="bg-[#13131a] border-border">
          <DialogHeader><DialogTitle className="text-text">Редактировать категорию</DialogTitle></DialogHeader>
          {editTarget && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label className="text-text/80">Название</Label>
                  <Input name="name" required defaultValue={editTarget.name} className="bg-white/5 border-border text-text" />
                </div>
                <div className="space-y-2">
                  <Label className="text-text/80">Иконка</Label>
                  <EmojiPicker value={editIcon} onChange={setEditIcon} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-text/80">Цвет</Label>
                <Input name="color" type="color" defaultValue={editTarget.color} className="bg-white/5 border-border h-10 cursor-pointer" />
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

  const { data: summary } = useFinanceSummary(summaryParams);
  const { data: categories = [] } = useCategories();
  const { data: transactions = [] } = useTransactions({
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Финансы</h1>
          <p className="text-sm text-muted mt-0.5">{summary?.transactions_count ?? 0} транзакций</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gradient-primary text-white gap-2">
          <Plus size={16} />
          Добавить
        </Button>
      </div>

      {/* Period / Range toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        {summaryMode === "period" ? (
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList className="bg-transparent p-0 gap-1 h-auto">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <TabsTrigger
                  key={p}
                  value={p}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all text-muted data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_var(--color-primary-glow)] hover:text-text"
                >
                  {PERIOD_LABELS[p]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="bg-white/5 border-border text-text h-8 text-sm w-36"
            />
            <span className="text-muted text-sm">—</span>
            <Input
              type="date"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="bg-white/5 border-border text-text h-8 text-sm w-36"
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
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Доходы",
            value: summary?.total_income ?? 0,
            icon: TrendingUp,
            color: "text-success",
            bg: "bg-success/10",
          },
          {
            label: "Расходы",
            value: summary?.total_expense ?? 0,
            icon: TrendingDown,
            color: "text-danger",
            bg: "bg-danger/10",
          },
          {
            label: "Баланс",
            value: summary?.balance ?? 0,
            icon: Wallet,
            color: (summary?.balance ?? 0) >= 0 ? "text-success" : "text-danger",
            bg: (summary?.balance ?? 0) >= 0 ? "bg-success/10" : "bg-danger/10",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <GlassCard key={label}>
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className={cn("text-xl font-bold", color)}>
              <AnimatedNumber value={Math.abs(value)} suffix=" ₽" decimals={0} />
            </p>
            <p className="text-xs text-muted mt-0.5">{label}</p>
          </GlassCard>
        ))}
      </div>

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
          <Tabs value={txFilter} onValueChange={(v) => setTxFilter(v as TxFilter)}>
            <TabsList className="bg-transparent p-0 gap-1 h-auto">
              {(["all", "income", "expense"] as const).map((f) => (
                <TabsTrigger
                  key={f}
                  value={f}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all text-muted data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_var(--color-primary-glow)] hover:text-text"
                >
                  {f === "all" ? "Все" : f === "income" ? "Доходы" : "Расходы"}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Category filter */}
          <Select value={catFilter} onValueChange={(v) => setCatFilter(v ?? "all")}>
            <SelectTrigger className="w-40 bg-white/5 border-border text-text text-sm h-8">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent className="bg-[#13131a] border-border">
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {transactions.length === 0 ? (
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
                    className="glass p-4 flex items-center gap-3 group"
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
