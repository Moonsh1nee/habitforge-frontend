import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isPast } from "date-fns";

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

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "critical":
      return "text-danger border-danger/30 bg-danger/10";
    case "high":
      return "text-warning border-warning/30 bg-warning/10";
    case "medium":
      return "text-accent border-accent/30 bg-accent/10";
    default:
      return "text-muted border-border bg-surface";
  }
}

export function getMoodColor(mood: number): string {
  if (mood >= 8) return "#22c55e";
  if (mood >= 6) return "#84cc16";
  if (mood >= 4) return "#f59e0b";
  if (mood >= 2) return "#f97316";
  return "#ef4444";
}
