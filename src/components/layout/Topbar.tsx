"use client";

import { Bell, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useLogout } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-surface/20 backdrop-blur-xl shrink-0">
      <div className="text-sm text-muted">
        {formatDate(new Date(), "EEEE, d MMMM yyyy")}
      </div>

      <div className="flex items-center gap-3">
        <button className="text-muted hover:text-text transition-colors p-1.5 rounded-lg hover:bg-white/5">
          <Bell size={18} />
        </button>

        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">
              {user.firstName?.[0]?.toUpperCase() ?? "U"}
            </div>
            <span className="text-sm text-text/80 hidden sm:block">
              {user.firstName}
            </span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout.mutate()}
          className="text-muted hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
