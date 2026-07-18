"use client";

import { Children, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
}

export default function StaggeredList({
  children,
  className = "",
  itemClassName = "",
  staggerDelay = 0.08,
}: StaggeredListProps) {
  const items = Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, index) => (
        <StaggeredItem
          key={index}
          index={index}
          delay={index * staggerDelay}
          className={itemClassName}
        >
          {child}
        </StaggeredItem>
      ))}
    </div>
  );
}

function StaggeredItem({
  children,
  delay,
  className,
}: {
  children: ReactNode;
  index: number;
  delay: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ y: 16, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
