"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { GoogleCalendarCard } from "@/components/profile/GoogleCalendarCard";

function GoogleConnectedNotifier() {
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("google") === "connected") {
      toast.success("Google Calendar подключён");
      window.history.replaceState({}, "", "/settings");
    }
  }, [params]);

  return null;
}

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Suspense>
        <GoogleConnectedNotifier />
      </Suspense>

      <PageHeader title="Настройки" subtitle="Интеграции и внешние сервисы" />

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider px-1">
          Интеграции
        </h2>
        <GoogleCalendarCard />
      </section>
    </div>
  );
}
