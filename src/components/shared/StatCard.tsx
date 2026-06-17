import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./AnimatedNumber";
import { GlassCard } from "./GlassCard";

interface StatCardProps {
  icon: ReactNode;
  iconSize?: number;
  value: number;
  label: string;
  color: string;
  bg: string;
  suffix?: string;
  decimals?: number;
}

export function StatCard({
  icon,
  value,
  label,
  color,
  bg,
  suffix = "",
  decimals = 0,
}: StatCardProps) {
  return (
    <GlassCard>
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <span className={color}>{icon}</span>
      </div>
      <p className={cn("text-xl font-bold", color)}>
        <AnimatedNumber value={Math.abs(value)} suffix={suffix} decimals={decimals} />
      </p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </GlassCard>
  );
}
