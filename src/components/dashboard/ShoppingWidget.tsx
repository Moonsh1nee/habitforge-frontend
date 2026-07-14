"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useShoppingLists } from "@/lib/hooks/useShopping";

export function ShoppingWidget() {
  const { data: lists = [] } = useShoppingLists();
  const active = lists.filter((l) => l.status === "active");
  const totalItems = active.reduce((s, l) => s + l.itemsCount, 0);
  const checkedItems = active.reduce((s, l) => s + l.itemsChecked, 0);
  const pct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <Link href="/shopping" className="block h-full glass p-5 hover:border-accent/30 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
          <ShoppingCart size={16} className="text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text leading-tight">Покупки</h3>
          <p className="text-[10px] text-muted">активные списки</p>
        </div>
      </div>

      {active.length === 0 ? (
        <p className="text-sm text-muted">Нет активных списков</p>
      ) : (
        <>
          <p className="text-2xl font-bold text-accent tabular-nums mb-3">{active.length}</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted">
              <span>{checkedItems} из {totalItems} товаров</span>
              <span className="font-semibold text-text">{pct}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </>
      )}
    </Link>
  );
}
