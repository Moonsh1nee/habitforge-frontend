"use client";

import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { BookOpen } from "lucide-react";
import { useJournalEntry, useJournalEntries, useSaveJournalEntry } from "@/lib/hooks/useJournal";
import { GlassCard } from "@/components/shared/GlassCard";
import { CardSkeleton, ListSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { cn, getTodayString, getMoodColor } from "@/lib/utils";
import type { DailyEntry } from "@/types";

const MOOD_EMOJI: Record<number, string> = {
  1: "😞", 2: "😔", 3: "😕", 4: "😐", 5: "🙂",
  6: "😊", 7: "😄", 8: "😁", 9: "🤩", 10: "🌟",
};

// ─── Entry Form ───────────────────────────────────────────────────────────────

function EntryForm({ date, existing }: { date: string; existing: DailyEntry | null }) {
  const [mood, setMood] = useState(existing?.mood ?? 7);
  const [energy, setEnergy] = useState(existing?.energy ?? 7);
  const [stress, setStress] = useState(existing?.stressLevel ?? 4);
  const [sleep, setSleep] = useState(existing?.sleepHours ?? 8);

  const saveEntry = useSaveJournalEntry(date, existing);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveEntry.mutate({
      date,
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

  const sliders = [
    { label: "Настроение", value: mood, setter: setMood, color: getMoodColor(mood) },
    { label: "Энергия", value: energy, setter: setEnergy, color: "var(--color-accent)" },
    { label: "Стресс", value: stress, setter: setStress, color: "var(--color-danger)" },
    { label: "Сон (часов)", value: sleep, setter: setSleep, max: 12, color: "var(--color-primary)" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {sliders.map(({ label, value, setter, max = 10, color }) => (
        <div key={label} className="space-y-2">
          {label === "Настроение" && (
            <div className="text-center text-4xl py-1 select-none transition-all duration-200">
              {MOOD_EMOJI[value] ?? "😐"}
            </div>
          )}
          <div className="flex justify-between items-center">
            <Label className="text-sm">{label}</Label>
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
        <Label className="text-sm">Вес (кг)</Label>
        <Input
          name="weight"
          type="number"
          step={0.1}
          placeholder="70.5"
          defaultValue={existing?.weight ?? ""}
        />
      </div>

      {[
        { name: "wins", label: "Победы дня" },
        { name: "improvements", label: "Что улучшить" },
        { name: "notes", label: "Заметки" },
      ].map(({ name, label }) => (
        <div key={name} className="space-y-2">
          <Label className="text-sm">{label}</Label>
          <Textarea
            name={name}
            placeholder={`${label}...`}
            defaultValue={(existing?.[name as "wins" | "improvements" | "notes"] as string | undefined) ?? ""}
            className="resize-none"
            rows={2}
          />
        </div>
      ))}

      <Button type="submit" disabled={saveEntry.isPending} className="w-full gradient-primary text-white">
        Сохранить запись
      </Button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JournalPage() {
  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);

  const start = format(subDays(new Date(), 29), "yyyy-MM-dd");

  const { data: selectedEntry, isLoading: entryLoading } = useJournalEntry(selectedDate);
  const { data: entries, isLoading: entriesLoading } = useJournalEntries({ start, end: today, limit: 30 });

  const streak = useMemo(() => {
    if (!entries?.length) return 0;
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    let expected = today;
    for (const e of sorted) {
      if (e.date === expected) {
        count++;
        expected = format(subDays(parseISO(e.date), 1), "yyyy-MM-dd");
      } else {
        break;
      }
    }
    return count;
  }, [entries, today]);

  const streakLabel = streak > 0
    ? `🔥 ${streak} ${streak === 1 ? "день" : streak < 5 ? "дня" : "дней"} подряд`
    : undefined;

  const chartData =
    entries
      ?.filter((e) => e.mood != null)
      .map((e) => ({
        date: format(new Date(e.date), "d MMM", { locale: ru }),
        mood: e.mood,
        energy: e.energy,
      })) ?? [];

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader title="Дневник" subtitle={streakLabel} />

      <div className="flex gap-6 items-start">
        {/* History sidebar */}
        <div className="w-44 shrink-0 space-y-1">
          <p className="text-xs text-muted font-medium uppercase tracking-wide px-2 mb-2">
            История
          </p>

          {/* Today shortcut */}
          <button
            onClick={() => setSelectedDate(today)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all text-left",
              selectedDate === today
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted hover:text-text hover:bg-white/5"
            )}
          >
            <BookOpen size={13} className="shrink-0" />
            Сегодня
          </button>

          {entriesLoading ? (
            <ListSkeleton count={5} />
          ) : (
            entries
              ?.filter((e) => e.date !== today)
              .slice(0, 25)
              .map((entry) => (
                <button
                  key={entry.date}
                  onClick={() => setSelectedDate(entry.date)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all",
                    selectedDate === entry.date
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted hover:text-text hover:bg-white/5"
                  )}
                >
                  <span className="text-xs">
                    {format(new Date(entry.date), "d MMM", { locale: ru })}
                  </span>
                  {entry.mood != null && (
                    <span className="text-sm">{MOOD_EMOJI[entry.mood] ?? "📝"}</span>
                  )}
                </button>
              ))
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Entry date header */}
          <p className="text-sm text-muted capitalize">
            {selectedDate === today
              ? "Сегодня"
              : format(new Date(selectedDate), "d MMMM yyyy", { locale: ru })}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {entryLoading ? (
              <CardSkeleton />
            ) : (
              <GlassCard>
                <h2 className="font-semibold text-text mb-5">
                  {selectedEntry ? "Редактировать запись" : "Новая запись"}
                </h2>
                <EntryForm
                  key={`${selectedDate}-${selectedEntry?.id ?? "new"}`}
                  date={selectedDate}
                  existing={selectedEntry ?? null}
                />
              </GlassCard>
            )}

            {/* Chart */}
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
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                    <YAxis domain={[1, 10]} stroke="#64748b" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f1f5f9" }}
                    />
                    <Area type="monotone" dataKey="mood" stroke="#7c3aed" fill="url(#moodGrad)" strokeWidth={2} name="Настроение" dot={false} />
                    <Area type="monotone" dataKey="energy" stroke="#06b6d4" fill="url(#energyGrad)" strokeWidth={2} name="Энергия" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted text-center py-8">Недостаточно данных</p>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}