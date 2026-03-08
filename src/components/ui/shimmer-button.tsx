import * as React from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  children: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "hsl(var(--accent-foreground))",
      shimmerSize = "0.1em",
      shimmerDuration = "2.5s",
      borderRadius = "var(--radius)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden whitespace-nowrap px-6 font-display font-semibold text-sm transition-all duration-300",
          "gradient-accent text-white shadow-accent hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        style={{ borderRadius }}
        {...props}
      >
        {/* Shimmer layer */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius }}
        >
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background: `linear-gradient(90deg, transparent, ${shimmerColor}20, transparent)`,
              backgroundSize: "200% 100%",
            }}
          />
        </div>
        {/* Glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${shimmerColor}15, transparent 60%)`,
            borderRadius,
          }}
        />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);
ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
