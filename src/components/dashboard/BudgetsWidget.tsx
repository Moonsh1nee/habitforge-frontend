"use client";

import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { useBudgetStatus } from "@/lib/hooks/useBudgets";
import { cn } from "@/lib/utils";

export function BudgetsWidget() {
  const { data: budgets = [] } = useBudgetStatus();
  const top = [...budgets].sort((a, b) => b.pct - a.pct).slice(0, 3);

  return (
    <Link href="/finance" className="block h-full glass p-5 hover:border-success/30 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
          <PiggyBank size={16} className="text-success" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text leading-tight">Бюджеты</h2>
          <p className="text-[10px] text-muted">использование лимитов</p>
        </div>
      </div>

      {top.length === 0 ? (
        <p className="text-sm text-muted">Бюджеты не настроены</p>
      ) : (
        <div className="space-y-3">
          {top.map((b) => (
            <div key={b.budgetId}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text truncate mr-2">{b.categoryName}</span>
                <span
                  className={cn(
                    "shrink-0 tabular-nums font-medium",
                    b.overBudget ? "text-danger" : b.pct >= 80 ? "text-warning" : "text-muted"
                  )}
                >
                  {Math.round(b.pct)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    b.overBudget ? "bg-danger" : b.pct >= 80 ? "bg-warning" : "bg-success"
                  )}
                  style={{ width: `${Math.min(100, b.pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
