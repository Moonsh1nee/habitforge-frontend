"use client";

import { RotateCcw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/lib/stores/dashboardStore";
import { WIDGET_REGISTRY } from "./widgetRegistry";
import type { WidgetSpan } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardCustomizerProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const SPAN_OPTIONS: { value: WidgetSpan; label: string }[] = [
  { value: "third", label: "1/3" },
  { value: "half", label: "1/2" },
  { value: "full", label: "1/1" },
];

export function DashboardCustomizer({ open, onOpenChange }: DashboardCustomizerProps) {
  const { widgets, toggleWidget, setWidgetSpan, reset } = useDashboardStore();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-88 bg-background border-border flex flex-col">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle>Настройка дашборда</SheetTitle>
          <p className="text-xs text-muted">Включи виджеты, выбери ширину. Порядок меняется перетаскиванием на дашборде.</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          {widgets.map(({ id, visible, span }) => {
            const cfg = WIDGET_REGISTRY[id];
            if (!cfg) return null;
            const currentSpan = span ?? cfg.span;
            return (
              <div
                key={id}
                className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/4 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text leading-tight">{cfg.label}</p>
                  <p className="text-[11px] text-muted mt-0.5 truncate">{cfg.desc}</p>
                  {visible && (
                    <div className="flex items-center gap-1 mt-2">
                      {SPAN_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setWidgetSpan(id, opt.value)}
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors",
                            currentSpan === opt.value
                              ? "bg-primary/15 border-primary/40 text-primary-text"
                              : "border-border text-muted hover:text-text"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
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
