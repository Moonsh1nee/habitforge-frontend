"use client";

import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export interface DatePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  min?: string;
  max?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

function parseDate(value?: string) {
  if (!value) return undefined;
  try {
    return startOfDay(parseISO(value));
  } catch {
    return undefined;
  }
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  name,
  min,
  max,
  className,
  disabled,
  placeholder = "Выберите дату",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const selectedValue = value ?? uncontrolled;
  const selectedDate = parseDate(selectedValue);

  const minDate = parseDate(min);
  const maxDate = parseDate(max);

  const [viewMonth, setViewMonth] = React.useState(
    () => selectedDate ?? parseDate(defaultValue) ?? startOfDay(new Date())
  );

  React.useEffect(() => {
    if (selectedDate) setViewMonth(selectedDate);
  }, [selectedValue]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const setDate = (date: Date) => {
    const next = format(date, "yyyy-MM-dd");
    if (value === undefined) setUncontrolled(next);
    onChange?.(next);
    setOpen(false);
  };

  const isDisabled = (day: Date) =>
    (minDate && isBefore(day, minDate)) || (maxDate && isAfter(day, maxDate));

  return (
    <>
      {name ? <input type="hidden" name={name} value={selectedValue} /> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-border bg-white/5 px-3 text-sm text-text transition-all outline-none hover:border-white/15 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50",
            !selectedValue && "text-muted",
            className
          )}
        >
          <span className="truncate">
            {selectedDate
              ? format(selectedDate, "d MMMM yyyy", { locale: ru })
              : placeholder}
          </span>
          <CalendarDays className="size-4 shrink-0 text-primary/80" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(100vw-2rem,18rem)] p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="text-muted hover:text-text"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="text-sm font-medium text-text capitalize">
              {format(viewMonth, "LLLL yyyy", { locale: ru })}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="text-muted hover:text-text"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const outside = !isSameMonth(day, viewMonth);
              const selected = selectedDate ? isSameDay(day, selectedDate) : false;
              const today = isToday(day);
              const dayDisabled = isDisabled(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={dayDisabled}
                  onClick={() => setDate(day)}
                  className={cn(
                    "flex h-8 w-full items-center justify-center rounded-lg text-sm transition-all",
                    outside && "text-muted/40",
                    !outside && !selected && "text-text hover:bg-white/8",
                    today && !selected && "ring-1 ring-primary/40",
                    selected && "bg-primary text-white font-semibold shadow-[0_0_12px_var(--color-primary-glow)]",
                    dayDisabled && "pointer-events-none opacity-30"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted hover:text-text"
              onClick={() => {
                const today = startOfDay(new Date());
                if (!isDisabled(today)) setDate(today);
              }}
            >
              Сегодня
            </Button>
            {selectedValue ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted hover:text-text"
                onClick={() => {
                  if (value === undefined) setUncontrolled("");
                  onChange?.("");
                  setOpen(false);
                }}
              >
                Очистить
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}