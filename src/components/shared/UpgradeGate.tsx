"use client";

import { Lock, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

interface UpgradeGateProps {
  children: React.ReactNode;
  locked: boolean;
  feature?: string;
}

export function UpgradeGate({ children, locked, feature }: UpgradeGateProps) {
  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-30 blur-[2px]">{children}</div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, rgba(10,10,15,0.82) 100%)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-3">
          <Lock size={22} className="text-primary" />
        </div>
        {feature && (
          <p className="text-xs text-muted mb-1 text-center">{feature}</p>
        )}
        <p className="text-sm font-semibold text-text mb-4 text-center">
          Доступно в Pro
        </p>
        <Link
          href="/upgrade"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium transition-opacity hover:opacity-90"
        >
          <Sparkles size={13} />
          Перейти на Pro
        </Link>
      </motion.div>
    </div>
  );
}
