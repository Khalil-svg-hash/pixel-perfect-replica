import { useState, useRef, useCallback, ReactNode } from "react";
import { Loader2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
      startYRef.current = e.touches[0].clientY;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startYRef.current === null || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      // Apply resistance as pull increases
      const resistance = 1 - Math.min(diff / (MAX_PULL * 3), 0.6);
      const adjustedPull = Math.min(diff * resistance, MAX_PULL);
      setPullDistance(adjustedPull);
      
      // Prevent default scroll when pulling
      if (adjustedPull > 10) {
        e.preventDefault();
      }
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (startYRef.current === null) return;
    
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      // Trigger haptic feedback on supported devices
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD / 2);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    
    startYRef.current = null;
  }, [pullDistance, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldTrigger = pullDistance >= PULL_THRESHOLD;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center pointer-events-none z-10 transition-opacity"
        style={{
          top: pullDistance - 40,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border shadow-lg transition-all",
            shouldTrigger && "bg-accent border-accent"
          )}
        >
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          ) : (
            <ArrowDown
              className={cn(
                "h-5 w-5 transition-all duration-200",
                shouldTrigger ? "text-accent-foreground rotate-180" : "text-muted-foreground"
              )}
              style={{
                transform: `rotate(${shouldTrigger ? 180 : progress * 180}deg)`,
              }}
            />
          )}
        </div>
      </div>

      {/* Content with pull transform */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transitionDuration: startYRef.current !== null ? "0ms" : "200ms",
        }}
      >
        {children}
      </div>
    </div>
  );
}
