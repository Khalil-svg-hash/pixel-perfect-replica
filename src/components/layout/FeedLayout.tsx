import React from "react";
import { cn } from "@/lib/utils";

interface FeedLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export function FeedLayout({ children, sidebar, className }: FeedLayoutProps) {
  return (
    <div className={cn("max-w-7xl mx-auto flex gap-8", className)}>
      {/* Main feed column */}
      <div className="flex-1 max-w-2xl mx-auto w-full">
        {children}
      </div>
      {/* Optional sidebar — hidden on mobile */}
      {sidebar && (
        <aside className="hidden lg:block w-80 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-5 pe-4">
          {sidebar}
        </aside>
      )}
    </div>
  );
}
