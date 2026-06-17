"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LayoutDashboard, CheckSquare, Repeat2, Wallet, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardToday } from "@/lib/hooks/useDashboard";

const NAV = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "Главная" },
  { href: "/tasks",      icon: CheckSquare,      label: "Задачи"  },
  { href: "/habits",     icon: Repeat2,          label: "Привычки"},
  { href: "/finance",    icon: Wallet,           label: "Финансы" },
  { href: "/journal",    icon: BookOpen,         label: "Дневник" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: today } = useDashboardToday();
  const overdueCount = today?.tasks_overdue?.length ?? 0;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border">
      <div className="flex items-stretch h-16">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          const showBadge = href === "/tasks" && overdueCount > 0;

          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative"
            >
              {active && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <div className="relative">
                <Icon
                  size={21}
                  className={cn(
                    "transition-colors duration-200",
                    active ? "text-primary" : "text-muted"
                  )}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-danger text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                    {overdueCount > 9 ? "9+" : overdueCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  active ? "text-primary" : "text-muted"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-safe-bottom bg-background/90" />
    </nav>
  );
}
