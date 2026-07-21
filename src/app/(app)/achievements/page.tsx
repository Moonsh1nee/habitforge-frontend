"use client";

import { useState } from "react";
import { Trophy, Lock, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useAchievements, useXP } from "@/lib/hooks/useXP";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListSkeleton } from "@/components/shared/LoadingSkeleton";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { staggerContainer } from "@/lib/constants/motionVariants";
import { cn } from "@/lib/utils";
import type { Achievement, AchievementCategory } from "@/types";

const CATEGORY_LABELS: Record<AchievementCategory | "all", string> = {
  all: "Все",
  habits: "Привычки",
  tasks: "Задачи",
  streaks: "Серии",
  health: "Здоровье",
  finance: "Финансы",
  social: "Социальные",
  milestones: "Вехи",
};

const FILTER_TABS = [
  { value: "all", label: "Все" },
  { value: "unlocked", label: "Получены" },
  { value: "locked", label: "Заблокированы" },
];

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const pct =
    achievement.progress !== null && achievement.progressTarget
      ? Math.min(Math.round((achievement.progress / achievement.progressTarget) * 100), 100)
      : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className={cn(
        "glass p-4 flex items-start gap-4 transition-all",
        achievement.isUnlocked
          ? "border-primary/20 bg-primary/3"
          : "opacity-60"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 relative",
        achievement.isUnlocked ? "bg-primary/15" : "bg-white/5"
      )}>
        {achievement.isUnlocked ? achievement.icon : <Lock size={18} className="text-muted" />}
        {achievement.isUnlocked && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
            <Star size={9} className="text-white fill-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={cn("font-semibold text-sm", achievement.isUnlocked ? "text-text" : "text-muted")}>
              {achievement.title}
            </p>
            <p className="text-xs text-muted mt-0.5 line-clamp-2">{achievement.description}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star size={11} className="text-warning fill-warning" />
            <span className="text-xs text-warning font-semibold">{achievement.xpReward}</span>
          </div>
        </div>

        {achievement.isUnlocked && achievement.unlockedAt && (
          <p className="text-[10px] text-muted/60 mt-2">
            {format(new Date(achievement.unlockedAt), "d MMM yyyy", { locale: ru })}
          </p>
        )}

        {!achievement.isUnlocked && pct !== null && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/50 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-muted tabular-nums">
              {achievement.progress}/{achievement.progressTarget}
            </span>
          </div>
        )}
      </div>

      {!achievement.isUnlocked && pct !== null && pct > 0 && (
        <ProgressRing value={pct} size={36} strokeWidth={3} color="var(--color-primary)" />
      )}
    </motion.div>
  );
}

export default function AchievementsPage() {
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [category, setCategory] = useState<"all" | AchievementCategory>("all");

  const { data: achievements, isLoading } = useAchievements();
  const { data: xp } = useXP();

  const allItems: Achievement[] = [
    ...(achievements?.unlocked ?? []).map((a) => ({ ...a, isUnlocked: true })),
    ...(achievements?.locked ?? []).map((a) => ({ ...a, isUnlocked: false })),
  ];

  const filtered = allItems
    .filter((a) => {
      if (filter === "unlocked") return a.isUnlocked;
      if (filter === "locked") return !a.isUnlocked;
      return true;
    })
    .filter((a) => category === "all" || a.category === category);

  const unlockedCount = achievements?.unlocked.length ?? 0;
  const totalCount = allItems.length;

  const categoryTabs = (Object.keys(CATEGORY_LABELS) as Array<"all" | AchievementCategory>)
    .filter((k) => k === "all" || allItems.some((a) => a.category === k))
    .map((k) => ({ value: k, label: CATEGORY_LABELS[k] }));

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Достижения"
        subtitle={`${unlockedCount} из ${totalCount} получено`}
      />

      {xp && (
        <div className="glass p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Trophy size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text">Уровень {xp.level}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${xp.levelProgressPct}%` }}
                />
              </div>
              <span className="text-xs text-muted tabular-nums">
                {xp.xpInCurrentLevel} / {xp.xpToNextLevel} XP
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-text tabular-nums">{xp.totalXp}</p>
            <p className="text-xs text-muted">Всего XP</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <FilterTabs value={filter} onChange={(v) => setFilter(v as typeof filter)} options={FILTER_TABS} />
        {categoryTabs.length > 1 && (
          <FilterTabs
            value={category}
            onChange={(v) => setCategory(v as typeof category)}
            options={categoryTabs}
          />
        )}
      </div>

      {isLoading ? (
        <ListSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Trophy />}
          title="Нет достижений"
          description="Выполняйте задачи и отслеживайте привычки чтобы получать достижения"
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((a) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
