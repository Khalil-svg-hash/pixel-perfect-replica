import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, label, icon, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = props.value !== undefined && props.value !== "";

    return (
      <div className="relative group">
        {icon && (
          <div className={cn(
            "absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors duration-200 z-10",
            isFocused && "text-accent"
          )}>
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "peer flex h-12 w-full rounded-xl border-2 bg-card/50 px-4 py-3 text-sm font-sans",
            "ring-0 outline-none transition-all duration-300",
            "placeholder:text-transparent",
            "border-border/60 focus:border-accent focus:bg-card",
            "hover:border-border",
            icon && "ps-11",
            label && "pt-5 pb-1",
            className
          )}
          placeholder={label || props.placeholder}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "absolute start-4 transition-all duration-200 pointer-events-none font-medium",
              icon && "start-11",
              (isFocused || hasValue)
                ? "top-1.5 text-[10px] text-accent"
                : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60"
            )}
          >
            {label}
          </label>
        )}
        {/* Focus underline glow */}
        <motion.div
          className="absolute bottom-0 left-1/2 h-[2px] gradient-accent rounded-full"
          initial={{ width: 0, x: "-50%" }}
          animate={{
            width: isFocused ? "calc(100% - 1rem)" : 0,
            x: "-50%",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    );
  }
);
AnimatedInput.displayName = "AnimatedInput";

export { AnimatedInput };
