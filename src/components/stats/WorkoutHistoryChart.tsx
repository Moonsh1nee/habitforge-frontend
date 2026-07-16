import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Dumbbell } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { TOOLTIP_STYLE } from "@/lib/constants/chartStyles";

interface WorkoutDataPoint {
  date: string;
  duration: number;
}

interface WorkoutHistoryChartProps {
  data: WorkoutDataPoint[];
}

export function WorkoutHistoryChart({ data }: WorkoutHistoryChartProps) {
  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
        <Dumbbell size={14} className="text-success" />
        Тренировки за период
      </h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data}>
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
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v) => [`${v} мин`, "Длительность"]}
            />
            <Bar
              dataKey="duration"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              name="Длительность"
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <Dumbbell size={24} className="text-muted/40" />
          <p className="text-sm text-muted">Нет тренировок за период</p>
        </div>
      )}
    </GlassCard>
  );
}
