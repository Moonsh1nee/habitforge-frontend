"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { usePomodoroStore, initPomodoroSessionCount } from "@/lib/stores/pomodoroStore";
import { useTasks } from "@/lib/hooks/useTasks";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 523;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

// Renders in layout once — owns the tick interval and notifications
export function PomodoroTicker() {
  const { isRunning, tick, secondsLeft, phase } = usePomodoroStore();
  const didNotify = useRef(false);

  useEffect(() => {
    initPomodoroSessionCount();
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [isRunning, tick]);

  useEffect(() => {
    if (secondsLeft === 0 && !didNotify.current) {
      didNotify.current = true;
      beep();
      toast.success(
        phase === "work" ? "Перерыв! Заслужен ☕" : "Пора работать! 🍅",
        { duration: 5000 }
      );
    }
    if (secondsLeft > 0) didNotify.current = false;
  }, [secondsLeft, phase]);

  return null;
}

// Sidebar-embedded section — compact header + expandable controls
export function PomodoroSidebarSection() {
  const [expanded, setExpanded] = useState(false);
  const { phase, secondsLeft, isRunning, sessionCount, selectedTaskId, start, pause, reset, setTask } =
    usePomodoroStore();
  const { data } = useTasks({ completed: false, limit: 50 });
  const activeTasks = data?.items ?? [];

  const isWork = phase !== "break";
  const phaseLabel = phase === "break" ? "Перерыв ☕" : "Фокус 🍅";

  return (
    <div className="border-t border-border">
      {/* Compact header — always visible */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 transition-all",
            isRunning && isWork
              ? "gradient-primary"
              : isRunning
              ? "bg-success/20"
              : "bg-white/5"
          )}
        >
          {isWork ? "🍅" : "☕"}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 flex items-center justify-between min-w-0 text-left"
        >
          <p className="text-xs font-medium text-text truncate">{phaseLabel}</p>
          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            <span
              className={cn(
                "text-xs font-mono tabular-nums",
                isRunning ? (isWork ? "text-primary" : "text-success") : "text-muted"
              )}
            >
              {formatTime(secondsLeft)}
            </span>
            {isRunning && (
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
            )}
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={11} className="text-muted" />
            </motion.span>
          </div>
        </button>

        {/* Quick play/pause */}
        <button
          onClick={isRunning ? pause : start}
          aria-label={isRunning ? "Пауза" : "Старт"}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
            isRunning
              ? "bg-primary/15 text-primary hover:bg-primary/25"
              : "bg-white/5 text-muted hover:text-primary hover:bg-primary/10"
          )}
        >
          {isRunning ? <Pause size={12} /> : <Play size={12} />}
        </button>
      </div>

      {/* Expanded controls */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="pomodoro-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              <Select
                value={selectedTaskId ?? "none"}
                onValueChange={(v) => setTask(!v || v === "none" ? null : v)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="— Без задачи" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Без задачи</SelectItem>
                  {activeTasks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <button
                  onClick={isRunning ? pause : start}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                    isWork
                      ? "gradient-primary text-white"
                      : "bg-success/20 text-success border border-success/30 hover:bg-success/30"
                  )}
                >
                  {isRunning ? <Pause size={11} /> : <Play size={11} />}
                  {isRunning ? "Пауза" : phase === "idle" ? "Старт" : "Продолжить"}
                </button>
                <button
                  onClick={reset}
                  aria-label="Сброс"
                  className="w-7 h-7 rounded-lg border border-border text-muted hover:text-text hover:border-primary/40 flex items-center justify-center transition-all"
                >
                  <RotateCcw size={11} />
                </button>
              </div>

              <p className="text-[10px] text-muted text-center">
                🍅 {sessionCount} сессий сегодня
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Legacy export — no longer used, kept to avoid broken imports
export function PomodoroWidget() {
  return null;
}
