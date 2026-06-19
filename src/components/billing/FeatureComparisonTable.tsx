"use client";

import { Check, X } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

const rows: { label: string; free: string | boolean; pro: string | boolean }[] = [
  { label: "Привычки", free: "До 5", pro: "Неограниченно" },
  { label: "Проекты", free: "До 3", pro: "Неограниченно" },
  { label: "Теги", free: "До 5", pro: "Неограниченно" },
  { label: "Аналитика", free: "7 дней", pro: "90+ дней" },
  { label: "Годовой хитмап привычек", free: false, pro: true },
  { label: "Шаблоны привычек/тренировок", free: false, pro: true },
  { label: "AI-инсайты", free: false, pro: true },
  { label: "Экспорт данных", free: true, pro: true },
  { label: "PWA / мобильный доступ", free: true, pro: true },
  { label: "Telegram-бот", free: true, pro: true },
  { label: "Push-уведомления", free: true, pro: true },
  { label: "Приоритетная поддержка", free: false, pro: true },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={16} className="text-success mx-auto" />
    ) : (
      <X size={16} className="text-muted/40 mx-auto" />
    );
  }
  return <span className="text-sm text-text">{value}</span>;
}

export function FeatureComparisonTable() {
  return (
    <GlassCard className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3.5 text-muted font-medium">Функция</th>
              <th className="text-center px-5 py-3.5 text-muted font-medium w-28">Free</th>
              <th className="text-center px-5 py-3.5 text-primary font-semibold w-28">Pro</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-3 text-text">{row.label}</td>
                <td className="px-5 py-3 text-center">
                  <Cell value={row.free} />
                </td>
                <td className="px-5 py-3 text-center">
                  <Cell value={row.pro} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
