"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Zap, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { PricingCard } from "@/components/billing/PricingCard";
import { FeatureComparisonTable } from "@/components/billing/FeatureComparisonTable";
import {
  FEATURES, STEPS, FREE_FEATURES, PRO_FEATURES, SOCIAL_PROOF, stagger, fadeUp,
} from "@/lib/data/landing";

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-6 md:px-12 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <span className="font-bold text-base text-primary">HabitForge</span>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-sm text-muted hover:text-text transition-colors px-3 py-1.5">
          Войти
        </Link>
        <Link href="/register"
          className="text-sm font-medium px-4 py-1.5 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity">
          Начать бесплатно
        </Link>
      </div>
    </header>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  if (user) return null;

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-14 overflow-hidden">
        <motion.div
          className="relative z-10 max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <Zap size={13} />
            Всё для роста — в одном месте
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-text leading-tight mb-6">
            Стань лучшей версией<br />
            <span className="text-primary">себя каждый день</span>
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto mb-10">
            HabitForge объединяет задачи, привычки, финансы, тренировки и питание в одном приложении. Больше никаких переключений между десятками сервисов.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-semibold text-base hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
              Начать бесплатно
              <ArrowRight size={16} />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border text-text text-base font-medium hover:bg-white/5 transition-colors">
              Уже есть аккаунт
            </Link>
          </div>
          <p className="text-xs text-muted mt-5">Бесплатно навсегда. Без кредитной карты.</p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1 h-1.5 rounded-full bg-muted"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-text mb-3">Всё что нужно — уже внутри</h2>
          <p className="text-muted max-w-lg mx-auto">8 модулей, которые работают вместе и усиливают друг друга</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {FEATURES.map(({ icon: Icon, label, desc, color }) => (
            <motion.div key={label} variants={fadeUp}
              className="glass p-5 rounded-2xl hover:scale-[1.02] transition-transform cursor-default">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}18` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <p className="font-semibold text-text text-sm mb-1">{label}</p>
              <p className="text-xs text-muted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-6 md:px-12 bg-white/2 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-text mb-3">Как это работает</h2>
            <p className="text-muted">Три шага до системной жизни</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {STEPS.map(({ n, title, desc }) => (
              <motion.div key={n} variants={fadeUp} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold shadow-lg shadow-primary/25">
                  {n}
                </div>
                <h3 className="font-bold text-text text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="py-16 px-6 md:px-12 max-w-3xl mx-auto text-center">
        <motion.div
          className="glass p-8 rounded-3xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-6 flex-wrap text-center">
            {SOCIAL_PROOF.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 min-w-25">
                <span className="text-3xl font-extrabold text-primary">{value}</span>
                <span className="text-xs text-muted">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-text mb-3">Простые цены</h2>
          <p className="text-muted">Начни бесплатно, обновись когда нужно</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <PricingCard plan="free" price="0₽" period="/всегда" features={FREE_FEATURES} />
          <PricingCard plan="pro" price="499₽" features={PRO_FEATURES} highlighted />
        </motion.div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-center text-sm font-medium text-muted mb-5">Сравнение тарифов</h3>
          <FeatureComparisonTable />
        </motion.div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 px-6 text-center">
        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-text mb-4">
            Начни строить систему<br />
            <span className="text-primary">прямо сейчас</span>
          </h2>
          <p className="text-muted mb-8">Регистрация занимает 30 секунд. Никакой кредитной карты.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-xl shadow-primary/30">
            Создать аккаунт бесплатно
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-bold text-sm text-primary">HabitForge</span>
        </div>
        <p className="text-xs text-muted">© 2025 HabitForge. Все права защищены.</p>
      </footer>
    </div>
  );
}
