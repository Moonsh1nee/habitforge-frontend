"use client";

import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/authStore";
import { usersApi } from "@/lib/api/users";
import { mediaUrl } from "@/lib/api/client";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/types";

export function ProfileTab({ user }: { user: User }) {
  const qc = useQueryClient();
  const { setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const update = useMutation({
    mutationFn: (payload: { firstName?: string; lastName?: string; bio?: string; timezone?: string; dailyDigestTime?: string | null }) =>
      usersApi.updateMe(payload),
    onSuccess: (data) => {
      setUser(data);
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Профиль обновлён");
    },
    onError: () => toast.error("Ошибка обновления профиля"),
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (res) => {
      setUser({ ...user, avatarUrl: res.avatarUrl });
      qc.invalidateQueries({ queryKey: ["me"] });
      setPreview(null);
      toast.success("Аватар обновлён");
    },
    onError: () => toast.error("Ошибка загрузки аватара"),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    uploadAvatar.mutate(file);
  };

  const avatarSrc = preview ?? mediaUrl(user.avatarUrl);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    update.mutate({
      firstName: fd.get("firstName") as string,
      lastName: fd.get("lastName") as string,
      bio: fd.get("bio") as string,
      timezone: fd.get("timezone") as string,
      dailyDigestTime: fd.get("dailyDigestTime") as string,
    });
  };

  return (
    <GlassCard>
      <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative group shrink-0"
          title="Изменить аватар"
        >
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary flex items-center justify-center">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-3xl font-bold">
                {user.firstName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploadAvatar.isPending ? (
              <Loader2 size={18} className="text-white animate-spin" />
            ) : (
              <Upload size={18} className="text-white" />
            )}
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <div>
          <p className="font-semibold text-text">{user.firstName}</p>
          <p className="text-sm text-muted">@{user.username}</p>
          <p className="text-xs text-muted mt-1">Нажмите на аватар для замены</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Имя</Label>
            <Input name="firstName" defaultValue={user.firstName} />
          </div>
          <div className="space-y-2">
            <Label>Фамилия</Label>
            <Input name="lastName" defaultValue={user.lastName ?? ""} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Юзернейм</Label>
          <Input value={user.username ?? ""} disabled className="opacity-60 cursor-not-allowed" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user.email ?? ""} disabled className="opacity-60 cursor-not-allowed" />
        </div>
        <div className="space-y-2">
          <Label>О себе</Label>
          <Textarea name="bio" defaultValue={user.bio ?? ""} placeholder="Расскажите о себе..." className="resize-none" rows={3} />
        </div>
        <div className="space-y-2">
          <Label>Часовой пояс</Label>
          <Input name="timezone" defaultValue={user.timezone ?? "Europe/Moscow"} placeholder="Europe/Moscow" />
          <p className="text-xs text-muted">IANA timezone: Europe/Moscow, UTC, America/New_York</p>
        </div>
        <div className="space-y-2">
          <Label>Время дневного дайджеста</Label>
          <Input name="dailyDigestTime" type="time" defaultValue={user.dailyDigestTime ?? ""} className="w-40" />
          <p className="text-xs text-muted">
            Общее уведомление по задачам «весь день» и невыполненным на сегодня привычкам. Оставьте пустым, чтобы отключить.
          </p>
        </div>
        <Button type="submit" disabled={update.isPending} className="bg-primary text-white">
          {update.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
          Сохранить
        </Button>
      </form>
    </GlassCard>
  );
}
