"use client";

import React, { useState } from "react";
import {
  User, Lock, MessageSquare, Database, LayoutGrid, CreditCard,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useMe } from "@/lib/hooks/useAuth";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { SecurityTab } from "@/components/profile/SecurityTab";
import { TelegramTab } from "@/components/profile/TelegramTab";
import { DataTab } from "@/components/profile/DataTab";
import { SubscriptionTab } from "@/components/profile/SubscriptionTab";
import { ModulesTab } from "@/components/profile/ModulesTab";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "security" | "telegram" | "modules" | "data" | "subscription";

const NAV_ITEMS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profile",      label: "Профиль",      icon: User },
  { id: "security",     label: "Безопасность", icon: Lock },
  { id: "modules",      label: "Разделы",      icon: LayoutGrid },
  { id: "telegram",     label: "Telegram",     icon: MessageSquare },
  { id: "data",         label: "Данные",       icon: Database },
  { id: "subscription", label: "Подписка",     icon: CreditCard },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { isPending, isFetching } = useMe();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  if (!user && (isPending || isFetching)) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-7 w-40 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="flex gap-6 items-start">
          <div className="w-44 shrink-0 space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="flex-1">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {user.firstName?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">{user.firstName}</h1>
          <p className="text-sm text-muted">@{user.username}</p>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <nav className="w-44 shrink-0 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left",
                activeTab === id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted hover:text-text hover:bg-white/5"
              )}
            >
              <Icon size={15} className="shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === "profile"      && <ProfileTab user={user} />}
          {activeTab === "security"     && <SecurityTab />}
          {activeTab === "modules"      && <ModulesTab />}
          {activeTab === "telegram"     && <TelegramTab />}
          {activeTab === "data"         && <DataTab user={user} />}
          {activeTab === "subscription" && <SubscriptionTab />}
        </div>
      </div>
    </div>
  );
}
