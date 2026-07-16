"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, User, LogOut, ChevronDown, Keyboard } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuthStore } from "@/lib/stores/authStore";
import { useLogout } from "@/lib/hooks/useAuth";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { mediaUrl } from "@/lib/api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Keyboard shortcuts hint ──────────────────────────────────────────────────

const SHORTCUTS = [
  { keys: ["N"], description: "Новая задача" },
  { keys: ["H"], description: "Новая привычка" },
  { keys: ["Ctrl", "K"], description: "Поиск" },
  { keys: ["?"], description: "Горячие клавиши" },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[1.6rem] h-6 px-1.5 rounded-md text-xs font-mono bg-white/8 border border-white/15 text-muted">
      {children}
    </kbd>
  );
}

function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.code === "Slash" && e.shiftKey) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Горячие клавиши"
        className="p-1.5 text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors"
      >
        <Keyboard size={16} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Горячие клавиши</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            {SHORTCUTS.map(({ keys, description }) => (
              <div key={description} className="flex items-center justify-between">
                <span className="text-sm text-muted">{description}</span>
                <div className="flex items-center gap-1">
                  {keys.map((k, i) => (
                    <span key={k} className="flex items-center gap-1">
                      {i > 0 && <span className="text-muted/40 text-xs">+</span>}
                      <Kbd>{k}</Kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const router = useRouter();

  const dateStr = format(new Date(), "EEEE, d MMMM", { locale: ru });
  const dateCap = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-surface/20 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Открыть меню"
        >
          <Menu size={20} />
        </button>

        <span className="text-sm text-muted hidden sm:block">{dateCap}</span>
      </div>

      <div className="flex items-center gap-2">
        <GlobalSearch />
        <ShortcutsHelp />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-white/5 transition-colors outline-none">
                  {mediaUrl(user.avatarUrl) ? (
                    <img
                      src={mediaUrl(user.avatarUrl)!}
                      alt={user.firstName ?? "avatar"}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      {user.firstName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span className="text-sm text-text/80 hidden sm:block">{user.firstName}</span>
                  <ChevronDown size={13} className="text-muted hidden sm:block" />
                </button>
              }
            />

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-muted/70 text-xs font-normal truncate px-3 py-2">
                  {user.email ?? user.username ?? "—"}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer gap-2 px-3 py-2"
              >
                <User size={14} />
                Профиль
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout.mutate()}
                variant="destructive"
                className="cursor-pointer gap-2 px-3 py-2"
              >
                <LogOut size={14} />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
