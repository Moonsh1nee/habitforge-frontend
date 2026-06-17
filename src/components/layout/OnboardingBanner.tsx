"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckSquare, Repeat2, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "habitforge-onboarding-dismissed";

const STEPS = [
  {
    icon: CheckSquare,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Создайте задачу",
    desc: "Запланируйте дела на сегодня",
    href: "/tasks",
    cta: "К задачам",
  },
  {
    icon: Repeat2,
    color: "text-accent",
    bg: "bg-accent/10",
    title: "Добавьте привычку",
    desc: "Отслеживайте ежедневные ритуалы",
    href: "/habits",
    cta: "К привычкам",
  },
  {
    icon: BookOpen,
    color: "text-warning",
    bg: "bg-warning/10",
    title: "Запишите в дневник",
    desc: "Фиксируйте настроение и мысли",
    href: "/journal",
    cta: "К дневнику",
  },
];

interface OnboardingBannerProps {
  show: boolean;
}

export function OnboardingBanner({ show }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setDismissed(!!stored);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  const visible = show && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="glass-elevated rounded-2xl p-5 relative overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />

          <button
            onClick={dismiss}
            aria-label="Закрыть"
            className="absolute top-3 right-3 text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X size={15} />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Добро пожаловать в HabitForge!</p>
              <p className="text-xs text-muted">Начните с трёх простых шагов</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STEPS.map(({ icon: Icon, color, bg, title, desc, href, cta }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="glass rounded-xl p-3.5 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={14} className={color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text leading-tight">{title}</p>
                    <p className="text-[11px] text-muted leading-tight mt-0.5">{desc}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(href)}
                  className="w-full text-xs h-7 border-border/60 hover:border-primary/40 hover:text-primary transition-all"
                >
                  {cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
