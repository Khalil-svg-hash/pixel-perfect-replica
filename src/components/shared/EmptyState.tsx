import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className={cn("flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in", className)}>
      <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-5 animate-float">
        <Icon className="h-7 w-7 text-muted-foreground/70" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-display-sm mb-2">{title}</h3>
      <p className="text-body-sm text-muted-foreground max-w-xs mb-8">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="gradient-accent text-white border-0 hover:opacity-90 shadow-accent transition-all duration-200 hover:shadow-lg px-6"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
