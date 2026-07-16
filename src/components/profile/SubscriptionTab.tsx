"use client";

import { Sparkles, CreditCard, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePlan } from "@/lib/hooks/usePlan";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRO_FEATURES = [
  "Неограниченные привычки, проекты, теги",
  "Аналитика за 90 дней",
  "Годовой хитмап привычек",
  "Библиотека шаблонов программ",
  "Приоритетная поддержка",
];

export function SubscriptionTab() {
  const { isPro } = usePlan();
  const router = useRouter();

  return (
    <div className="space-y-5">
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", isPro ? "bg-primary" : "bg-white/8")}>
            {isPro ? <Sparkles size={18} className="text-white" /> : <CreditCard size={18} className="text-muted" />}
          </div>
          <div>
            <h3 className="font-semibold text-text">{isPro ? "HabitForge Pro" : "Бесплатный план"}</h3>
            <p className="text-xs text-muted">{isPro ? "Все функции разблокированы" : "Ограниченные возможности"}</p>
          </div>
          <span className={cn("ml-auto text-xs font-semibold px-2.5 py-1 rounded-full", isPro ? "bg-primary/15 text-primary" : "bg-white/8 text-muted")}>
            {isPro ? "Pro" : "Free"}
          </span>
        </div>

        {!isPro && (
          <>
            <p className="text-sm text-muted mb-4">Перейдите на Pro чтобы разблокировать все возможности HabitForge.</p>
            <Button className="bg-primary text-white gap-2" onClick={() => router.push("/upgrade")}>
              <Sparkles size={15} />
              Перейти на Pro — 499₽/мес
            </Button>
          </>
        )}

        {isPro && (
          <div className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-text">
                <Check size={14} className="text-success shrink-0" />
                {f}
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {isPro && (
        <GlassCard>
          <h3 className="font-semibold text-text mb-2">Управление подпиской</h3>
          <p className="text-sm text-muted mb-4">Изменить план, обновить способ оплаты или отменить подписку через портал Stripe.</p>
          <Button
            variant="outline"
            className="border-border text-text hover:bg-white/5 gap-2"
            onClick={() => window.open("https://billing.stripe.com", "_blank")}
          >
            <CreditCard size={15} />
            Открыть портал управления
          </Button>
        </GlassCard>
      )}

      <GlassCard>
        <h3 className="font-semibold text-text mb-3">История платежей</h3>
        <p className="text-sm text-muted text-center py-4">
          {isPro ? "История платежей доступна в портале Stripe" : "Нет платежей"}
        </p>
      </GlassCard>
    </div>
  );
}
