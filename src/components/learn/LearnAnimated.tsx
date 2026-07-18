"use client";

import AnimatedContent from "@/components/react-bits/AnimatedContent";

export function LearnAnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatedContent distance={24} duration={0.55} className={className}>
      {children}
    </AnimatedContent>
  );
}
