"use client";

import { createContext, useContext, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

const ParallaxContext = createContext<{ x: MotionValue<number>; y: MotionValue<number> } | null>(null);

export function HeroParallaxContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <ParallaxContext.Provider value={{ x: springX, y: springY }}>
      <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={className}>
        {children}
      </div>
    </ParallaxContext.Provider>
  );
}

export function ParallaxLayer({
  depth,
  children,
  className,
}: {
  depth: number;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(ParallaxContext);
  if (!ctx) throw new Error("ParallaxLayer must be used within HeroParallaxContainer");
  const x = useTransform(ctx.x, (v) => v * depth);
  const y = useTransform(ctx.y, (v) => v * depth);

  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}
