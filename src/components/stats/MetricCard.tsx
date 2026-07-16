import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: number | null;
  suffix?: string;
  decimals?: number;
  colorClass: string;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  decimals = 1,
  colorClass,
}: MetricCardProps) {
  return (
    <GlassCard className="p-4 text-center flex flex-col items-center gap-2">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5">
        <Icon size={16} className={colorClass} />
      </div>
      <p className={`text-2xl font-bold tabular-nums ${colorClass}`}>
        {value != null ? (
          <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
        ) : (
          <span className="text-muted text-lg">—</span>
        )}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </GlassCard>
  );
}
