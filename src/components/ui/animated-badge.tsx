import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "outline" | "glow";
}

function AnimatedBadge({ className, variant = "default", children, ...props }: AnimatedBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "gradient" && "gradient-accent text-white shadow-accent",
        variant === "outline" && "border-2 border-accent/30 text-accent bg-accent/5",
        variant === "glow" &&
          "gradient-accent text-white shadow-glow animate-pulse-soft",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { AnimatedBadge };
