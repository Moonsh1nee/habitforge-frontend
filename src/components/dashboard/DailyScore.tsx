"use client";

import { useMemo, useEffect } from "react";
import { motion, useSpring, animate, useMotionValue, useTransform } from "motion/react";
import { Sparkles } from "lucide-react";
import type { TodayDashboard } from "@/types";

interface DailyScoreProps {
  today: TodayDashboard;
}

const SIZE = 140;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

function getMessage(score: number, remaining: number): string {
  if (score === 100) return "Идеальный день! 🏆";
  if (score >= 80) return "Отличная работа!";
  if (score >= 60) return "Хорошее начало";
  if (score >= 40) return `Осталось ${remaining} привычек`;
  if (score > 0) return "Время действовать";
  return "Начнём день?";
}

function getColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 50) return "#7c3aed";
  if (score >= 25) return "#f59e0b";
  return "#64748b";
}

export function DailyScore({ today }: DailyScoreProps) {
  const totalHabits = today.habits.length;
  const doneHabits = today.habits.filter((h) => h.completed_today).length;
  const pendingTasks = today.tasks_pending.length + today.tasks_overdue.length;

  const score = useMemo(() => {
    if (totalHabits === 0) return pendingTasks === 0 ? 100 : 0;
    return Math.round((doneHabits / totalHabits) * 100);
  }, [doneHabits, totalHabits, pendingTasks]);

  const color = getColor(score);
  const message = getMessage(score, totalHabits - doneHabits);

  // Animate the ring
  const progress = useMotionValue(0);
  const strokeDash = useTransform(
    progress,
    [0, 100],
    [CIRCUMFERENCE, CIRCUMFERENCE - (CIRCUMFERENCE * score) / 100]
  );

  // Animate the number
  const displayNum = useSpring(0, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const ctrl = animate(progress, score, { duration: 1.2, ease: [0.4, 0, 0.2, 1] });
    displayNum.set(score);
    return ctrl.stop;
  }, [score, progress, displayNum]);

  return (
    <div className="glass-elevated p-6 flex flex-col items-center justify-center gap-3 relative overflow-hidden h-full min-h-50">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 opacity-8 rounded-[20px] pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 60%, ${color}40, transparent 70%)` }}
      />

      {/* Ring */}
      <div className="relative shrink-0">
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE}
          />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDash}
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-3xl font-bold tabular-nums leading-none" style={{ color }}>
            {useTransform(displayNum, (v) => `${Math.round(v)}%`)}
          </motion.span>
          <span className="text-[9px] text-muted mt-1 uppercase tracking-widest">сегодня</span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-semibold text-text">{message}</p>
        {totalHabits > 0 && (
          <p className="text-xs text-muted mt-0.5">
            {doneHabits}/{totalHabits} привычек
          </p>
        )}
      </div>

      {score === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-1.5 text-xs text-warning font-medium bg-warning/10 px-3 py-1 rounded-full"
        >
          <Sparkles size={11} />
          Всё выполнено!
        </motion.div>
      )}
    </div>
  );
}
