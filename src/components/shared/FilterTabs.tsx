import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FilterTabOption<T extends string> {
  value: T;
  label: string;
}

interface FilterTabsProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: FilterTabOption<T>[];
  size?: "sm" | "md";
}

export function FilterTabs<T extends string>({
  value,
  onChange,
  options,
  size = "sm",
}: FilterTabsProps<T>) {
  const px = size === "sm" ? "px-4 py-1.5" : "px-5 py-2";
  const glow =
    size === "sm"
      ? "data-[state=active]:shadow-[0_0_12px_var(--color-primary-glow)]"
      : "data-[state=active]:shadow-[0_0_16px_var(--color-primary-glow)]";
  const gap = size === "sm" ? "gap-1" : "gap-2";

  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as T)}>
      <TabsList className={`bg-transparent p-0 ${gap} h-auto`}>
        {options.map((opt) => (
          <TabsTrigger
            key={opt.value}
            value={opt.value}
            className={`${px} rounded-full text-sm font-medium transition-all text-muted data-[state=active]:bg-primary data-[state=active]:text-white ${glow} hover:text-text`}
          >
            {opt.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
