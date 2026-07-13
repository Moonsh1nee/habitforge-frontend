"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckSquare, Repeat2, Wallet, Dumbbell, Apple, BookOpen,
  ShoppingCart, BarChart2, Zap, Check, ArrowRight, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/authStore";
import { useOnboardingStore, type AppModule } from "@/lib/stores/onboardingStore";
import { usersApi } from "@/lib/api/users";
import { Button } from "@/components/ui/button";

// ─── Module config ────────────────────────────────────────────────────────────

const MODULES: { id: AppModule; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { id: "tasks",     label: "Задачи",     desc: "Проекты, теги, дедлайны",       icon: CheckSquare,  color: "#7c3aed" },
  { id: "habits",    label: "Привычки",   desc: "Стрики, хитмап, заморозки",     icon: Repeat2,      color: "#06b6d4" },
  { id: "finance",   label: "Финансы",    desc: "Доходы, расходы, категории",    icon: Wallet,       color: "#22c55e" },
  { id: "workouts",  label: "Тренировки", desc: "Планы упражнений, логи",        icon: Dumbbell,     color: "#f59e0b" },
  { id: "nutrition", label: "Питание",    desc: "Калории, макросы, план",        icon: Apple,        color: "#ef4444" },
  { id: "journal",   label: "Дневник",    desc: "Настроение, сон, заметки",      icon: BookOpen,     color: "#8b5cf6" },
  { id: "shopping",  label: "Покупки",    desc: "Списки покупок + финансы",      icon: ShoppingCart, color: "#0ea5e9" },
  { id: "stats",     label: "Аналитика",  desc: "Графики по всем модулям",       icon: BarChart2,    color: "#ec4899" },
];

// ─── Step 1 — Welcome ─────────────────────────────────────────────────────────

function StepWelcome({ name, onNext }: { name: string; onNext: () => void }) {
  useEffect(() => {
    const t = setTimeout(onNext, 2000);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30">
        <Zap size={36} className="text-white" />
      </div>
      <h1 className="text-3xl font-extrabold text-text mb-3">
        Привет, {name}! 👋
      </h1>
      <p className="text-muted text-base max-w-sm mx-auto">
        Давай настроим HabitForge под тебя — займёт не больше минуты
      </p>
      <div className="flex justify-center gap-1.5 mt-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? "w-6 bg-primary" : "w-2 bg-white/20"}`} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Step 2 — Module picker ───────────────────────────────────────────────────

function StepModules({
  selected,
  onToggle,
  onNext,
  loading,
}: {
  selected: Set<AppModule>;
  onToggle: (id: AppModule) => void;
  onNext: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text mb-2">Что будешь отслеживать?</h2>
        <p className="text-muted text-sm">Выбери нужные разделы. Остальное можно включить позже в настройках.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {MODULES.map(({ id, label, desc, icon: Icon, color }) => {
          const active = selected.has(id);
          return (
            <button
              key={id}
              onClick={() => onToggle(id)}
              className={`
                relative p-4 rounded-2xl border text-left transition-all duration-200
                ${active
                  ? "border-primary/40 bg-primary/8 shadow-md shadow-primary/10"
                  : "border-border bg-white/3 hover:bg-white/6 hover:border-white/15"
                }
              `}
            >
              {active && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check size={9} className="text-white" />
                </div>
              )}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-sm font-semibold text-text leading-tight">{label}</p>
              <p className="text-[11px] text-muted mt-0.5 leading-snug">{desc}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          Выбрано: <span className="text-text font-medium">{selected.size}</span> из {MODULES.length}
        </p>
        <Button
          onClick={onNext}
          disabled={selected.size === 0 || loading}
          className="gradient-primary text-white gap-2 px-6"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
          Готово
        </Button>
      </div>

      <div className="flex justify-center gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === 1 ? "w-6 bg-primary" : "w-2 bg-white/20"}`} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Step 3 — Done ────────────────────────────────────────────────────────────

function StepDone({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-20 h-20 rounded-full bg-success/15 border-2 border-success/30 flex items-center justify-center mx-auto mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
      >
        <Check size={36} className="text-success" />
      </motion.div>
      <h2 className="text-3xl font-extrabold text-text mb-3">
        Всё готово, {name}!
      </h2>
      <p className="text-muted mb-8 max-w-xs mx-auto">
        Твой HabitForge настроен. Время начинать!
      </p>
      <Button onClick={onOpen} className="gradient-primary text-white gap-2 px-8 py-3 text-base">
        Открыть дашборд
        <ArrowRight size={16} />
      </Button>

      <div className="flex justify-center gap-1.5 mt-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === 2 ? "w-6 bg-success" : "w-2 bg-white/20"}`} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { setModules } = useOnboardingStore();

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [selected, setSelected] = useState<Set<AppModule>>(
    new Set(["tasks", "habits", "finance", "workouts", "nutrition", "journal", "shopping", "stats"])
  );
  const [loading, setLoading] = useState(false);

  // Already completed onboarding → go to dashboard
  useEffect(() => {
    if (user?.onboardingCompleted) router.replace("/dashboard");
  }, [user, router]);

  // Not authenticated → go to login
  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  const toggleModule = (id: AppModule) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const updated = await usersApi.updateMe({ onboardingCompleted: true });
      setUser(updated);
      setModules([...selected] as AppModule[]);
      setStep(2);
    } catch {
      toast.error("Ошибка сохранения настроек");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4">
      {/* Mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", top: "5%", left: "10%", animation: "mesh-drift 20s ease-in-out infinite" }} />
        <div className="absolute w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", bottom: "10%", right: "10%", animation: "mesh-drift 25s ease-in-out infinite reverse" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepWelcome key="welcome" name={user.firstName} onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <StepModules
              key="modules"
              selected={selected}
              onToggle={toggleModule}
              onNext={handleFinish}
              loading={loading}
            />
          )}
          {step === 2 && (
            <StepDone key="done" name={user.firstName} onOpen={() => router.push("/dashboard")} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
