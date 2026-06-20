"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Shield, TrendingUp, Activity,
  Search, Loader2, Trash2, Crown, UserCheck, UserX, LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import { useAuthStore } from "@/lib/stores/authStore";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

// ─── Stat block ───────────────────────────────────────────────────────────────

function StatBlock({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <GlassCard className="p-4 flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-text tabular-nums">
          <AnimatedNumber value={value} decimals={0} />
        </p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </GlassCard>
  );
}

// ─── User row ────────────────────────────────────────────────────────────────

function UserRow({ user }: { user: User }) {
  const qc = useQueryClient();

  const update = useMutation({
    mutationFn: (payload: { plan?: "free" | "pro"; role?: "user" | "admin"; is_active?: boolean }) =>
      adminApi.updateUser(user.id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Пользователь обновлён");
    },
    onError: () => toast.error("Ошибка обновления"),
  });

  const remove = useMutation({
    mutationFn: () => adminApi.deleteUser(user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Пользователь удалён");
    },
    onError: () => toast.error("Ошибка удаления"),
  });

  const isPending = update.isPending || remove.isPending;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
        {user.firstName?.[0]?.toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">
          {user.firstName} {user.lastName ?? ""}
          {user.role === "admin" && (
            <span className="ml-1.5 text-[10px] bg-danger/15 text-danger px-1.5 py-0.5 rounded-full font-semibold">admin</span>
          )}
        </p>
        <p className="text-xs text-muted truncate">{user.email ?? user.username}</p>
      </div>

      <span className={cn(
        "text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
        user.plan === "pro" ? "bg-primary/15 text-primary" : "bg-white/8 text-muted"
      )}>
        {user.plan?.toUpperCase() ?? "FREE"}
      </span>

      <span
        className={cn("w-2 h-2 rounded-full shrink-0", user.isActive ? "bg-success" : "bg-muted")}
        title={user.isActive ? "Активен" : "Заблокирован"}
      />

      <div className="flex items-center gap-1 shrink-0">
        {isPending ? (
          <Loader2 size={14} className="animate-spin text-muted" />
        ) : (
          <>
            <button
              onClick={() => update.mutate({ plan: user.plan === "pro" ? "free" : "pro" })}
              title={user.plan === "pro" ? "Снять Pro" : "Выдать Pro"}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-lg transition-colors",
                user.plan === "pro"
                  ? "text-primary bg-primary/10 hover:bg-primary/20"
                  : "text-muted hover:text-primary hover:bg-primary/10"
              )}
            >
              <Crown size={13} />
            </button>

            <button
              onClick={() => update.mutate({ is_active: !user.isActive })}
              title={user.isActive ? "Заблокировать" : "Разблокировать"}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-warning hover:bg-warning/10 transition-colors"
            >
              {user.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
            </button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                    <Trash2 size={13} />
                  </button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Все данные {user.firstName} будут удалены безвозвратно.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => remove.mutate()}
                    className="bg-danger text-white hover:bg-danger/80"
                  >
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto">
            <Shield size={28} className="text-danger" />
          </div>
          <h1 className="text-xl font-bold text-text">Доступ запрещён</h1>
          <p className="text-sm text-muted">Эта страница доступна только администраторам.</p>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="border-border">
            На главную
          </Button>
        </div>
      </div>
    );
  }

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.getStats,
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users", search, page],
    queryFn: () => adminApi.getUsers({ skip: page * limit, limit, search: search || undefined }),
  });

  const users = usersData?.items ?? [];
  const total = usersData?.total ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Администрирование"
        subtitle="Управление пользователями и метрики"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="border-border text-muted hover:text-text gap-1.5"
          >
            <LogOut size={14} />
            В приложение
          </Button>
        }
      />

      {stats && (
        <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <motion.div variants={item}><StatBlock icon={Users} label="Всего пользователей" value={stats.total_users} color="bg-primary" /></motion.div>
          <motion.div variants={item}><StatBlock icon={Crown} label="Pro-пользователей" value={stats.pro_users} color="bg-warning/80" /></motion.div>
          <motion.div variants={item}><StatBlock icon={Activity} label="Активны сегодня" value={stats.active_today} color="bg-success" /></motion.div>
          <motion.div variants={item}><StatBlock icon={TrendingUp} label="Новых за неделю" value={stats.new_this_week} color="bg-accent" /></motion.div>
        </motion.div>
      )}

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Поиск по email или юзернейму..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 bg-transparent"
            />
          </div>
          <p className="text-xs text-muted shrink-0">{total} пользователей</p>
        </div>

        <div className="px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-muted" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted text-center py-10">Ничего не найдено</p>
          ) : (
            users.map((u) => <UserRow key={u.id} user={u} />)
          )}
        </div>

        {total > limit && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="border-border">
              Назад
            </Button>
            <p className="text-xs text-muted">
              {page * limit + 1}–{Math.min((page + 1) * limit, total)} из {total}
            </p>
            <Button variant="outline" size="sm" disabled={(page + 1) * limit >= total} onClick={() => setPage((p) => p + 1)} className="border-border">
              Вперёд
            </Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
