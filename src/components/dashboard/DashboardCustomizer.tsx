"use client";

import { RotateCcw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/lib/stores/dashboardStore";
import { WIDGET_REGISTRY } from "./widgetRegistry";

interface DashboardCustomizerProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function DashboardCustomizer({ open, onOpenChange }: DashboardCustomizerProps) {
  const { widgets, toggleWidget, reset } = useDashboardStore();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 bg-background border-border flex flex-col">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle>Настройка дашборда</SheetTitle>
          <p className="text-xs text-muted">Включи или выключи виджеты. Порядок меняется перетаскиванием на дашборде.</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          {widgets.map(({ id, visible }) => {
            const cfg = WIDGET_REGISTRY[id];
            if (!cfg) return null;
            return (
              <div
                key={id}
                className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/4 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text leading-tight">{cfg.label}</p>
                  <p className="text-[11px] text-muted mt-0.5 truncate">{cfg.desc}</p>
                </div>
                <button
                  onClick={() => toggleWidget(id)}
                  className={`relative w-10 h-5.5 rounded-full border transition-all shrink-0 ${
                    visible
                      ? "bg-primary border-primary/60"
                      : "bg-white/8 border-border"
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                    visible ? "left-[calc(100%-18px)]" : "left-0.5"
                  }`} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border pt-4">
          <Button
            variant="ghost"
            onClick={reset}
            className="w-full text-muted hover:text-text gap-2 text-sm"
          >
            <RotateCcw size={13} />
            Сбросить по умолчанию
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
