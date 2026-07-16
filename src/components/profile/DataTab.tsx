"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/authStore";
import { usersApi } from "@/lib/api/users";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/types";

export function DataTab({ user }: { user: User }) {
  const { setUser } = useAuthStore();
  const [exporting, setExporting] = useState<"json" | "csv" | null>(null);

  const updateTimezone = useMutation({
    mutationFn: (timezone: string) => usersApi.updateMe({ timezone }),
    onSuccess: (data) => {
      setUser(data);
      toast.success("Часовой пояс обновлён");
    },
  });

  const handleExport = async (format: "json" | "csv") => {
    setExporting(format);
    try {
      const blob = await usersApi.exportData(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `habitforge-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Ошибка экспорта данных");
    } finally {
      setExporting(null);
    }
  };

  const handleTimezoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateTimezone.mutate(fd.get("timezone") as string);
  };

  return (
    <div className="space-y-5">
      <GlassCard>
        <h3 className="font-semibold text-text mb-4">Часовой пояс</h3>
        <form onSubmit={handleTimezoneSubmit} className="flex gap-3">
          <Input
            name="timezone"
            defaultValue={user.timezone ?? "Europe/Moscow"}
            placeholder="Europe/Moscow"
            className="flex-1"
          />
          <Button type="submit" disabled={updateTimezone.isPending} className="bg-primary text-white">
            Сохранить
          </Button>
        </form>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold text-text mb-2">Экспорт данных</h3>
        <p className="text-sm text-muted mb-5">Скачайте все свои данные в удобном формате.</p>
        <div className="flex gap-3">
          {(["json", "csv"] as const).map((fmt) => (
            <Button
              key={fmt}
              variant="outline"
              onClick={() => handleExport(fmt)}
              disabled={exporting !== null}
              className="border-border text-text hover:bg-white/5 gap-2"
            >
              {exporting === fmt ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
              Экспорт {fmt.toUpperCase()}
            </Button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
