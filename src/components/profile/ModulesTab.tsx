"use client";

import { Check } from "lucide-react";
import { toast } from "sonner";
import { useOnboardingStore, MODULES as MODULE_LIST, type AppModule } from "@/lib/stores/onboardingStore";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

export function ModulesTab() {
  const { modules, setModules } = useOnboardingStore();
  const active = new Set(modules);

  const toggle = (id: AppModule) => {
    if (active.has(id)) {
      if (active.size === 1) return;
      active.delete(id);
    } else {
      active.add(id);
    }
    setModules([...active] as AppModule[]);
    toast.success("Разделы обновлены");
  };

  return (
    <div className="space-y-5">
      <GlassCard className="p-5">
        <h3 className="font-semibold text-text mb-1">Видимые разделы</h3>
        <p className="text-sm text-muted mb-5">Скрытые разделы не удаляются — данные сохраняются.</p>
        <div className="grid grid-cols-2 gap-3">
          {MODULE_LIST.map(({ id, label, desc, icon: Icon, color }) => {
            const on = active.has(id);
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={cn(
                  "relative p-4 rounded-2xl border text-left transition-all duration-200",
                  on
                    ? "border-primary/40 bg-primary/8"
                    : "border-border bg-white/3 hover:bg-white/6 hover:border-white/15 opacity-50"
                )}
              >
                {on && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check size={9} className="text-white" />
                  </div>
                )}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: `${color}18` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <p className="text-sm font-semibold text-text leading-tight">{label}</p>
                <p className="text-[11px] text-muted mt-0.5 leading-snug">{desc}</p>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-4">Выбрано: {active.size} из {MODULE_LIST.length}</p>
      </GlassCard>
    </div>
  );
}
