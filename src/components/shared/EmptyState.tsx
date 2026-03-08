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
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in", className)}>
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-display text-display-sm mb-1">{title}</h3>
      <p className="text-body-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent">
          {action.label}
        </Button>
      )}
    </div>
  );
}
