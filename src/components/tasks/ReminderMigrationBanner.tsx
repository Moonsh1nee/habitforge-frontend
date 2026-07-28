"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BellRing, X } from "lucide-react";

const STORAGE_KEY = "habitforge-reminder-migration-dismissed";

interface ReminderMigrationBannerProps {
  show: boolean;
}

export function ReminderMigrationBanner({ show }: ReminderMigrationBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(!!localStorage.getItem(STORAGE_KEY));
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  const visible = show && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.25 }}
          className="glass rounded-xl p-3.5 flex items-start gap-3 border-warning/25"
        >
          <div className="w-7 h-7 rounded-lg bg-warning/15 flex items-center justify-center shrink-0">
            <BellRing size={14} className="text-warning" />
          </div>
          <div className="flex-1 min-w-0 text-xs text-muted leading-relaxed">
            <p className="text-text font-medium mb-0.5">Напоминания теперь настраиваются вручную</p>
            Раньше задачи с дедлайном напоминали о себе автоматически. Теперь это опция — откройте задачу и
            выберите режим напоминания, иначе push по ней приходить не будет.
          </div>
          <button
            onClick={dismiss}
            aria-label="Закрыть"
            className="text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-white/5 shrink-0"
          >
            <X size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
