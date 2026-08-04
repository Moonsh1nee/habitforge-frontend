"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, CheckSquare, Repeat2, BookOpen, Target, Loader2 } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchApi } from "@/lib/api/search";
import type { SearchResultItem } from "@/types";

const TYPE_ICON: Record<SearchResultItem["type"], React.ReactNode> = {
  task: <CheckSquare size={14} className="shrink-0" />,
  habit: <Repeat2 size={14} className="shrink-0" />,
  journal: <BookOpen size={14} className="shrink-0" />,
  goal: <Target size={14} className="shrink-0" />,
};

const TYPE_LABEL: Record<SearchResultItem["type"], string> = {
  task: "Задачи",
  habit: "Привычки",
  journal: "Журнал",
  goal: "Цели",
};

const ALL_TYPES = ["task", "habit", "journal", "goal"] as const;

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const isMac = typeof window !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  const { data: rawResults, isLoading: isSearching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  const results = Array.isArray(rawResults) ? rawResults : [];

  const grouped = results.reduce<Record<string, SearchResultItem[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  function handleSelect(result: SearchResultItem) {
    router.push(result.url ?? "/dashboard");
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-muted hover:text-text transition-colors p-1.5 rounded-lg hover:bg-white/5"
        aria-label={`Поиск (${isMac ? "⌘" : "Ctrl"} K)`}
      >
        <Search size={18} />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs text-muted bg-white/5 border border-border rounded px-1.5 py-0.5">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder="Поиск задач, привычек, целей, финансов..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isSearching && debouncedQuery.length >= 2 && (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={16} className="animate-spin text-muted" />
              </div>
            )}
            {!isSearching && debouncedQuery.length >= 2 && results.length === 0 && (
              <CommandEmpty>Ничего не найдено</CommandEmpty>
            )}
            {debouncedQuery.length < 2 && (
              <CommandEmpty>Введите минимум 2 символа</CommandEmpty>
            )}
            {ALL_TYPES.map((type) => {
              const items = grouped[type];
              if (!items?.length) return null;
              return (
                <CommandGroup key={type} heading={TYPE_LABEL[type]}>
                  {items.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={`${result.id}-${result.title}`}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-muted">{TYPE_ICON[type]}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{result.title}</span>
                        {result.subtitle && (
                          <span className="text-xs text-muted truncate">
                            {result.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
