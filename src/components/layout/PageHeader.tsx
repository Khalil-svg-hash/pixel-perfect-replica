import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn("sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border", className)}>
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
