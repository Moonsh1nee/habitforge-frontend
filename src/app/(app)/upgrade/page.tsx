"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Shield, Zap, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { PricingCard } from "@/components/billing/PricingCard";
import { FeatureComparisonTable } from "@/components/billing/FeatureComparisonTable";
import { GlassCard } from "@/components/shared/GlassCard";
import { usePlan } from "@/lib/hooks/usePlan";

const FREE_FEATURES = [
  { label: "До 5 привычек", included: true },
  { label: "До 3 проектов", included: true },
  { label: "Аналитика за 7 дней", included: true },
  { label: "Задачи и журнал", included: true },
  { label: "Тренировки и питание", included: true },
  { label: "Telegram-бот", included: true },
  { label: "Годовой хитмап", included: false },
  { label: "Шаблоны программ", included: false },
];

const PRO_FEATURES = [
  { label: "Неограниченные привычки", included: true },
  { label: "Неограниченные проекты", included: true },
  { label: "Аналитика за 90 дней", included: true },
  { label: "Задачи и журнал", included: true },
  { label: "Тренировки и питание", included: true },
  { label: "Telegram-бот", included: true },
  { label: "Годовой хитмап", included: true },
  { label: "Шаблоны программ", included: true },
];

const PERKS = [
  { icon: BarChart2, label: "Глубокая аналитика", desc: "История за 90 дней, годовые хитмапы, кросс-корреляции" },
  { icon: Sparkles, label: "Шаблоны программ", desc: "Готовые планы привычек, тренировок и питания — применяй в один клик" },
  { icon: Shield, label: "Приоритет поддержки", desc: "Ответ в течение 24 часов, прямой доступ к команде" },
  { icon: Zap, label: "Всё без лимитов", desc: "Неограниченные привычки, проекты, теги и цели" },
];

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function UpgradePage() {
  const { isPro } = usePlan();
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.info("Оплата через Stripe скоро будет доступна — следите за обновлениями!");
    setUpgradeLoading(false);
  };

  return (
    <div className="max-w-4xl space-y-10">
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
          <Sparkles size={14} />
          HabitForge Pro
        </div>
        <h1 className="text-3xl font-bold text-text">
          Разблокируй весь потенциал
        </h1>
        <p className="text-muted max-w-md mx-auto">
          Неограниченные возможности и глубокая аналитика — для тех, кто серьёзно относится к своим целям.
        </p>
      </div>

      {isPro && (
        <div className="glass p-4 text-center text-sm text-success font-medium rounded-2xl border border-success/20">
          У вас активен Pro-план — спасибо за поддержку!
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PricingCard plan="free" price="0₽" period="/всегда" features={FREE_FEATURES} />
        <PricingCard
          plan="pro"
          price="499₽"
          features={PRO_FEATURES}
          highlighted
          onUpgrade={handleUpgrade}
          isLoading={upgradeLoading}
        />
      </div>

      {/* Pro perks */}
      <motion.div variants={container} initial="hidden" animate="visible">
        <h2 className="text-lg font-bold text-text mb-4 text-center">Что входит в Pro</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PERKS.map((perk) => (
            <motion.div key={perk.label} variants={item}>
              <GlassCard className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <perk.icon size={17} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">{perk.label}</p>
                  <p className="text-xs text-muted mt-0.5">{perk.desc}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Comparison table */}
      <div>
        <h2 className="text-lg font-bold text-text mb-4 text-center">Сравнение тарифов</h2>
        <FeatureComparisonTable />
      </div>

      <p className="text-center text-xs text-muted pb-4">
        Нет скрытых платежей. Отмена в любое время. Ваши данные всегда остаются вашими.
      </p>
    </div>
  );
}
