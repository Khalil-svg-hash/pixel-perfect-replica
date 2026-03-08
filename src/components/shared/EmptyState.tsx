import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      className={cn("flex flex-col items-center justify-center py-20 px-6 text-center", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-5"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon className="h-7 w-7 text-muted-foreground/70" strokeWidth={1.5} />
      </motion.div>
      <h3 className="font-display text-display-sm mb-2">{title}</h3>
      <p className="text-body-sm text-muted-foreground max-w-xs mb-8">{description}</p>
      {action && (
        <ShimmerButton onClick={action.onClick}>
          {action.label}
        </ShimmerButton>
      )}
    </motion.div>
  );
}
