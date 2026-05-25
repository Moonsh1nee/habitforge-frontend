"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Lock, MessageSquare, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { usersApi } from "@/lib/api/users";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

function ProfileForm({ user }: { user: UserType }) {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const update = useMutation({
    mutationFn: (payload: Partial<UserType>) => usersApi.updateMe(payload),
    onSuccess: (data) => {
      setUser(data);
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Профиль обновлён");
    },
    onError: () => toast.error("Ошибка обновления профиля"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    update.mutate({
      firstName: fd.get("firstName") as string,
      lastName: fd.get("lastName") as string,
      username: fd.get("username") as string,
      bio: fd.get("bio") as string,
      timezone: fd.get("timezone") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-text/80">Имя</Label>
          <Input
            name="firstName"
            defaultValue={user.firstName}
            className="bg-white/5 border-border text-text"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-text/80">Фамилия</Label>
          <Input
            name="lastName"
            defaultValue={user.lastName ?? ""}
            className="bg-white/5 border-border text-text"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-text/80">Юзернейм</Label>
        <Input
          name="username"
          defaultValue={user.username}
          className="bg-white/5 border-border text-text"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-text/80">Email</Label>
        <Input
          value={user.email}
          disabled
          className="bg-white/5 border-border text-muted opacity-60 cursor-not-allowed"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-text/80">О себе</Label>
        <Textarea
          name="bio"
          defaultValue={user.bio ?? ""}
          placeholder="Расскажите о себе..."
          className="bg-white/5 border-border text-text resize-none"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-text/80">Часовой пояс</Label>
        <Input
          name="timezone"
          defaultValue={user.timezone ?? "Europe/Moscow"}
          placeholder="Europe/Moscow"
          className="bg-white/5 border-border text-text"
        />
      </div>

      <Button
        type="submit"
        disabled={update.isPending}
        className="gradient-primary text-white"
      >
        {update.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
        Сохранить
      </Button>
    </form>
  );
}

function PasswordForm() {
  const change = useMutation({
    mutationFn: ({
      current,
      next,
    }: {
      current: string;
      next: string;
    }) => usersApi.changePassword(current, next),
    onSuccess: () => toast.success("Пароль изменён"),
    onError: () => toast.error("Неверный текущий пароль"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const current = fd.get("current") as string;
    const next = fd.get("new") as string;
    const confirm = fd.get("confirm") as string;
    if (next !== confirm) {
      toast.error("Пароли не совпадают");
      return;
    }
    change.mutate({ current, next });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { name: "current", label: "Текущий пароль" },
        { name: "new", label: "Новый пароль" },
        { name: "confirm", label: "Подтвердите пароль" },
      ].map(({ name, label }) => (
        <div key={name} className="space-y-2">
          <Label className="text-text/80">{label}</Label>
          <Input
            name={name}
            type="password"
            placeholder="••••••••"
            className="bg-white/5 border-border text-text"
          />
        </div>
      ))}
      <Button
        type="submit"
        disabled={change.isPending}
        className="gradient-primary text-white"
      >
        {change.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
        Изменить пароль
      </Button>
    </form>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold">
          {user.firstName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">{user.firstName}</h1>
          <p className="text-sm text-muted">@{user.username}</p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-white/5 border border-border">
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <User size={14} />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Lock size={14} />
            Пароль
          </TabsTrigger>
          <TabsTrigger value="telegram" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <MessageSquare size={14} />
            Telegram
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <GlassCard>
            <ProfileForm user={user} />
          </GlassCard>
        </TabsContent>

        <TabsContent value="password" className="mt-4">
          <GlassCard>
            <PasswordForm />
          </GlassCard>
        </TabsContent>

        <TabsContent value="telegram" className="mt-4">
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#229ED9]/20 flex items-center justify-center">
                <MessageSquare size={20} className="text-[#229ED9]" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Telegram-бот</h3>
                <p className="text-xs text-muted">Получайте напоминания и статистику</p>
              </div>
            </div>
            <p className="text-sm text-muted mb-4">
              Привяжите Telegram-аккаунт чтобы получать напоминания о привычках и задачах прямо в мессенджере.
            </p>
            <Button
              variant="outline"
              className="border-[#229ED9]/40 text-[#229ED9] hover:bg-[#229ED9]/10"
              onClick={() => toast.info("Функция в разработке")}
            >
              Привязать Telegram
            </Button>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
