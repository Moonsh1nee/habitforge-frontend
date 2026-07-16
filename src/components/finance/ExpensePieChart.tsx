import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { GlassCard } from "@/components/shared/GlassCard";
import { TOOLTIP_STYLE } from "@/lib/constants/chartStyles";

interface ChartItem {
  name: string;
  value: number;
  color: string;
}

interface ExpensePieChartProps {
  data: ChartItem[];
  formatAmount: (n: number) => string;
}

export function ExpensePieChart({ data, formatAmount }: ExpensePieChartProps) {
  return (
    <GlassCard>
      <h3 className="font-semibold text-text mb-4">Расходы по категориям</h3>
      {data.length > 0 ? (
        <div className="flex items-center gap-6">
          <PieChart width={180} height={180}>
            <Pie
              data={data}
              cx={90}
              cy={90}
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => formatAmount(v as number)}
              contentStyle={TOOLTIP_STYLE}
            />
          </PieChart>
          <div className="space-y-2 flex-1 min-w-0">
            {data.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-text/80 truncate">{item.name}</span>
                </div>
                <span className="text-xs text-danger shrink-0">{formatAmount(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted text-center py-8">Нет расходов за период</p>
      )}
    </GlassCard>
  );
}
