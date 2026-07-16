import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import type { ShoppingListStatus } from "@/types";

export function formatPrice(n: number) {
  return n.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
}

export function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return format(parseISO(dateStr), "d MMM", { locale: ru });
}

export function formatTime(timeStr: string | null) {
  if (!timeStr) return null;
  return timeStr.slice(0, 5);
}

export const STATUS_COLORS: Record<ShoppingListStatus, string> = {
  active:    "text-primary",
  completed: "text-success",
  cancelled: "text-muted",
};

export const STATUS_LABELS: Record<ShoppingListStatus, string> = {
  active:    "Активный",
  completed: "Завершён",
  cancelled: "Отменён",
};
