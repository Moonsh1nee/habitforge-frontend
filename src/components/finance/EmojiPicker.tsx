"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const EMOJI_GROUPS = [
  { label: "Финансы",      emojis: ["💰","💳","🏦","💵","🪙","📊","📈","💹","🏧","💸","🤑","💎"] },
  { label: "Еда",          emojis: ["🍕","🍔","🍜","🍣","☕","🍺","🥗","🥐","🍱","🍎","🧃","🛒"] },
  { label: "Транспорт",    emojis: ["🚗","✈️","🚌","🚇","🚲","🛵","⛽","🚕","🛳️","🚁"] },
  { label: "Дом",          emojis: ["🏠","🔧","💡","🧹","🪴","🛁","🪑","🔑"] },
  { label: "Здоровье",     emojis: ["💊","🏥","🏃","💪","🧘","🦷","🧴","❤️"] },
  { label: "Развлечения",  emojis: ["🎮","🎬","🎵","🎭","📚","🎯","🎲","🎸"] },
  { label: "Покупки",      emojis: ["👕","👗","👠","💄","🛍️","👒","💍","🧢"] },
  { label: "Работа",       emojis: ["💼","🖥️","📱","🖊️","📝","🗂️","⚙️","🔬"] },
];

interface EmojiPickerProps {
  value: string | null;
  onChange: (emoji: string | null) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-10 h-10 rounded-xl border text-lg flex items-center justify-center transition-all",
          open
            ? "border-primary/50 bg-primary/10"
            : "border-border bg-white/5 hover:border-primary/30 hover:bg-white/8"
        )}
      >
        {value ?? <span className="text-muted text-sm">+</span>}
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 w-72 rounded-xl border border-border bg-popover/95 shadow-2xl backdrop-blur-xl p-3 space-y-3 max-h-72 overflow-y-auto scrollbar-thin">
          <button
            type="button"
            onClick={() => { onChange(null); setOpen(false); }}
            className="w-full text-left text-xs text-muted hover:text-text px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            Без иконки
          </button>

          {EMOJI_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1.5 px-1">{group.label}</p>
              <div className="grid grid-cols-8 gap-0.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { onChange(emoji); setOpen(false); }}
                    className={cn(
                      "w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all hover:bg-white/10",
                      value === emoji && "bg-primary/20 ring-1 ring-primary/50"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
