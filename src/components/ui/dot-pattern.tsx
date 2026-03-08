import { cn } from "@/lib/utils";

interface DotPatternProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  gap?: number;
}

export function DotPattern({
  className,
  dotColor = "hsl(var(--foreground) / 0.07)",
  dotSize = 1,
  gap = 24,
}: DotPatternProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${gap}px ${gap}px`,
      }}
    />
  );
}
