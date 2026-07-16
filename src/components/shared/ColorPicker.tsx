"use client";

import { cn } from "@/lib/utils";

const DEFAULT_COLORS = [
  "#7c3aed", "#06b6d4", "#22c55e", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#0ea5e9",
  "#64748b", "#f97316",
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
}

export function ColorPicker({ value, onChange, colors = DEFAULT_COLORS }: ColorPickerProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
            value === c ? "border-white scale-110" : "border-transparent"
          )}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}
