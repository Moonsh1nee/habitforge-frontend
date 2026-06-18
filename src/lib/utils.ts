import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isPast } from "date-fns";
import { ru } from "date-fns/locale";
import * as chrono from "chrono-node";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = "MMM d, yyyy"): string {
  return format(new Date(date), fmt);
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date: string | Date): boolean {
  return isPast(new Date(date)) && !isToday(new Date(date));
}

export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Доброе утро, ${name}`;
  if (hour < 17) return `Добрый день, ${name}`;
  return `Добрый вечер, ${name}`;
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 1: return "text-warning border-warning/30 bg-warning/10";
    case 2: return "text-accent border-accent/30 bg-accent/10";
    default: return "text-muted border-border bg-surface";
  }
}

export function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1: return "Высокий";
    case 2: return "Средний";
    default: return "Низкий";
  }
}

export function parseNaturalDate(
  text: string
): { date: string; label: string; matchText: string } | null {
  const results = chrono.ru.parse(text, new Date(), { forwardDate: true });
  if (!results.length) return null;
  const result = results[0];
  const date = result.date();
  if (date <= new Date()) return null;
  return {
    date: format(date, "yyyy-MM-dd"),
    label: format(date, "d MMM, HH:mm", { locale: ru }),
    matchText: result.text,
  };
}

export function getMoodColor(mood: number): string {
  if (mood >= 8) return "#22c55e";
  if (mood >= 6) return "#84cc16";
  if (mood >= 4) return "#f59e0b";
  if (mood >= 2) return "#f97316";
  return "#ef4444";
}
