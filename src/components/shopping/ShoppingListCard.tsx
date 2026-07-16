"use client";

import { motion } from "motion/react";
import { Store, CalendarDays, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";
import { formatPrice, formatDate, formatTime, STATUS_COLORS, STATUS_LABELS } from "./helpers";
import type { ShoppingList } from "@/types";

interface ShoppingListCardProps {
  list: ShoppingList;
  onClick: () => void;
}

export function ShoppingListCard({ list, onClick }: ShoppingListCardProps) {
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
