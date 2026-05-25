"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  CheckSquare,
  Repeat2,
  Dumbbell,
  Apple,
  BookOpen,
  User,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Дашборд" },
  { href: "/tasks", icon: CheckSquare, label: "Задачи" },
  { href: "/habits", icon: Repeat2, label: "Привычки" },
  { href: "/workouts", icon: Dumbbell, label: "Тренировки" },
  { href: "/nutrition", icon: Apple, label: "Питание" },
  { href: "/journal", icon: BookOpen, label: "Дневник" },
  { href: "/profile", icon: User, label: "Профиль" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full flex flex-col border-r border-border bg-surface/30 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-bold text-lg text-gradient">HabitForge</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}>
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
                <span>{label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
