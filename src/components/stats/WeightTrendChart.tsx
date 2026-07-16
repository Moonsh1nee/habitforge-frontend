import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { TOOLTIP_STYLE } from "@/lib/constants/chartStyles";

interface WeightDataPoint {
  date: string;
  weight: number;
}

interface WeightTrendChartProps {
  data: WeightDataPoint[];
}

export function WeightTrendChart({ data }: WeightTrendChartProps) {
  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
        <TrendingUp size={14} className="text-accent" />
        Динамика веса
      </h3>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            stroke="#64748b"
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${v} кг`, "Вес"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={{ fill: "#06b6d4", r: 3, strokeWidth: 0 }}
            name="Вес"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
