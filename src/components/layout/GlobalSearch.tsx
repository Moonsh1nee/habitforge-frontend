"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, CheckSquare, Repeat2, BookOpen } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchApi, type SearchResultItemWithUrl } from "@/lib/api/search";

const TYPE_ICON = {
  task: <CheckSquare size={14} className="shrink-0" />,
  habit: <Repeat2 size={14} className="shrink-0" />,
  journal: <BookOpen size={14} className="shrink-0" />,
};

const TYPE_LABEL = {
  task: "Задачи",
  habit: "Привычки",
  journal: "Журнал",
};

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

  const { data: rawResults } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  const results = Array.isArray(rawResults) ? rawResults : [];

  const grouped = results.reduce<Record<string, SearchResultItemWithUrl[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  function handleSelect(result: SearchResultItemWithUrl) {
    router.push(result.url);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-muted hover:text-text transition-colors p-1.5 rounded-lg hover:bg-white/5"
        aria-label="Поиск (Ctrl+K)"
      >
        <Search size={18} />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs text-muted/60 bg-white/5 border border-border rounded px-1.5 py-0.5">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder="Поиск задач, привычек, записей..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {debouncedQuery.length >= 2 && results.length === 0 && (
              <CommandEmpty>Ничего не найдено</CommandEmpty>
            )}
            {debouncedQuery.length < 2 && (
              <CommandEmpty>Введите минимум 2 символа</CommandEmpty>
            )}
            {(["task", "habit", "journal"] as const).map((type) => {
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
                        {result.description && (
                          <span className="text-xs text-muted truncate">
                            {result.description}
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
