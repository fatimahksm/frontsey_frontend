"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { fadeInUp } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  variants?: Variants;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
  id?: string;
}

/** Fades/slides content in the first time it scrolls into view - the base building block for scroll-reveal sections. */
export function Reveal({ children, variants = fadeInUp, delay = 0, className, as = "div", id }: RevealProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
