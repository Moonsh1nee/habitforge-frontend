import type { Metadata } from "next";
import { AuthBootstrap } from "@/components/layout/AuthBootstrap";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthBootstrap />
      <div className="min-h-screen bg-background p-6 md:p-10">
        {children}
      </div>
    </>
  );
}
