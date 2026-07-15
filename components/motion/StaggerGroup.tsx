"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { staggerContainer, staggerItem } from "@/lib/motion";

/** Wrap a list with StaggerGroup and each row with StaggerItem for a cascaded entrance animation. */
export function StaggerGroup({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "ul" }) {
  const MotionTag = motion[as];
  return (
    <MotionTag initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={staggerContainer} className={className}>
      {children}
    </MotionTag>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const MotionTag = motion[as];
  return (
    <MotionTag variants={staggerItem} className={className}>
      {children}
    </MotionTag>
  );
}
