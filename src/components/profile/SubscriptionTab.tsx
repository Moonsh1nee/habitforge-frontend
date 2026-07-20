"use client";

import { Sparkles, CreditCard, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { usePlan } from "@/lib/hooks/usePlan";
import { useSubscription, useCreateCheckout, useOpenBillingPortal } from "@/lib/hooks/useBilling";
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

const STATUS_LABELS: Record<string, string> = {
  active: "Активна",
  canceled: "Отменена",
  past_due: "Просрочена",
  trialing: "Пробный период",
};

export function SubscriptionTab() {
  const { isPro } = usePlan();
  const router = useRouter();
  const { data: subscription } = useSubscription();
  const checkout = useCreateCheckout();
  const portal = useOpenBillingPortal();

  return (
    <div className="space-y-5">
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", isPro ? "bg-primary" : "bg-white/8")}>
            {isPro ? <Sparkles size={18} className="text-white" /> : <CreditCard size={18} className="text-muted" />}
          </div>
          <div>
            <h3 className="font-semibold text-text">{isPro ? "HabitForge Pro" : "Бесплатный план"}</h3>
            <p className="text-xs text-muted">
              {subscription?.status
                ? STATUS_LABELS[subscription.status] ?? subscription.status
                : isPro ? "Все функции разблокированы" : "Ограниченные возможности"}
            </p>
          </div>
          <span className={cn("ml-auto text-xs font-semibold px-2.5 py-1 rounded-full", isPro ? "bg-primary/15 text-primary" : "bg-white/8 text-muted")}>
            {isPro ? "Pro" : "Free"}
          </span>
        </div>

        {subscription?.currentPeriodEnd && (
          <p className="text-xs text-muted mb-4">
            {subscription.cancelAtPeriodEnd ? "Отменена. Действует до " : "Следующее списание "}
            {format(new Date(subscription.currentPeriodEnd), "d MMMM yyyy", { locale: ru })}
          </p>
        )}

        {!isPro && (
          <>
            <p className="text-sm text-muted mb-4">Перейдите на Pro чтобы разблокировать все возможности HabitForge.</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                className="bg-primary text-white gap-2"
                onClick={() => checkout.mutate()}
                disabled={checkout.isPending}
              >
                {checkout.isPending ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                Перейти на Pro — 499₽/мес
              </Button>
              <Button variant="outline" className="border-border text-muted" onClick={() => router.push("/upgrade")}>
                Подробнее
              </Button>
            </div>
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
            onClick={() => portal.mutate()}
            disabled={portal.isPending}
          >
            {portal.isPending ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
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
