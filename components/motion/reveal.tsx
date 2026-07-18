"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  className,
  mode = "scroll",
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  mode?: "scroll" | "load";
  y?: number;
}) {
  const initial = { opacity: 0, y };
  const animate = { opacity: 1, y: 0 };
  const transition = { duration: 0.6, delay, ease: EASE };

  if (mode === "load") {
    return (
      <motion.div initial={initial} animate={animate} transition={transition} className={className}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-80px" }}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
