"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useFinanceSummary } from "@/lib/hooks/useFinance";

export function FinanceWidget() {
  const { data } = useFinanceSummary({ period: "week" });

  const income = data?.total_income ?? 0;
  const expense = data?.total_expense ?? 0;
  const balance = data?.balance ?? 0;

  return (
    <Link href="/finance" className="block h-full glass p-5 hover:border-success/30 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
          <Wallet size={16} className="text-success" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text leading-tight">Финансы</h2>
          <p className="text-[10px] text-muted">за эту неделю</p>
        </div>
      </div>

      <p className={`text-2xl font-bold tabular-nums mb-3 ${balance >= 0 ? "text-success" : "text-danger"}`}>
        {balance >= 0 ? "+" : ""}
        {balance.toLocaleString("ru")} ₽
      </p>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted">
            <TrendingUp size={11} className="text-success" />
            Доходы
          </div>
          <span className="font-semibold text-success tabular-nums">
            +{income.toLocaleString("ru")} ₽
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted">
            <TrendingDown size={11} className="text-danger" />
            Расходы
          </div>
          <span className="font-semibold text-danger tabular-nums">
            -{expense.toLocaleString("ru")} ₽
          </span>
        </div>
      </div>
    </Link>
  );
}
