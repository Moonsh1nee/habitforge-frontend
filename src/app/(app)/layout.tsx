"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { AuthBootstrap } from "@/components/layout/AuthBootstrap";
import { QuickAddFab } from "@/components/layout/QuickAddFab";
import { useRealtimeEvents } from "@/lib/hooks/useRealtimeEvents";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useRealtimeEvents();

  return (
    <>
      <AuthBootstrap />
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <PageTransition>{children}</PageTransition>
          <QuickAddFab />
        </main>
      </div>
    </div>
    </>
  );
}
