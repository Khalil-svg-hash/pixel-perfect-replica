import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlowCardProps {
  className?: string;
  glowColor?: string;
  hover?: boolean;
  children: React.ReactNode;
}

const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, glowColor, hover = true, children }, ref) => {
    const cardRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        cardRef.current.style.setProperty("--glow-x", `${x}%`);
        cardRef.current.style.setProperty("--glow-y", `${y}%`);
      },
      []
    );

    return (
      <div
        ref={(node) => {
          (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm",
          "transition-all duration-300",
          hover && "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5",
          className
        )}
        onMouseMove={handleMouseMove}
      >
        {hover && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(400px circle at var(--glow-x, 50%) var(--glow-y, 50%), ${glowColor || "hsl(var(--accent) / 0.08)"}, transparent 60%)`,
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
GlowCard.displayName = "GlowCard";

export { GlowCard };
