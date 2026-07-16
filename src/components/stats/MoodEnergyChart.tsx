import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Heart } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { TOOLTIP_STYLE } from "@/lib/constants/chartStyles";

interface MoodDataPoint {
  date: string;
  mood?: number | null;
  energy?: number | null;
}

interface MoodEnergyChartProps {
  data: MoodDataPoint[];
}

export function MoodEnergyChart({ data }: MoodEnergyChartProps) {
  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
        <Heart size={14} className="text-primary" />
        Настроение и энергия
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke="#64748b"
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[1, 10]}
            stroke="#64748b"
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="#7c3aed"
            fill="url(#moodGrad)"
            strokeWidth={2}
            name="Настроение"
            dot={false}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="energy"
            stroke="#06b6d4"
            fill="url(#energyGrad)"
            strokeWidth={2}
            name="Энергия"
            dot={false}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
