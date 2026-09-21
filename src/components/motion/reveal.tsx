"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const spring = { type: "spring", stiffness: 260, damping: 22 } as const;

/** Stagger container — wrap a list, give each child <Reveal>. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

/** Single element that pops into view. Respects prefers-reduced-motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduced = useReducedMotion();

  const variants: Variants = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { ...spring, delay },
    },
  };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/** Springy tap/hover feedback for anything a child will poke at. */
export function Pokeable({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      onClick={onClick}
      whileHover={reduced ? undefined : { scale: 1.04, rotate: -1 }}
      whileTap={reduced ? undefined : { scale: 0.95, rotate: 1 }}
      transition={spring}
    >
      {children}
    </motion.div>
  );
}
