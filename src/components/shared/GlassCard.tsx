"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  hover = false,
  onClick,
}: GlassCardProps) {
  const Component = hover || onClick ? motion.div : "div";

  if (hover || onClick) {
    return (
      <motion.div
        className={cn("glass p-6", className)}
        whileHover={{ scale: 1.02, boxShadow: "0 0 20px var(--color-primary-glow)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : undefined }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={cn("glass p-6", className)}>{children}</div>;
}
