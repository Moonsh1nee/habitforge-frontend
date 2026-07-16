"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { AuthBootstrap } from "@/components/layout/AuthBootstrap";
import { QuickAddFab } from "@/components/layout/QuickAddFab";
import { BottomNav } from "@/components/layout/BottomNav";
import { PomodoroTicker } from "@/components/layout/PomodoroWidget";
import { FullPageSkeleton } from "@/components/shared/FullPageSkeleton";
import { useRealtimeEvents } from "@/lib/hooks/useRealtimeEvents";
import { useMe } from "@/lib/hooks/useAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  useRealtimeEvents();
  const { isPending } = useMe();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === "KeyN") { e.preventDefault(); router.push("/tasks?create=1"); }
      if (e.code === "KeyH") { e.preventDefault(); router.push("/habits?create=1"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  if (isPending) return <FullPageSkeleton />;

  return (
    <>
      <AuthBootstrap />
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <PageTransition>{children}</PageTransition>
          <QuickAddFab />
          <PomodoroTicker />
        </main>
      </div>
    </div>
    <BottomNav />
    </>
  );
}
