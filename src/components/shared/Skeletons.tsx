import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function PostCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 border-b border-border animate-fade-in", className)}>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="flex gap-8 pt-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-fade-in">
      <Skeleton className="h-36 w-full" />
      <div className="px-4 -mt-10 space-y-3">
        <Skeleton className="h-20 w-20 rounded-full border-4 border-background" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-full max-w-xs" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
