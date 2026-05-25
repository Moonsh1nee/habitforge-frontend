"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";
import { journalApi } from "@/lib/api/journal";
import { GlassCard } from "@/components/shared/GlassCard";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getTodayString, getMoodColor } from "@/lib/utils";

export default function JournalPage() {
  const qc = useQueryClient();
  const today = getTodayString();
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [stress, setStress] = useState(4);
  const [sleep, setSleep] = useState(8);

  const { data: todayEntry } = useQuery({
    queryKey: ["journal", today],
    queryFn: () => journalApi.getEntry(today).catch(() => null),
  });

  const start = format(subDays(new Date(), 29), "yyyy-MM-dd");
  const { data: entries } = useQuery({
    queryKey: ["journal", "entries", start],
    queryFn: () => journalApi.getEntries({ start, end: today }),
  });

  const saveEntry = useMutation({
    mutationFn: (payload: Parameters<typeof journalApi.createEntry>[0]) =>
      todayEntry
        ? journalApi.updateEntry(today, payload)
        : journalApi.createEntry(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      toast.success("Запись сохранена!");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveEntry.mutate({
      date: today,
      mood,
      energy,
      stressLevel: stress,
      sleepHours: sleep,
      weight: fd.get("weight") ? Number(fd.get("weight")) : undefined,
      notes: fd.get("notes") as string,
      wins: fd.get("wins") as string,
      improvements: fd.get("improvements") as string,
    });
  };

  const chartData =
    entries
      ?.filter((e) => e.mood !== undefined)
      .map((e) => ({
        date: format(new Date(e.date), "d MMM"),
        mood: e.mood,
        energy: e.energy,
      })) ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-text">Дневник</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's entry form */}
        <GlassCard>
          <h2 className="font-semibold text-text mb-5">Сегодня</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              {
                label: "Настроение",
                value: mood,
                setter: setMood,
                color: getMoodColor(mood),
              },
              { label: "Энергия", value: energy, setter: setEnergy, color: "var(--color-accent)" },
              { label: "Стресс", value: stress, setter: setStress, color: "var(--color-danger)" },
              { label: "Сон (часов)", value: sleep, setter: setSleep, max: 12, color: "var(--color-primary)" },
            ].map(({ label, value, setter, max = 10, color }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-text/80 text-sm">{label}</Label>
                  <span className="text-sm font-bold" style={{ color }}>
                    {value}/{max}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={max}
                  step={1}
                  value={[value]}
                  onValueChange={(vals) => { const v = Array.isArray(vals) ? vals[0] : vals; setter(v as number); }}
                  className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label className="text-text/80 text-sm">Вес (кг)</Label>
              <Input
                name="weight"
                type="number"
                step={0.1}
                placeholder="70.5"
                defaultValue={todayEntry?.weight ?? ""}
                className="bg-white/5 border-border text-text"
              />
            </div>

            {[
              { name: "wins", label: "Победы дня" },
              { name: "improvements", label: "Что улучшить" },
              { name: "notes", label: "Заметки" },
            ].map(({ name, label }) => (
              <div key={name} className="space-y-2">
                <Label className="text-text/80 text-sm">{label}</Label>
                <Textarea
                  name={name}
                  placeholder={`${label}...`}
                  defaultValue={
                    (todayEntry?.[name as "wins" | "improvements" | "notes"] as string | undefined) ?? ""
                  }
                  className="bg-white/5 border-border text-text resize-none"
                  rows={2}
                />
              </div>
            ))}

            <Button
              type="submit"
              disabled={saveEntry.isPending}
              className="w-full gradient-primary text-white"
            >
              Сохранить запись
            </Button>
          </form>
        </GlassCard>

        {/* Mood/energy chart */}
        <div className="space-y-4">
          <GlassCard>
            <h2 className="font-semibold text-text mb-4">Настроение за 30 дней</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
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
                  <Tooltip
                    contentStyle={{
                      background: "#13131a",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      color: "#f1f5f9",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#7c3aed"
                    fill="url(#moodGrad)"
                    strokeWidth={2}
                    name="Настроение"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    stroke="#06b6d4"
                    fill="url(#energyGrad)"
                    strokeWidth={2}
                    name="Энергия"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted text-center py-8">Недостаточно данных</p>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
