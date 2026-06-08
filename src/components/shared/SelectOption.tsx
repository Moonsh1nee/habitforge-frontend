import { SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectOptionProps {
  value: string;
  label: string;
  icon?: string | null;
  color?: string | null;
  className?: string;
}

export function SelectOption({ value, label, icon, color, className }: SelectOptionProps) {
  return (
    <SelectItem value={value} className={className}>
      <span className="flex min-w-0 items-center gap-2.5">
        {icon ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8 text-base leading-none">
            {icon}
          </span>
        ) : color ? (
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/10"
            style={{ backgroundColor: color }}
          />
        ) : null}
        <span className="truncate">{label}</span>
      </span>
    </SelectItem>
  );
}