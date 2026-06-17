"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CollapsibleBodyProps {
  expanded: boolean;
  children: ReactNode;
}

export function CollapsibleBody({ expanded, children }: CollapsibleBodyProps) {
  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
