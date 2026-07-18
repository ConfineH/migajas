"use client";

import AnimatedContent from "@/components/react-bits/AnimatedContent";

export function ProgressAnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <AnimatedContent
      distance={24}
      duration={0.55}
      delay={delay}
      className={className}
    >
      {children}
    </AnimatedContent>
  );
}
