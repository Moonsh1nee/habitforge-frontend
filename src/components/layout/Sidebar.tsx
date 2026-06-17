"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard, CheckSquare, Repeat2, Dumbbell,
  Apple, BookOpen, User, Zap, Wallet, CalendarDays,
  BarChart2, CheckCircle2, ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useDashboardToday } from "@/lib/hooks/useDashboard";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Дашборд" },
  { href: "/tasks", icon: CheckSquare, label: "Задачи" },
  { href: "/calendar", icon: CalendarDays, label: "Календарь" },
  { href: "/habits", icon: Repeat2, label: "Привычки" },
  { href: "/stats", icon: BarChart2, label: "Аналитика" },
  { href: "/workouts", icon: Dumbbell, label: "Тренировки" },
  { href: "/nutrition", icon: Apple, label: "Питание" },
  { href: "/finance", icon: Wallet, label: "Финансы" },
  { href: "/journal", icon: BookOpen, label: "Дневник" },
  { href: "/profile", icon: User, label: "Профиль" },
];

function TodayProgress() {
  const { data: today } = useDashboardToday();
  if (!today) return null;

  const totalHabits = today.habits.length;
  const doneHabits = today.habits.filter((h) => h.completed_today).length;
  const pendingTasks = today.tasks_pending.length + today.tasks_overdue.length;
  const pct = totalHabits > 0 ? Math.round((doneHabits / totalHabits) * 100) : 0;
  const allDone = totalHabits > 0 && doneHabits === totalHabits;

  return (
    <div className="px-4 pb-4 pt-2 border-t border-border space-y-2">
      <p className="text-[10px] text-muted uppercase tracking-wider font-medium px-1">Сегодня</p>

      {/* Habits progress */}
      {totalHabits > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={11} className={allDone ? "text-success" : "text-muted"} />
              <span className="text-xs text-muted">Привычки</span>
            </div>
            <span className={`text-xs font-semibold tabular-nums ${allDone ? "text-success" : "text-text"}`}>
              {doneHabits}/{totalHabits}
            </span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden mx-1">
            <motion.div
              className={`h-full rounded-full ${allDone ? "bg-success" : "gradient-primary"}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      )}

      {/* Pending tasks */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <ListTodo size={11} className="text-muted" />
          <span className="text-xs text-muted">Задач</span>
        </div>
        <span className={`text-xs font-semibold tabular-nums ${pendingTasks > 0 ? "text-warning" : "text-success"}`}>
          {pendingTasks > 0 ? `${pendingTasks} осталось` : "всё готово"}
        </span>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: today } = useDashboardToday();
  const overdueCount = today?.tasks_overdue?.length ?? 0;

  return (
    <>
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-bold text-lg text-gradient">HabitForge</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          const showBadge = href === "/tasks" && overdueCount > 0;
          return (
            <Link key={href} href={href} onClick={onNavigate}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:text-text hover:bg-white/5"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {showBadge && (
                  <span className="text-[10px] font-bold bg-danger text-white rounded-full px-1.5 py-0.5 leading-none tabular-nums">
                    {overdueCount > 9 ? "9+" : overdueCount}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <TodayProgress />
    </>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile — Sheet */}
      <Sheet open={mobileOpen} onOpenChange={(o) => !o && onMobileClose()}>
        <SheetContent
          side="left"
          className="p-0 w-64 bg-background border-border flex flex-col"
        >
          <SidebarContent onNavigate={onMobileClose} />
        </SheetContent>
      </Sheet>

      {/* Desktop — always visible */}
      <aside className="hidden md:flex w-64 h-full flex-col border-r border-border bg-surface/30 backdrop-blur-xl shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
