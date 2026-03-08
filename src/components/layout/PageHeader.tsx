import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn("sticky top-0 z-30 glass border-b border-border/50", className)}>
      <div className="flex items-center justify-between h-14 px-4">
        <div>
          <h1 className="font-display text-display-sm">{title}</h1>
          {subtitle && <p className="text-body-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
