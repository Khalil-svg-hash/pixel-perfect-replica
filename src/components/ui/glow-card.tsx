import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  hover?: boolean;
}

const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, glowColor, hover = true, children, ...props }, ref) => {
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
      <motion.div
        ref={(node) => {
          (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm",
          "transition-all duration-300",
          hover && "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
          className
        )}
        onMouseMove={handleMouseMove}
        whileHover={hover ? { y: -2 } : undefined}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {/* Radial glow that follows cursor */}
        {hover && (
          <div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(400px circle at var(--glow-x, 50%) var(--glow-y, 50%), ${glowColor || "hsl(var(--accent) / 0.08)"}, transparent 60%)`,
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);
GlowCard.displayName = "GlowCard";

export { GlowCard };
