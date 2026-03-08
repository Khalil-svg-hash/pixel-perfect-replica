import React from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <main className="md:ms-[272px] pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
